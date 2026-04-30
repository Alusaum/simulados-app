"""
apps/resultados/api.py
Endpoints de tentativas: iniciar, salvar, finalizar, histórico e ranking.
Todos exigem autenticação JWT.
"""

import uuid
from typing import List
from datetime import datetime, timezone

from django.db import transaction
from django.db.models import Avg, Max, Count, Sum
from ninja import Router
from ninja.errors import HttpError
from ninja.security import HttpBearer
from rest_framework_simplejwt.authentication import JWTAuthentication

from apps.simulados.models import Simulado, Question
from .models  import Attempt, AttemptAnswer
from .schemas import (
    StartAttemptSchema, FinishAttemptSchema, SaveAnswersSchema,
    AttemptResultOut, AttemptHistoryOut, RankingItemOut,
    AnswerDetailOut, SyncOfflineSchema,
)


# ── Auth ──────────────────────────────────────────────────────────────────────

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


router = Router(tags=['Resultados'], auth=JWTAuth())


# ── POST /api/resultados/start/ ───────────────────────────────────────────────

@router.post('/start/', summary='Iniciar tentativa')
def start_attempt(request, payload: StartAttemptSchema):
    """
    Cria uma nova tentativa com status 'in_progress'.
    Retorna o ID da tentativa para uso nas próximas chamadas.
    """
    try:
        simulado = Simulado.objects.get(id=payload.simulado_id, is_active=True)
    except Simulado.DoesNotExist:
        raise HttpError(404, 'Simulado não encontrado.')

    attempt = Attempt.objects.create(
        user            = request.user,
        simulado        = simulado,
        total_questions = simulado.question_count,
        status          = 'in_progress',
    )

    return {
        'attempt_id':     str(attempt.id),
        'simulado_title': simulado.title,
        'total_questions': simulado.question_count,
        'time_limit':     simulado.time_limit,
    }


# ── PATCH /api/resultados/{attempt_id}/ ──────────────────────────────────────

@router.patch('/{attempt_id}/', summary='Salvar respostas parciais')
def save_answers(request, attempt_id: str, payload: SaveAnswersSchema):
    """
    Salva respostas parciais sem finalizar a tentativa.
    Permite ao usuário fechar o app e retomar depois.
    """
    attempt = _get_attempt(attempt_id, request.user)
    _upsert_answers(attempt, payload.answers)
    return {'message': 'Respostas salvas com sucesso.'}


# ── POST /api/resultados/{attempt_id}/finish/ ─────────────────────────────────

@router.post('/{attempt_id}/finish/', response=AttemptResultOut, summary='Finalizar tentativa')
@transaction.atomic
def finish_attempt(request, attempt_id: str, payload: FinishAttemptSchema):
    """
    Finaliza a tentativa, calcula o score e retorna resultado completo
    com gabarito comentado de cada questão.
    """
    attempt = _get_attempt(attempt_id, request.user)

    if attempt.status == 'completed':
        raise HttpError(400, 'Esta tentativa já foi finalizada.')

    questions = list(attempt.simulado.questions.all())

    # Persiste respostas e calcula score
    score = 0
    _upsert_answers(attempt, payload.answers)

    for q in questions:
        chosen = payload.answers.get(str(q.id))
        if chosen == q.correct_option:
            score += 1

    # Finaliza a tentativa
    attempt.score        = score
    attempt.time_taken   = payload.time_taken
    attempt.status       = 'completed'
    attempt.completed_at = datetime.now(timezone.utc)
    attempt.save()

    # Atualiza is_correct nas respostas
    AttemptAnswer.objects.filter(attempt=attempt).update(is_correct=False)
    for q in questions:
        chosen = payload.answers.get(str(q.id))
        AttemptAnswer.objects.filter(attempt=attempt, question=q).update(
            chosen_option = chosen,
            is_correct    = chosen == q.correct_option,
        )

    # Monta resposta detalhada
    answers_out = []
    for q in questions:
        chosen = payload.answers.get(str(q.id))
        answers_out.append(AnswerDetailOut(
            question_id    = q.id,
            statement      = q.statement,
            option_a       = q.option_a,
            option_b       = q.option_b,
            option_c       = q.option_c,
            option_d       = q.option_d,
            chosen_option  = chosen,
            correct_option = q.correct_option,
            explanation    = q.explanation,
            is_correct     = chosen == q.correct_option,
        ))

    return AttemptResultOut(
        attempt_id     = attempt.id,
        simulado_title = attempt.simulado.title,
        score          = score,
        total          = len(questions),
        percentage     = round((score / len(questions)) * 100) if questions else 0,
        time_taken     = payload.time_taken,
        answers        = answers_out,
    )


# ── GET /api/resultados/history/ ─────────────────────────────────────────────

