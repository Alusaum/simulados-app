# TechSpecs — SimulaAí

**Versão:** 1.0  
**Data:** 2025  

---

## 1. Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTES                              │
│  ┌──────────────────┐          ┌──────────────────────┐     │
│  │  Next.js (Web)   │          │   Flutter (Mobile)   │     │
│  │  Vercel / SSR    │          │   iOS + Android      │     │
│  └────────┬─────────┘          └──────────┬───────────┘     │
└───────────┼────────────────────────────────┼────────────────┘
            │ HTTPS / REST                   │ HTTPS / REST
            ▼                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY / NGINX                       │
│              Rate Limiting · SSL · Load Balance              │
└──────────────────────────┬──────────────────────────────────┘
                           │
            ┌──────────────▼──────────────┐
            │    Django + Django Ninja     │
            │    Python 3.12 · Gunicorn    │
            │    JWT Auth · REST API       │
            └──────────────┬──────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   ┌───────────┐    ┌───────────┐    ┌───────────┐
   │PostgreSQL │    │   Redis   │    │  Celery   │
   │  Banco    │    │   Cache   │    │  Workers  │
   │  Principal│    │ + Sessions│    │  (tasks)  │
   └───────────┘    └───────────┘    └───────────┘
```

---

## 2. Stack Tecnológica

### 2.1 Frontend (Web)
| Tecnologia | Versão | Justificativa |
|---|---|---|
| Next.js | 14.x | SSR/SSG nativo, App Router, excelente SEO |
| React | 18.x | Ecosistema maduro, base do Next.js |
| TypeScript | 5.x | Segurança de tipos, DX superior |
| Tailwind CSS | 3.x | Utility-first, rápido de estilizar |
| TanStack Query | 5.x | Cache e sincronização de estado servidor |
| Zustand | 4.x | Estado global leve |
| React Hook Form | 7.x | Formulários performáticos |
| Zod | 3.x | Validação de schemas |

### 2.2 Backend
| Tecnologia | Versão | Justificativa |
|---|---|---|
| Python | 3.12 | Performance melhorada, typing nativo |
| Django | 5.x | ORM robusto, admin gratuito, batteries included |
| Django Ninja | 1.x | APIs rápidas com tipagem automática + OpenAPI |
| PostgreSQL | 16.x | ACID, JSON nativo, escalável |
| Redis | 7.x | Cache, rate limiting, sessões |
| Celery | 5.x | Tarefas assíncronas (e-mail, sync) |
| Gunicorn | 21.x | WSGI server de produção |

### 2.3 Mobile
| Tecnologia | Versão | Justificativa |
|---|---|---|
| Flutter | 3.x | Cross-platform nativo, performance |
| Dart | 3.x | Linguagem do Flutter |
| sqflite | 2.x | SQLite local para offline-first |
| Dio | 5.x | HTTP client com interceptors |
| Riverpod | 2.x | Gerenciamento de estado reativo |
| flutter_secure_storage | — | Armazenamento seguro de tokens |

### 2.4 Infra & DevOps
| Tecnologia | Uso |
|---|---|
| Docker + Docker Compose | Containerização local e produção |
| GitHub Actions | CI/CD (lint, testes, deploy automático) |
| Nginx | Reverse proxy, SSL termination |
| Certbot | Certificados SSL automáticos |
| Sentry | Error tracking (frontend + backend) |

---

## 3. Estrutura de Pastas

```
simulados-v2/
├── landing/                    # Landing page estática
│   └── index.html
│
├── backend/                    # Django API
│   ├── manage.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── simulados/              # App Django principal
│   │   ├── settings/
│   │   │   ├── base.py
│   │   │   ├── development.py
│   │   │   └── production.py
│   │   └── urls.py
│   ├── apps/
│   │   ├── users/              # Auth, perfil
│   │   ├── simulados/          # Simulados e questões
│   │   └── resultados/         # Tentativas e ranking
│   └── core/                   # Utils, mixins, base models
│
├── frontend/                   # Next.js SaaS
│   ├── src/
│   │   ├── app/                # App Router (Next.js 14)
│   │   │   ├── (auth)/         # Grupo: login, register
│   │   │   ├── (app)/          # Grupo: dashboard, quiz
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/                # API client, utils
│   │   └── types/
│   ├── Dockerfile
│   └── package.json
│
├── mobile/                     # Flutter app
│   ├── lib/
│   │   ├── main.dart
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── simulados/
│   │   │   └── results/
│   │   ├── core/
│   │   │   ├── api/
│   │   │   ├── database/       # SQLite local
│   │   │   └── sync/           # Sincronização offline
│   │   └── shared/
│   └── pubspec.yaml
│
├── docker-compose.yml           # Orquestração local
├── docker-compose.prod.yml      # Produção
├── .github/workflows/
│   └── ci.yml                  # GitHub Actions
├── PRD.md
└── TechSpecs.md
```

---

## 4. Modelagem de Dados

```sql
-- Usuários
users
  id          UUID PK
  name        VARCHAR(150)
  email       VARCHAR(254) UNIQUE
  password    VARCHAR(128)   -- bcrypt hash
  is_active   BOOLEAN DEFAULT true
  created_at  TIMESTAMP

