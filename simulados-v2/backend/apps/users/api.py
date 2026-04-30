"""
apps/users/api.py
Endpoints de autenticação: registro, login e refresh de token.
Usa Django Ninja (tipagem automática + OpenAPI/Swagger).
"""

from django.contrib.auth import get_user_model
from ninja import Router
from ninja.errors import HttpError
from rest_framework_simplejwt.tokens import RefreshToken

from .schemas import (
    RegisterSchema, LoginSchema,
    TokenOut, UserOut, MessageOut,
    PasswordResetRequestSchema,
)

router = Router(tags=['Auth'])
User   = get_user_model()


def _make_tokens(user) -> dict:
    """Gera par de tokens JWT (access + refresh) para o usuário."""
    refresh = RefreshToken.for_user(user)
    return {
        'access':  str(refresh.access_token),
        'refresh': str(refresh),
        'user':    UserOut.from_orm_str(user),
    }


# POST /api/auth/register/
@router.post('/register/', response=TokenOut, summary='Criar conta')
def register(request, payload: RegisterSchema):
    """
    Cria um novo usuário e retorna tokens JWT prontos para uso.
    Retorna 409 se o e-mail já estiver cadastrado.
    """
    if User.objects.filter(email=payload.email).exists():
        raise HttpError(409, 'Este e-mail já está cadastrado.')

    user = User.objects.create_user(
        email    = payload.email,
        name     = payload.name,
        password = payload.password,
    )
    return _make_tokens(user)


# POST /api/auth/login/
@router.post('/login/', response=TokenOut, summary='Login')
def login(request, payload: LoginSchema):
    """
    Autentica com e-mail e senha.
    Retorna 401 se as credenciais forem inválidas.
    """
    try:
        user = User.objects.get(email=payload.email)
    except User.DoesNotExist:
        raise HttpError(401, 'Credenciais inválidas.')

    if not user.check_password(payload.password):
        raise HttpError(401, 'Credenciais inválidas.')

    if not user.is_active:
        raise HttpError(403, 'Conta desativada. Entre em contato com o suporte.')

    return _make_tokens(user)


# POST /api/auth/refresh/
@router.post('/refresh/', summary='Renovar token de acesso')
def refresh_token(request, refresh: str):
    """
    Recebe um refresh token válido e retorna um novo access token.
    """
    try:
        token = RefreshToken(refresh)
        return {'access': str(token.access_token)}
    except Exception:
        raise HttpError(401, 'Refresh token inválido ou expirado.')


# POST /api/auth/password-reset/
@router.post('/password-reset/', response=MessageOut, summary='Solicitar redefinição de senha')
def password_reset_request(request, payload: PasswordResetRequestSchema):
    """
    Dispara e-mail com link de redefinição de senha via Celery.
    Retorna 200 mesmo se o e-mail não existir (segurança).
    """
    from apps.users.tasks import send_password_reset_email
    try:
        user = User.objects.get(email=payload.email)
        send_password_reset_email.delay(str(user.id))
    except User.DoesNotExist:
        pass  # Não revela se o e-mail existe

    return {'message': 'Se o e-mail estiver cadastrado, você receberá as instruções em breve.'}
