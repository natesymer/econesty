from django.http import HttpResponseRedirect
from django.conf import settings
import re
from . import models
from django.contrib.auth.models import AnonymousUser

def RewriteMeToUserID(get_response):
  MATCH_API_ROOT = re.compile(settings.API_ROOT)
  MATCH_ME_REGEX = re.compile(r'/me($|/)')
  REPLACE_ME_REGEX = re.compile(r'(?<=/)me(?=$|/)') # only use lookaround if we have a match.

  def middleware(request):
    user = getattr(request, "user", None)
    matchpi = request.path_info[1:]
    if re.search(MATCH_API_ROOT, matchpi) is not None and re.search(MATCH_ME_REGEX, matchpi) is not None:
      if not user.is_authenticated:
        if settings.DEBUG:
          print("unauthenticated `me` url: " + request.path_info)
      else:
        # Don't use a Location redirect to avoid losing POST bodies.
        request.path_info = re.sub(REPLACE_ME_REGEX, str(user.id), request.path_info)
        request.path = request.path_info # DRF appeasement

    return get_response(request)
  return middleware

# Resets auth state to reflect an unauthorized state.
def ResetAuth(get_response):
  def middleware(request):
    request.user = AnonymousUser()
    request.auth = None

    # DRF appeasement
    request._user = AnonymousUser()
    request._auth = None
    return get_response(request)
  return middleware

# Load authentication information for any "Authorization: Token *" headers.
def TokenAuth(get_response):
  def middleware(request):
    tok = models.Token.read_token(request)
    if tok is not None:
      request.user = tok.user
      request.auth = tok

      # DRF appeasement
      request._user = tok.user
      request._auth = tok
    return get_response(request)
  return middleware

def AppendSlashNoRedirect(get_response):
  def middleware(request):
    if not request.path_info.endswith('/'):
      request.path_info += "/"
    if not request.path.endswith('/'):
      request.path += "/"
    return get_response(request)
  return middleware
