"""
tests/test_api.py
Testes básicos da API com pytest-django.
Execute com: pytest
"""

import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def client(db):
    from ninja.testing import TestClient
    from simulados.urls import api
    return TestClient(api)


@pytest.fixture
def user(db):
    return User.objects.create_user(
        email    = 'test@simulaai.com',
        name     = 'Test User',
        password = 'senha123',
    )


@pytest.fixture
def auth_headers(client, user):
    res  = client.post('/auth/login/', json={'email': user.email, 'password': 'senha123'})
    token = res.json()['access']
    return {'Authorization': f'Bearer {token}'}


@pytest.fixture
def simulado(db):
    from apps.simulados.models import Simulado, Question
    s = Simulado.objects.create(
        title      = 'Simulado Teste',
        subject    = 'TI',
        difficulty = 'easy',
        time_limit = 10,
    )
    for i in range(5):
        Question.objects.create(
            simulado       = s,
            order          = i + 1,
            statement      = f'Questão {i + 1}?',
            option_a       = 'Opção A',
            option_b       = 'Opção B',
            option_c       = 'Opção C',
            option_d       = 'Opção D',
            correct_option = 'a',
            explanation    = 'A alternativa A é correta.',
        )
    return s


# ── Auth tests ────────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_register_success(client):
    res = client.post('/auth/register/', json={
        'name': 'João Silva', 'email': 'joao@test.com', 'password': 'senha123'
    })
    assert res.status_code == 200
    data = res.json()
    assert 'access' in data
    assert 'refresh' in data
    assert data['user']['email'] == 'joao@test.com'


@pytest.mark.django_db
def test_register_duplicate_email(client, user):
    res = client.post('/auth/register/', json={
        'name': 'Outro', 'email': user.email, 'password': 'senha123'
    })
    assert res.status_code == 409


@pytest.mark.django_db
def test_login_success(client, user):
    res = client.post('/auth/login/', json={'email': user.email, 'password': 'senha123'})
    assert res.status_code == 200
    assert 'access' in res.json()


@pytest.mark.django_db
def test_login_wrong_password(client, user):
    res = client.post('/auth/login/', json={'email': user.email, 'password': 'errada'})
    assert res.status_code == 401


# ── Simulados tests ───────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_list_simulados(client, simulado):
    res = client.get('/simulados/')
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1
    assert data[0]['title'] == 'Simulado Teste'


@pytest.mark.django_db
def test_get_simulado_no_answers(client, simulado):
    """Garante que o gabarito NÃO é retornado no detalhe."""
    res = client.get(f'/simulados/{simulado.id}/')
    assert res.status_code == 200
    questions = res.json()['questions']
    for q in questions:
        assert 'correct_option' not in q
        assert 'explanation' not in q


# ── Resultados tests ──────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_start_attempt(client, auth_headers, simulado):
    res = client.post('/resultados/start/', json={'simulado_id': str(simulado.id)}, headers=auth_headers)
    assert res.status_code == 200
    assert 'attempt_id' in res.json()


@pytest.mark.django_db
def test_finish_attempt(client, auth_headers, simulado):
    # Inicia
    start_res  = client.post('/resultados/start/', json={'simulado_id': str(simulado.id)}, headers=auth_headers)
    attempt_id = start_res.json()['attempt_id']

    # Pega IDs das questões
    detail_res = client.get(f'/simulados/{simulado.id}/')
    questions  = detail_res.json()['questions']
    answers    = {q['id']: 'a' for q in questions}  # todas corretas

    # Finaliza
    finish_res = client.post(
        f'/resultados/{attempt_id}/finish/',
        json={'answers': answers, 'time_taken': 120},
        headers=auth_headers,
    )
    assert finish_res.status_code == 200
    data = finish_res.json()
    assert data['score'] == 5         # todas corretas
    assert data['percentage'] == 100


@pytest.mark.django_db
def test_history(client, auth_headers, simulado):
    # Cria e finaliza uma tentativa
    start_res  = client.post('/resultados/start/', json={'simulado_id': str(simulado.id)}, headers=auth_headers)
    attempt_id = start_res.json()['attempt_id']
    detail_res = client.get(f'/simulados/{simulado.id}/')
    answers    = {q['id']: 'b' for q in detail_res.json()['questions']}  # todas erradas
    client.post(f'/resultados/{attempt_id}/finish/', json={'answers': answers, 'time_taken': 60}, headers=auth_headers)

    # Verifica histórico
    res = client.get('/resultados/history/', headers=auth_headers)
    assert res.status_code == 200
    assert len(res.json()) >= 1


@pytest.mark.django_db
def test_ranking_public(client, auth_headers, simulado):
    """Ranking é público — não requer autenticação."""
    res = client.get('/resultados/ranking/')
    assert res.status_code == 200
    assert isinstance(res.json(), list)
