# 🎓 SimulaAí — Plataforma de Simulados Online

Plataforma web completa para realização de simulados com timer, feedback visual, histórico e ranking.

---

## 📦 Stack

| Camada     | Tecnologia                        |
|------------|-----------------------------------|
| Frontend   | HTML + CSS + JavaScript (Vanilla) |
| Backend    | Node.js + Express                 |
| Banco      | SQLite via `better-sqlite3`       |

---

## 🗂️ Estrutura do Projeto

```
simulados-app/
├── backend/
│   ├── server.js          # Servidor Express (ponto de entrada)
│   ├── database.js        # Configuração do SQLite + seed de dados
│   ├── package.json
│   └── routes/
│       ├── users.js       # Cadastro e login de usuários
│       ├── simulados.js   # Listagem e detalhes dos simulados
│       └── resultados.js  # Salvar tentativas, histórico e ranking
└── frontend/
    └── index.html         # SPA completa (single-page app)
```

---

## 🚀 Como Rodar

### Pré-requisitos

- **Node.js** versão 16 ou superior ([download](https://nodejs.org))
- **npm** (vem junto com o Node.js)

### 1. Instalar dependências do backend

```bash
cd backend
npm install
```

### 2. Iniciar o servidor

```bash
# Modo produção
npm start

# Modo desenvolvimento (reinicia ao salvar arquivos)
npm run dev
```

O servidor estará disponível em: **http://localhost:3001**

### 3. Abrir o frontend

Abra o arquivo `frontend/index.html` diretamente no navegador:

```bash
# macOS
open frontend/index.html

# Linux
xdg-open frontend/index.html

# Windows
start frontend/index.html
```

> **Ou simplesmente arraste o arquivo `index.html` para o navegador.**

---

## ✅ Funcionalidades

### Usuário
- Criação de conta com nome e e-mail
- Login simples (sem senha) por e-mail
- Sessão persistida via `localStorage`

### Simulados
- 3 simulados pré-carregados (JavaScript, HTML/CSS, TI Geral)
- Listagem com número de questões, tempo e total de tentativas
- Questões com 4 alternativas e 1 resposta correta

### Execução
- ⏱️ **Timer regressivo** — alerta visual quando o tempo está acabando
- Navegação livre entre questões
- Indicadores visuais de progresso (barra e pontinhos)
- Finalização com confirmação se há questões sem resposta

### Resultados
- Pontuação percentual com anel animado
- Feedback por emoji baseado no desempenho
- Estatísticas: acertos, erros e tempo gasto
- **Revisão detalhada** de cada questão com explicações

### Histórico
- Listagem de todas as tentativas anteriores
- Data, pontuação e tempo de cada tentativa

### Ranking
- Ranking global por média de desempenho
- Medalhas para os 3 primeiros colocados

---

## 📡 API Endpoints

### Usuários
| Método | Rota                  | Descrição                    |
|--------|-----------------------|------------------------------|
| POST   | `/api/users/register` | Criar novo usuário           |
| POST   | `/api/users/login`    | Login por e-mail             |
| GET    | `/api/users/:id`      | Buscar usuário por ID        |

### Simulados
| Método | Rota                        | Descrição                          |
|--------|-----------------------------|------------------------------------|
| GET    | `/api/simulados`            | Listar todos os simulados          |
| GET    | `/api/simulados/:id`        | Buscar simulado com questões       |
| GET    | `/api/simulados/:id/answers`| Buscar gabarito (pós-tentativa)    |

### Resultados
| Método | Rota                           | Descrição                    |
|--------|--------------------------------|------------------------------|
| POST   | `/api/resultados`              | Salvar tentativa e calcular nota |
| GET    | `/api/resultados/user/:id`     | Histórico de um usuário      |
| GET    | `/api/resultados/attempt/:id`  | Detalhe de uma tentativa     |
| GET    | `/api/resultados/ranking`      | Ranking global               |

---

## 🐛 Solução de Problemas

### "Cannot connect to API"
- Verifique se o backend está rodando: `npm start` na pasta `backend/`
- Confirme que a porta 3001 não está sendo usada por outro processo

### "better-sqlite3 falhou ao instalar"
O `better-sqlite3` requer compilação nativa. Instale as ferramentas de build:

```bash
# macOS
xcode-select --install

# Ubuntu/Debian
sudo apt-get install build-essential python3

# Windows
npm install --global windows-build-tools
```

---

## 🗃️ Banco de Dados

O arquivo `simulados.db` é criado automaticamente na primeira execução dentro da pasta `backend/`. Para resetar o banco (apagar dados e re-gerar o seed):

```bash
cd backend
rm simulados.db
npm start
```

---

## 🔮 Possíveis Melhorias Futuras

- Autenticação com senha (bcrypt + JWT)
- Upload de simulados em JSON/CSV
- Dashboard com gráficos de evolução
- Modo de estudo (pratica sem timer)
- Categorias e tags nos simulados
- Suporte a imagens nas questões
