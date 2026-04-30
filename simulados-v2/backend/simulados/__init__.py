# Configura o Celery ao iniciar o Django
from .celery import app as celery_app
__all__ = ('celery_app',)
