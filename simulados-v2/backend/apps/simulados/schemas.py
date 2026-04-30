"""
apps/simulados/schemas.py
Schemas Pydantic para simulados e questões.
"""

import uuid
from typing import List, Optional
from pydantic import BaseModel


# ── Questão (sem gabarito — enviada durante o simulado) ──────────────────────

class QuestionOut(BaseModel):
    id:        uuid.UUID
    statement: str
    option_a:  str
    option_b:  str
    option_c:  str
    option_d:  str
    order:     int


# ── Questão com gabarito (enviada após finalização) ──────────────────────────

class QuestionWithAnswerOut(QuestionOut):
    correct_option: str
    explanation:    str


# ── Simulado (listagem) ───────────────────────────────────────────────────────

class SimuladoListOut(BaseModel):
    id:             uuid.UUID
    title:          str
    description:    str
    subject:        str
    difficulty:     str
    time_limit:     int
    question_count: int
    attempt_count:  int


# ── Simulado (detalhe com questões, sem gabarito) ─────────────────────────────

class SimuladoDetailOut(BaseModel):
    id:             uuid.UUID
    title:          str
    description:    str
    subject:        str
    difficulty:     str
    time_limit:     int
    questions:      List[QuestionOut]


# ── Filtros de listagem ───────────────────────────────────────────────────────

class SimuladoFilters(BaseModel):
    subject:    Optional[str] = None
    difficulty: Optional[str] = None
