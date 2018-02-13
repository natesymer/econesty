from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django.contrib.postgres.fields import JSONField

from .fields import WIFPrivateKeyField

from safedelete.models import SafeDeleteModel

import uuid
from hashlib import sha1
import hmac
import re

class BaseModel(SafeDeleteModel):
  created_at = models.DateTimeField(default=timezone.now)

  def __str__(self):
    return "<" + type(self).__name__ + " id: " + str(self.id) + ", created_at: " + str(self.created_at) + ">"

  class Meta:
    abstract = True

class Token(BaseModel):
  def make_key():
    return hmac.new(uuid.uuid4().bytes, digestmod=sha1).hexdigest()

  user = models.ForeignKey(User, on_delete=models.CASCADE)
  key = models.CharField(max_length=128, default=make_key, db_index=True)

  @classmethod
  def read_token(cls, request):
    if 'HTTP_AUTHORIZATION' in request.META:
      auth_header = request.META['HTTP_AUTHORIZATION']
      vals_iter = iter(re.split(re.compile(r'\s+', re.U), auth_header, 1))
      if next(vals_iter, None) == "Token": # ensure we're using token auth
        try:
          token = next(vals_iter, None)
          if token is not None:
            return cls.objects.get(key=token)
        except cls.DoesNotExist:
          pass
    return None

class Wallet(BaseModel):
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  private_key = WIFPrivateKeyField()

  @property
  def address(self):
    return self.private_key.address

  @property
  def balance(self):
    return self.private_key.get_balance('btc')

class Transaction(BaseModel):
  buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="api_trans_buyer")
  seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name="api_trans_seller")
  buyer_wallet = models.ForeignKey(Wallet, on_delete=models.SET_NULL, null=True, related_name="api_trans_buyer_wallet")
  seller_wallet = models.ForeignKey(Wallet, on_delete=models.SET_NULL, null=True, related_name="api_trans_seller_wallet")
  amount = models.DecimalField(max_digits=11, decimal_places=8)
  success = models.BooleanField(default=False) # Whether or not the transaction
                                               # succeeded - i.e. payment went
                                               # through.

  @property
  def completed(self):
    if not self.buyer_wallet or not self.seller_wallet:
      return False

    # TODO: optimization: use query, not python for this
    rqs = Requirement.objects.filter(transaction__id=self.id)
    for req in rqs:
      if not req.fulfilled:
        return False
    return True

  def finalize(self):
    print("MAKING TRANSACTION", {"from": self.buyer_wallet.private_key, "to": self.seller_wallet.private_key.address, "amount": self.amount})
    try: 
      self.buyer_wallet.private_key.send([
        (self.seller_wallet.private_key.address, float(self.amount), 'btc')
      ])
      # An error will be raised here if there's a problem, and success will
      # never set to True
      self.success = True
      self.save()
    except:
      pass # TODO: record the error

class Requirement(BaseModel):
  user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='api_req_user')
  text = models.TextField(blank=True, null=True)
  transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name='api_req_transaction')
  signature = models.TextField(blank=True, null=True) # just a string for now
  acknowledged = models.BooleanField(default=False)

  @property
  def fulfilled(self):
    return self.acknowledged and bool(self.signature)