-- Simulados
simulados
  id           UUID PK
  title        VARCHAR(200)
  description  TEXT
  time_limit   INTEGER        -- minutos
  difficulty   VARCHAR(20)    -- easy | medium | hard
  subject      VARCHAR(100)   -- ex: "Direito Constitucional"
  is_active    BOOLEAN DEFAULT true
  created_at   TIMESTAMP

-- Questões
questions
  id             UUID PK
  simulado_id    UUID FK → simulados
  statement      TEXT
  option_a       TEXT
  option_b       TEXT
  option_c       TEXT
  option_d       TEXT
  correct_option VARCHAR(1)   -- a | b | c | d
  explanation    TEXT
  order          INTEGER

-- Tentativas
attempts
  id               UUID PK
  user_id          UUID FK → users
  simulado_id      UUID FK → simulados
  score            INTEGER
  total_questions  INTEGER
  time_taken       INTEGER    -- segundos
  status           VARCHAR(20) -- in_progress | completed
  started_at       TIMESTAMP
  completed_at     TIMESTAMP  NULLABLE

-- Respostas da tentativa
attempt_answers
  id              UUID PK
  attempt_id      UUID FK → attempts
  question_id     UUID FK → questions
  chosen_option   VARCHAR(1)  NULLABLE
  is_correct      BOOLEAN
```

---

## 5. API Endpoints (Django Ninja)

### Auth
```
POST   /api/auth/register/        Criar conta
POST   /api/auth/login/           Login → JWT
POST   /api/auth/refresh/         Refresh token
POST   /api/auth/password-reset/  Solicitar reset
```

### Simulados
```
GET    /api/simulados/            Listar (paginado, filtros)
GET    /api/simulados/{id}/       Detalhe com questões
GET    /api/simulados/{id}/answers/  Gabarito (auth required)
```

### Tentativas
```
POST   /api/attempts/             Iniciar tentativa
PATCH  /api/attempts/{id}/        Salvar respostas parciais
POST   /api/attempts/{id}/finish/ Finalizar e calcular nota
GET    /api/attempts/history/     Histórico do usuário
GET    /api/attempts/{id}/        Detalhe de uma tentativa
```

### Ranking
```
GET    /api/ranking/              Ranking global (paginado)
GET    /api/ranking/me/           Posição do usuário logado
```

---

## 6. Autenticação

- **JWT** via `djangorestframework-simplejwt`
- Access token: **15 minutos**
- Refresh token: **7 dias** (rotativo)
- Armazenamento no frontend: **httpOnly cookie** (sem XSS)
- Mobile: **flutter_secure_storage** (Keychain/Keystore)

---

## 7. Estratégia Offline-First (Mobile)

```
1. App abre → checa conectividade
2. [Online]  → sincroniza simulados novos do servidor
             → persiste no SQLite local
3. [Offline] → usa apenas banco local
4. Usuário realiza simulado → salva resultado localmente
   com flag synced = false
5. [Reconecta] → Celery worker ou trigger manual
               → envia todos os attempts com synced=false
               → marca como synced = true
```

---

## 8. CI/CD (GitHub Actions)

```yaml
# Triggers: push em main e pull_requests
Etapas:
  1. Lint (flake8, eslint, dart analyze)
  2. Testes (pytest, jest, flutter test)
  3. Build Docker images
  4. Push para registry (ghcr.io)
  5. Deploy via SSH (apenas na main)
```

---

## 9. Decisões Técnicas

| Decisão | Escolha | Alternativa Descartada | Motivo |
|---|---|---|---|
| ORM | Django ORM | SQLAlchemy | Integração nativa com Django admin e migrations |
| API style | REST + Django Ninja | GraphQL | Mais simples para o escopo do MVP |
| Auth | JWT + httpOnly cookie | Session-based | Stateless, suporte nativo mobile |
| State mobile | Riverpod | Bloc/Provider | Mais moderno, menos boilerplate |
| Cache | Redis | Memcached | Suporte a pub/sub para notificações futuras |
| DB | PostgreSQL | MySQL | JSON nativo, melhor suporte a tipos complexos |
