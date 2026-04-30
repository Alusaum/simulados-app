"""
settings/development.py
Configurações específicas para desenvolvimento local.
"""

from .base import *

DEBUG = True

ALLOWED_HOSTS = ['*']

# Em dev, mostra e-mails no console
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Django Debug Toolbar (opcional, instale se quiser)
INTERNAL_IPS = ['127.0.0.1']

# Logs verbosos no terminal
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {'class': 'logging.StreamHandler'},
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'DEBUG',  # Mostra queries SQL
            'propagate': False,
        },
    },
}
