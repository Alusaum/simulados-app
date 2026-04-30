"""
simulados/urls.py
Roteamento principal — monta a API Ninja e o admin.
"""

from django.contrib import admin
from django.urls import path
from ninja import NinjaAPI
from ninja.security import HttpBearer
from rest_framework_simplejwt.authentication import JWTAuthentication

# ── Importa os routers de cada app ────────────────────────────────────────────
from apps.users.api      import router as users_router
from apps.simulados.api  import router as simulados_router
from apps.resultados.api import router as resultados_router


# ── Autenticação JWT para o Ninja ─────────────────────────────────────────────
class JWTAuth(HttpBearer):
    """
    Middleware de autenticação JWT para o Django Ninja.
    Extrai e valida o Bearer token em rotas protegidas.
    """
    def authenticate(self, request, token: str):
        jwt_auth = JWTAuthentication()
        try:
            validated = jwt_auth.get_validated_token(
                jwt_auth.get_raw_token(
                    jwt_auth.get_header(
                        type('Request', (), {'META': {'HTTP_AUTHORIZATION': f'Bearer {token}'}})()
                    )
                )
            )
            user = jwt_auth.get_user(validated)
            request.user = user
            return user
        except Exception:
            return None


# ── API Ninja principal ───────────────────────────────────────────────────────
api = NinjaAPI(
    title       = 'SimulaAí API',
    version     = '1.0.0',
    description = 'API RESTful da plataforma de simulados educacionais.',
    docs_url    = '/docs',   # Swagger em /api/docs
)

api.add_router('/auth/',       users_router)
api.add_router('/simulados/',  simulados_router)
api.add_router('/resultados/', resultados_router)

# ── URL patterns ──────────────────────────────────────────────────────────────
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/',   api.urls),
]