@router.get('/history/', response=List[AttemptHistoryOut], summary='Histórico do usuário')
def get_history(request):
    """Retorna todas as tentativas finalizadas do usuário logado."""
    attempts = Attempt.objects.filter(
        user   = request.user,
        status = 'completed',
    ).select_related('simulado').order_by('-completed_at')

    return [
        AttemptHistoryOut(
            id              = a.id,
            simulado_id     = a.simulado.id,
            simulado_title  = a.simulado.title,
            score           = a.score,
            total_questions = a.total_questions,
            percentage      = a.percentage,
            time_taken      = a.time_taken,
            completed_at    = a.completed_at.isoformat() if a.completed_at else None,
        )
        for a in attempts
    ]


# ── GET /api/resultados/{attempt_id}/ ────────────────────────────────────────

@router.get('/{attempt_id}/', response=AttemptResultOut, summary='Detalhe de uma tentativa')
def get_attempt_detail(request, attempt_id: str):
    """Retorna resultado completo de uma tentativa específica."""
    attempt   = _get_attempt(attempt_id, request.user)
    questions = list(attempt.simulado.questions.all())
    answers   = {str(a.question_id): a for a in attempt.answers.select_related('question')}

    answers_out = []
    for q in questions:
        ans = answers.get(str(q.id))
        answers_out.append(AnswerDetailOut(
            question_id    = q.id,
            statement      = q.statement,
            option_a       = q.option_a,
            option_b       = q.option_b,
            option_c       = q.option_c,
            option_d       = q.option_d,
            chosen_option  = ans.chosen_option if ans else None,
            correct_option = q.correct_option,
            explanation    = q.explanation,
            is_correct     = ans.is_correct if ans else False,
        ))

    return AttemptResultOut(
        attempt_id     = attempt.id,
        simulado_title = attempt.simulado.title,
        score          = attempt.score,
        total          = attempt.total_questions,
        percentage     = attempt.percentage,
        time_taken     = attempt.time_taken,
        answers        = answers_out,
    )


# ── GET /api/resultados/ranking/ ─────────────────────────────────────────────

@router.get('/ranking/', response=List[RankingItemOut], summary='Ranking global', auth=None)
def get_ranking(request):
    """
    Ranking público com os 20 melhores usuários por média de desempenho.
    Este endpoint NÃO exige autenticação.
    """
    from django.contrib.auth import get_user_model
    User = get_user_model()

    stats = (
        Attempt.objects
        .filter(status='completed')
        .values('user_id', 'user__name')
        .annotate(
            total_attempts  = Count('id'),
            avg_percentage  = Avg('score' * 100.0 / 'total_questions'),
            best_score      = Max('score'),
            total_correct   = Sum('score'),
        )
        .order_by('-avg_percentage', '-total_correct')[:20]
    )

    result = []
    for i, s in enumerate(stats, 1):
        # Calcula best_percentage separadamente para precisão
        best = (
            Attempt.objects
            .filter(user_id=s['user_id'], status='completed')
            .order_by('-score')
            .first()
        )
        best_pct = best.percentage if best else 0

        result.append(RankingItemOut(
            position        = i,
            user_id         = s['user_id'],
            user_name       = s['user__name'],
            total_attempts  = s['total_attempts'],
            avg_percentage  = round(s['avg_percentage'] or 0, 1),
            best_percentage = best_pct,
            total_correct   = s['total_correct'] or 0,
        ))

    return result


# ── POST /api/resultados/sync/ ────────────────────────────────────────────────

@router.post('/sync/', summary='Sincronizar tentativas offline (mobile)')
def sync_offline(request, payload: SyncOfflineSchema):
    """
    Recebe lista de tentativas realizadas offline no app Flutter.
    Processa em background via Celery e retorna confirmação.
    """
    from apps.users.tasks import sync_offline_attempts
    sync_offline_attempts.delay(str(request.user.id), payload.attempts)
    return {'message': f'{len(payload.attempts)} tentativa(s) enviada(s) para sincronização.'}


# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_attempt(attempt_id: str, user) -> Attempt:
    """Busca tentativa garantindo que pertence ao usuário logado."""
    try:
        return Attempt.objects.select_related('simulado').get(
            id=attempt_id, user=user
        )
    except Attempt.DoesNotExist:
        raise HttpError(404, 'Tentativa não encontrada.')


def _upsert_answers(attempt: Attempt, answers: dict):
    """Cria ou atualiza respostas individuais de uma tentativa."""
    questions = {str(q.id): q for q in attempt.simulado.questions.all()}
    for q_id, chosen in answers.items():
        q = questions.get(q_id)
        if q:
            AttemptAnswer.objects.update_or_create(
                attempt  = attempt,
                question = q,
                defaults = {
                    'chosen_option': chosen,
                    'is_correct':    chosen == q.correct_option,
                },
            )
