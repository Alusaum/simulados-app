"""
apps/users/admin.py
Configuração do painel admin para usuários.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display    = ('email', 'name', 'is_active', 'is_staff', 'created_at')
    list_filter     = ('is_active', 'is_staff')
    search_fields   = ('email', 'name')
    ordering        = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        (None,            {'fields': ('email', 'password')}),
        ('Informações',   {'fields': ('name',)}),
        ('Permissões',    {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Datas',         {'fields': ('last_login', 'created_at', 'updated_at')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields':  ('email', 'name', 'password1', 'password2'),
        }),
    )
