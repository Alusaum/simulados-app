# 🎓 SimulaAí — Mini Ecossistema Educacional

Plataforma completa de simulados online com Landing Page, SaaS Web, API e App Mobile.

---

## 🗂️ Estrutura do Projeto

```
simulados-v2/
├── landing/          🌐 Landing page estática (HTML + SEO)
├── backend/          ⚙️  Django 5 + Django Ninja + PostgreSQL
├── frontend/         🖥️  Next.js 14 + React 18 + TypeScript
├── mobile/           📱 Flutter 3 (offline-first)
├── docker-compose.yml
├── PRD.md
└── TechSpecs.md
```

---

## ✅ Funcionalidades Implementadas

| Área | Feature |
|---|---|
| 🌐 Landing | SEO completo (meta, OG, Schema.org), hero, features, pricing, CTA |
| 🔐 Auth | Registro, login, JWT (access 15min + refresh 7d), recuperação de senha |
| 📝 Simulados | Listagem com filtros, detalhe, 3 simulados com 28 questões |
| ⏱️ Quiz | Timer regressivo, navegação livre, salvar progresso |
| 📊 Resultados | Score, percentual, revisão com gabarito comentado |
| 📋 Histórico | Todas as tentativas do usuário com data e desempenho |
| 🏆 Ranking | Global por média, público, sem autenticação |
| 📱 Mobile | Offline-first com SQLite, sincronização automática ao reconectar |
| 🐳 Docker | Compose completo: Django + PostgreSQL + Redis + Celery + Next.js + Nginx |
| 🚀 CI/CD | GitHub Actions: lint + testes + build Docker + deploy SSH |
| 📧 Async | Celery: e-mail de reset de senha + sync de tentativas offline |
| 🧪 Testes | pytest-django com fixtures, cobertura de auth + simulados + resultados |

---

## 🚀 Como Rodar (Docker — recomendado)

### Pré-requisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop) instalado e rodando

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/simulados-v2.git
cd simulados-v2
```

### 2. Copie o arquivo de variáveis
```bash
cp backend/.env.example backend/.env
```

### 3. Suba tudo com Docker Compose
```bash
docker compose up --build
```

### 4. Acesse
| Serviço | URL |
|---|---|
| 🌐 Landing | abrir `landing/index.html` no navegador |
| 🖥️ Frontend | http://localhost:3000 |
| ⚙️ API (Django) | http://localhost:8000/api |
| 📖 Swagger/Docs | http://localhost:8000/api/docs |
| 🛠️ Admin Django | http://localhost:8000/admin |

---

## 🛠️ Como Rodar Sem Docker (manual)

### Backend

```bash
cd backend

# Criar ambiente virtual Python
python -m venv venv
source venv/bin/activate        # Linux/Mac
venv\Scripts\activate           # Windows

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis (edite conforme necessário)
cp .env.example .env

# Rodar com SQLite local (dev rápido sem PostgreSQL)
# Edite .env: POSTGRES_HOST=localhost (ou use SQLite editando settings)

# Aplicar migrations
python manage.py migrate

# Popular banco com simulados de exemplo
python manage.py seed_simulados

# Criar superusuário (admin)
python manage.py createsuperuser

# Rodar servidor
python manage.py runserver
```

API disponível em: **http://localhost:8000/api**

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend disponível em: **http://localhost:3000**

### Mobile (Flutter)

```bash
cd mobile
flutter pub get

# Rode em emulador Android (usa 10.0.2.2 para acessar localhost)
flutter run

# Ou gere APK
flutter build apk --release
```

---

## 🧪 Rodar Testes

### Backend
```bash
cd backend
pytest -v
```

### Frontend
```bash
cd frontend
npm run lint
npx tsc --noEmit
```

### Mobile
```bash
cd mobile
flutter test
flutter analyze
```

---

## 📡 API — Endpoints Principais

### Auth
```
POST /api/auth/register/       Criar conta
POST /api/auth/login/          Login → JWT
POST /api/auth/refresh/        Renovar token
POST /api/auth/password-reset/ Solicitar reset de senha
```

### Simulados
```
GET  /api/simulados/           Listar (filtros: subject, difficulty)
GET  /api/simulados/{id}/      Detalhe + questões (sem gabarito)
GET  /api/simulados/{id}/answers/ Gabarito (requer auth)
```

### Resultados
```
POST /api/resultados/start/          Iniciar tentativa
POST /api/resultados/{id}/finish/    Finalizar e calcular nota
GET  /api/resultados/history/        Histórico do usuário
GET  /api/resultados/ranking/        Ranking global (público)
POST /api/resultados/sync/           Sincronizar tentativas offline
```

---

## 🔧 Variáveis de Ambiente

Copie `backend/.env.example` para `backend/.env` e edite:

| Variável | Descrição | Padrão dev |
|---|---|---|
| `SECRET_KEY` | Chave secreta Django | `dev-secret...` |
| `POSTGRES_DB` | Nome do banco | `simulados` |
| `POSTGRES_USER` | Usuário PostgreSQL | `postgres` |
| `POSTGRES_PASSWORD` | Senha PostgreSQL | `postgres` |
| `POSTGRES_HOST` | Host do banco | `db` (Docker) / `localhost` |
| `REDIS_URL` | URL do Redis | `redis://redis:6379/0` |
| `FRONTEND_URL` | URL do frontend (e-mails) | `http://localhost:3000` |

---

## 🏗️ Arquitetura

```
Cliente Web (Next.js)  ─┐
Cliente Mobile (Flutter) ┼─→ Nginx → Django Ninja API → PostgreSQL
Landing Page (HTML)    ─┘               ↓
                                    Redis (cache)
                                    Celery (e-mail, sync)
```

---

## 🔐 Segurança

- Senhas com hash **bcrypt** via Django
- **JWT** com access token curto (15min) e refresh rotativo (7d)
- Tokens no mobile via **flutter_secure_storage** (Keychain/Keystore)
- **CORS** configurado por origem
- **Rate limiting** via Redis
- **HTTPS** em produção via Nginx + Certbot

---

## 📊 CI/CD

O pipeline do GitHub Actions executa automaticamente em cada push:

1. ✅ **Lint** — flake8 (Python), ESLint (TypeScript), dart analyze
2. ✅ **Testes** — pytest com PostgreSQL de serviço
3. ✅ **Build** — Next.js e Docker images
4. ✅ **Push** — imagens para GitHub Container Registry (ghcr.io)
5. ✅ **Deploy** — SSH para servidor de produção (apenas na `main`)
