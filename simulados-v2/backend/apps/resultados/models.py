"""
apps/resultados/models.py
Models de Attempt (tentativa) e AttemptAnswer (resposta individual).
"""

import uuid
from django.conf import settings
from django.db import models
from apps.simulados.models import Simulado, Question


class Attempt(models.Model):
    """
    Registra uma tentativa de simulado feita por um usuário.
    Pode estar em progresso (in_progress) ou finalizada (completed).
    """

    STATUS_CHOICES = [
        ('in_progress', 'Em progresso'),
        ('completed',   'Finalizado'),
    ]

    id              = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user            = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete    = models.CASCADE,
        related_name = 'attempts',
    )
    simulado        = models.ForeignKey(
        Simulado,
        on_delete    = models.CASCADE,
        related_name = 'attempts',
    )
    score           = models.PositiveIntegerField(default=0, verbose_name='Acertos')
    total_questions = models.PositiveIntegerField(verbose_name='Total de questões')
    time_taken      = models.PositiveIntegerField(default=0, verbose_name='Tempo gasto (seg)')
    status          = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress')
    started_at      = models.DateTimeField(auto_now_add=True)
    completed_at    = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table            = 'attempts'
        ordering            = ['-started_at']
        verbose_name        = 'Tentativa'
        verbose_name_plural = 'Tentativas'

    def __str__(self):
        return f'{self.user.name} — {self.simulado.title} ({self.percentage}%)'

    @property
    def percentage(self):
        if self.total_questions == 0:
            return 0
        return round((self.score / self.total_questions) * 100)


class AttemptAnswer(models.Model):
    """
    Resposta do usuário para cada questão dentro de uma tentativa.
    """

    OPTION_CHOICES = [('a', 'A'), ('b', 'B'), ('c', 'C'), ('d', 'D')]

    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    attempt       = models.ForeignKey(
        Attempt,
        on_delete    = models.CASCADE,
        related_name = 'answers',
    )
    question      = models.ForeignKey(
        Question,
        on_delete = models.CASCADE,
    )
    chosen_option = models.CharField(
        max_length=1, choices=OPTION_CHOICES,
        null=True, blank=True,
        verbose_name='Alternativa escolhida',
    )
    is_correct    = models.BooleanField(default=False)

    class Meta:
        db_table            = 'attempt_answers'
        unique_together     = [('attempt', 'question')]
        verbose_name        = 'Resposta'
        verbose_name_plural = 'Respostas'

    def __str__(self):
        return f'{self.attempt} — Q{self.question.order}: {self.chosen_option} ({"✓" if self.is_correct else "✗"})'
