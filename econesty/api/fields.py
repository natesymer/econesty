from django.db import models
from django import forms
from django.core.exceptions import ValidationError

class PointsField(models.TextField):
  description = "A field to store a signature's points as a textual comma-separated list."

  def get_db_prep_value(self, value, *args, **kwargs):
    if value is None or isinstance(value, str):
      return value
    try:
      flat_value = [str(item) for pair in value for item in pair]
      return flat_value.join(",")
    except (TypeError, ValueError):
      raise ValidationError("This value must be a list of two-tuples.")

  def to_python(self, value):
    if value is None or isinstance(value, list):
      return value
    try:
      integers = map(lambda x:int(x), value.split(","))
      return zip(integers[::2], integers[1::2])
    except (TypeError, ValueError):
      raise ValidationError("This value must be an integer or a string represents an integer.")

  def from_db_value(self, value, expression, connection, context):
    return self.to_python(value)
