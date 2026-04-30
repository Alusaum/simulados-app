"""
simulados/wsgi.py
Ponto de entrada WSGI para servidores de produção (Gunicorn).
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'simulados.settings.development')

application = get_wsgi_application()
