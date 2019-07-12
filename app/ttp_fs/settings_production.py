import django_heroku
from .settings_common import *

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Configure Django App for Heroku.
django_heroku.settings(
    locals(),
    staticfiles=False,
    test_runner=False
)
