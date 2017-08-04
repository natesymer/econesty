"""econesty URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import include, url
from django.conf import settings
from django.http import StreamingHttpResponse

from . import api

import os
import mimetypes

def file_exists(path):
  try:
    if os.path.isdir(path):
      return False
    os.stat(path)
    return True
  except os.error:
    return False

def frontend(request, path):
  full_path = os.path.join(settings.FRONTEND_PATH, path)

  if not file_exists(full_path):
    full_path = os.path.join(settings.FRONTEND_PATH, 'index.html')

  if file_exists(full_path + ".gz"):
    full_path += ".gz";

  response = StreamingHttpResponse((line for line in open(full_path, 'rb')))

  if full_path.endswith(".map"):
    mimetype, enctype = mimetypes.guess_type(os.path.splitext(full_path)[0])
  else:
    mimetype, enctype = mimetypes.guess_type(full_path)

  if full_path.endswith(".gz"):
    enctype = enctype or "gzip"

  response['Content-Length'] = os.path.getsize(full_path)
  if mimetype is not None:
    response['Content-Type'] = mimetype
  if enctype is not None:
    response['Content-Encoding'] = enctype
  return response

urlpatterns = [
  url(r'^api/', include('econesty.api.urls')),
  url(r'^(?P<path>.*)\Z', frontend, name="frontend")
]
