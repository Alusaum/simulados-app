"""
apps/users/tasks.py
Tarefas assíncronas do Celery relacionadas a usuários.
Exemplo: envio de e-mail de redefinição de senha em background.
"""

from celery import shared_task
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings

User = get_user_model()


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_password_reset_email(self, user_id: str):
    """
    Envia e-mail com link de redefinição de senha.
    Tenta até 3 vezes em caso de falha (retry automático).
    """
    try:
        user  = User.objects.get(id=user_id)
        token = default_token_generator.make_token(user)
        uid   = str(user.id)

        reset_url = f"{settings.FRONTEND_URL}/auth/reset-password?uid={uid}&token={token}"

        send_mail(
            subject    = 'Redefinição de senha — SimulaAí',
            message    = f'Olá, {user.name}!\n\nClique no link abaixo para redefinir sua senha:\n{reset_url}\n\nO link expira em 1 hora.',
            from_email = settings.DEFAULT_FROM_EMAIL,
            recipient_list = [user.email],
            fail_silently  = False,
        )
    except User.DoesNotExist:
        pass  # Usuário deletado entre a chamada e a execução
    except Exception as exc:
        # Retry automático em caso de falha no envio
        raise self.retry(exc=exc)


@shared_task
def sync_offline_attempts(user_id: str, attempts: list):
    """
    Processa tentativas realizadas offline no app mobile.
    Recebe lista de attempts, calcula scores e persiste no banco.
    """
    from apps.resultados.models import Attempt, AttemptAnswer
    from apps.simulados.models  import Question

    for data in attempts:
        simulado_id = data.get('simulado_id')
        answers     = data.get('answers', {})

        # Busca questões e calcula score
        questions = Question.objects.filter(simulado_id=simulado_id)
        score     = sum(
            1 for q in questions
            if answers.get(str(q.id)) == q.correct_option
        )

        attempt = Attempt.objects.create(
            user_id         = user_id,
            simulado_id     = simulado_id,
            score           = score,
            total_questions = questions.count(),
            time_taken      = data.get('time_taken', 0),
            status          = 'completed',
            started_at      = data.get('started_at'),
            completed_at    = data.get('completed_at'),
        )

        # Cria as respostas individuais
        AttemptAnswer.objects.bulk_create([
            AttemptAnswer(
                attempt_id    = attempt.id,
                question_id   = q.id,
                chosen_option = answers.get(str(q.id)),
                is_correct    = answers.get(str(q.id)) == q.correct_option,
            )
            for q in questions
        ])
