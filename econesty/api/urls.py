from django.conf.urls import url, include
from . import views
from rest_framework import routers
import rest_framework.authtoken.views as aviews

router = routers.SimpleRouter()
router.register(r'user', views.UserViewSet, base_name=r'user')
router.register(r'transaction', views.TransactionViewSet, base_name=r'transaction')
router.register(r'counter_signature', views.CounterSignatureViewSet, base_name=r'counter_signature')
router.register(r'payment_data', views.PaymentDataViewSet, base_name=r'payment_data')

urlpatterns = [
  url(r'^', include(router.urls)),
  url(r'^token/', aviews.obtain_auth_token),
]
