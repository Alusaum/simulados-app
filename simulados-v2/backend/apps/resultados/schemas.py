"""
apps/resultados/schemas.py
Schemas Pydantic para tentativas, histórico e ranking.
"""

import uuid
from typing  import List, Optional, Dict
from pydantic import BaseModel


# ── Input ─────────────────────────────────────────────────────────────────────

class StartAttemptSchema(BaseModel):
    simulado_id: uuid.UUID


class SaveAnswersSchema(BaseModel):
    """Recebe respostas parciais — usado para salvar progresso."""
    answers: Dict[str, str]   # { "question_uuid": "a"|"b"|"c"|"d" }


class FinishAttemptSchema(BaseModel):
    """Finaliza a tentativa com as respostas e o tempo gasto."""
    answers:    Dict[str, str]
    time_taken: int            # segundos


class SyncOfflineSchema(BaseModel):
    """Payload de sincronização de tentativas offline do app mobile."""
    attempts: List[dict]


# ── Output ────────────────────────────────────────────────────────────────────

class AnswerDetailOut(BaseModel):
    question_id:    uuid.UUID
    statement:      str
    option_a:       str
    option_b:       str
    option_c:       str
    option_d:       str
    chosen_option:  Optional[str]
    correct_option: str
    explanation:    str
    is_correct:     bool


class AttemptResultOut(BaseModel):
    attempt_id:     uuid.UUID
    simulado_title: str
    score:          int
    total:          int
    percentage:     int
    time_taken:     int
    answers:        List[AnswerDetailOut]


class AttemptHistoryOut(BaseModel):
    id:             uuid.UUID
    simulado_id:    uuid.UUID
    simulado_title: str
    score:          int
    total_questions: int
    percentage:     int
    time_taken:     int
    completed_at:   Optional[str]


class RankingItemOut(BaseModel):
    position:       int
    user_id:        uuid.UUID
    user_name:      str
    total_attempts: int
    avg_percentage: float
    best_percentage: int
    total_correct:  int
