"""
apps/simulados/admin.py
Painel admin para simulados e questões com inline de questões.
"""

from django.contrib import admin
from .models import Simulado, Question


class QuestionInline(admin.TabularInline):
    """Permite editar questões diretamente na página do simulado."""
    model  = Question
    extra  = 1
    fields = ('order', 'statement', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option')


@admin.register(Simulado)
class SimuladoAdmin(admin.ModelAdmin):
    list_display    = ('title', 'subject', 'difficulty', 'time_limit', 'question_count', 'is_active', 'created_at')
    list_filter     = ('difficulty', 'is_active', 'subject')
    search_fields   = ('title', 'description', 'subject')
    readonly_fields = ('created_at', 'updated_at')
    inlines         = [QuestionInline]

    def question_count(self, obj):
        return obj.question_count
    question_count.short_description = 'Questões'


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display  = ('simulado', 'order', 'statement_preview', 'correct_option')
    list_filter   = ('simulado', 'correct_option')
    search_fields = ('statement',)

    def statement_preview(self, obj):
        return obj.statement[:60] + '...' if len(obj.statement) > 60 else obj.statement
    statement_preview.short_description = 'Enunciado'
