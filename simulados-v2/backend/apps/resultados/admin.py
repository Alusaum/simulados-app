"""
apps/resultados/admin.py
Painel admin para tentativas com inline de respostas.
"""

from django.contrib import admin
from .models import Attempt, AttemptAnswer


class AttemptAnswerInline(admin.TabularInline):
    model       = AttemptAnswer
    extra       = 0
    readonly_fields = ('question', 'chosen_option', 'is_correct')
    can_delete  = False


@admin.register(Attempt)
class AttemptAdmin(admin.ModelAdmin):
    list_display    = ('user', 'simulado', 'score', 'total_questions', 'percentage', 'status', 'completed_at')
    list_filter     = ('status', 'simulado')
    search_fields   = ('user__email', 'user__name', 'simulado__title')
    readonly_fields = ('started_at', 'completed_at')
    inlines         = [AttemptAnswerInline]

    def percentage(self, obj):
        return f'{obj.percentage}%'
    percentage.short_description = 'Desempenho'
