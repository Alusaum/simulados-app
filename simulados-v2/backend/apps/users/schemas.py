"""
apps/users/schemas.py
Schemas Pydantic para validação de entrada/saída da API de usuários.
Django Ninja usa Pydantic v2 nativamente.
"""

import uuid
from pydantic import BaseModel, EmailStr, field_validator


# ── Input Schemas (request body) ─────────────────────────────────────────────

class RegisterSchema(BaseModel):
    name:     str
    email:    EmailStr
    password: str

    @field_validator('name')
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if len(v.strip()) < 2:
            raise ValueError('Nome deve ter ao menos 2 caracteres.')
        return v.strip()

    @field_validator('password')
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError('Senha deve ter ao menos 6 caracteres.')
        return v


class LoginSchema(BaseModel):
    email:    EmailStr
    password: str


class PasswordResetRequestSchema(BaseModel):
    email: EmailStr


class PasswordResetConfirmSchema(BaseModel):
    token:        str
    new_password: str

    @field_validator('new_password')
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError('Senha deve ter ao menos 6 caracteres.')
        return v


# ── Output Schemas (response body) ───────────────────────────────────────────

class UserOut(BaseModel):
    id:         uuid.UUID
    name:       str
    email:      str
    created_at: str

    @classmethod
    def from_orm_str(cls, user):
        return cls(
            id=user.id,
            name=user.name,
            email=user.email,
            created_at=user.created_at.isoformat(),
        )


class TokenOut(BaseModel):
    access:  str
    refresh: str
    user:    UserOut


class MessageOut(BaseModel):
    message: str
