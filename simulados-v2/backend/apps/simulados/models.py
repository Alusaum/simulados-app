"""
apps/simulados/models.py
Models de Simulado e Questão com todos os campos necessários.
"""

import uuid
from django.db import models


class Simulado(models.Model):
    """Representa um simulado com suas configurações."""

    DIFFICULTY_CHOICES = [
        ('easy',   'Fácil'),
        ('medium', 'Médio'),
        ('hard',   'Difícil'),
    ]

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title       = models.CharField(max_length=200, verbose_name='Título')
    description = models.TextField(blank=True, verbose_name='Descrição')
    subject     = models.CharField(max_length=100, blank=True, verbose_name='Disciplina')
    difficulty  = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    time_limit  = models.PositiveIntegerField(default=30, verbose_name='Tempo limite (min)')
    is_active   = models.BooleanField(default=True, verbose_name='Ativo')
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table            = 'simulados'
        ordering            = ['-created_at']
        verbose_name        = 'Simulado'
        verbose_name_plural = 'Simulados'

    def __str__(self):
        return self.title

    @property
    def question_count(self):
        return self.questions.count()


class Question(models.Model):
    """Questão pertencente a um simulado."""

    OPTION_CHOICES = [('a', 'A'), ('b', 'B'), ('c', 'C'), ('d', 'D')]

    id             = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    simulado       = models.ForeignKey(
        Simulado,
        on_delete    = models.CASCADE,
        related_name = 'questions',
    )
    statement      = models.TextField(verbose_name='Enunciado')
    option_a       = models.TextField(verbose_name='Alternativa A')
    option_b       = models.TextField(verbose_name='Alternativa B')
    option_c       = models.TextField(verbose_name='Alternativa C')
    option_d       = models.TextField(verbose_name='Alternativa D')
    correct_option = models.CharField(max_length=1, choices=OPTION_CHOICES, verbose_name='Resposta correta')
    explanation    = models.TextField(blank=True, verbose_name='Explicação')
    order          = models.PositiveIntegerField(default=0, verbose_name='Ordem')

    class Meta:
        db_table            = 'questions'
        ordering            = ['order', 'id']
        verbose_name        = 'Questão'
        verbose_name_plural = 'Questões'

    def __str__(self):
        return f'Q{self.order} — {self.simulado.title}'
