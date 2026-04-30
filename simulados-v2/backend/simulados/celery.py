"""
simulados/celery.py
Configuração do Celery para tarefas assíncronas.
Exemplos de uso: envio de e-mail, sincronização offline→online.
"""

import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'simulados.settings.development')

app = Celery('simulados')

# Lê configurações com prefixo CELERY_ do settings Django
app.config_from_object('django.conf:settings', namespace='CELERY')

# Descobre automaticamente tasks em todos os apps instalados
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Task de diagnóstico — útil para testar se o Celery está rodando."""
    print(f'Request: {self.request!r}')
