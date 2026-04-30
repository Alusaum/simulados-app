"""
apps/simulados/api.py
Endpoints de simulados e questões — listagem, detalhe e gabarito.
"""

from typing import List
from ninja import Router
from ninja.errors import HttpError
from ninja.security import HttpBearer
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import Simulado
from .schemas import SimuladoListOut, SimuladoDetailOut, QuestionWithAnswerOut


# ── Auth reutilizável ─────────────────────────────────────────────────────────

class JWTAuth(HttpBearer):
    def authenticate(self, request, token):
        jwt = JWTAuthentication()
        try:
            validated = jwt.get_validated_token(token.encode())
            user = jwt.get_user(validated)
            request.user = user
            return user
        except Exception:
            return None


router = Router(tags=['Simulados'])


# GET /api/simulados/
@router.get('/', response=List[SimuladoListOut], summary='Listar simulados')
def list_simulados(request, subject: str = None, difficulty: str = None):
    """
    Retorna todos os simulados ativos.
    Aceita filtros opcionais por disciplina e dificuldade.
    """
    from apps.resultados.models import Attempt

    qs = Simulado.objects.filter(is_active=True).prefetch_related('questions')

    if subject:
        qs = qs.filter(subject__icontains=subject)
    if difficulty:
        qs = qs.filter(difficulty=difficulty)

    result = []
    for s in qs:
        attempt_count = Attempt.objects.filter(simulado=s).count()
        result.append(SimuladoListOut(
            id             = s.id,
            title          = s.title,
            description    = s.description,
            subject        = s.subject,
            difficulty     = s.difficulty,
            time_limit     = s.time_limit,
            question_count = s.question_count,
            attempt_count  = attempt_count,
        ))
    return result


# GET /api/simulados/{id}/
@router.get('/{simulado_id}/', response=SimuladoDetailOut, summary='Detalhe do simulado')
def get_simulado(request, simulado_id: str):
    """
    Retorna o simulado com todas as questões.
    NÃO inclui o gabarito — isso é retornado só após finalizar.
    """
    try:
        s = Simulado.objects.prefetch_related('questions').get(
            id=simulado_id, is_active=True
        )
    except Simulado.DoesNotExist:
        raise HttpError(404, 'Simulado não encontrado.')

    return SimuladoDetailOut(
        id          = s.id,
        title       = s.title,
        description = s.description,
        subject     = s.subject,
        difficulty  = s.difficulty,
        time_limit  = s.time_limit,
        questions   = [
            {
                'id':        q.id,
                'statement': q.statement,
                'option_a':  q.option_a,
                'option_b':  q.option_b,
                'option_c':  q.option_c,
                'option_d':  q.option_d,
                'order':     q.order,
            }
            for q in s.questions.all()
        ],
    )


# GET /api/simulados/{id}/answers/
@router.get(
    '/{simulado_id}/answers/',
    response=List[QuestionWithAnswerOut],
    auth=JWTAuth(),
    summary='Gabarito completo (requer login)',
)
def get_answers(request, simulado_id: str):
    """
    Retorna gabarito e explicações — disponível apenas para usuários
    autenticados e somente após iniciar uma tentativa.
    """
    try:
        s = Simulado.objects.prefetch_related('questions').get(id=simulado_id)
    except Simulado.DoesNotExist:
        raise HttpError(404, 'Simulado não encontrado.')

    return [
        {
            'id':             q.id,
            'statement':      q.statement,
            'option_a':       q.option_a,
            'option_b':       q.option_b,
            'option_c':       q.option_c,
            'option_d':       q.option_d,
            'order':          q.order,
            'correct_option': q.correct_option,
            'explanation':    q.explanation,
        }
        for q in s.questions.all()
    ]
