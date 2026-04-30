"""
apps/users/models.py
Model de usuário customizado — estende AbstractBaseUser para
ter controle total sobre os campos de autenticação.
"""

import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    """Manager customizado — usa email como identificador único."""

    def create_user(self, email, name, password=None, **extra):
        if not email:
            raise ValueError('O e-mail é obrigatório.')
        email = self.normalize_email(email)
        user  = self.model(email=email, name=name, **extra)
        user.set_password(password)   # bcrypt via Django
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra):
        extra.setdefault('is_staff',     True)
        extra.setdefault('is_superuser', True)
        return self.create_user(email, name, password, **extra)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Usuário da plataforma.
    Usa UUID como PK para evitar exposição de IDs sequenciais.
    """

    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email      = models.EmailField(unique=True, db_index=True)
    name       = models.CharField(max_length=150)
    is_active  = models.BooleanField(default=True)
    is_staff   = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects  = UserManager()

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        db_table  = 'users'
        ordering  = ['-created_at']
        verbose_name        = 'Usuário'
        verbose_name_plural = 'Usuários'

    def __str__(self):
        return f'{self.name} <{self.email}>'
