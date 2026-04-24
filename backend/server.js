/**
 * server.js
 * Servidor principal da API — Express + NeDB.
 * Ponto de entrada da aplicação backend.
 */

const express  = require('express');
const cors     = require('cors');
const { seedDatabase } = require('./database');

const usersRouter      = require('./routes/users');
const simuladosRouter  = require('./routes/simulados');
const resultadosRouter = require('./routes/resultados');

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Middlewares ─────────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json());

// Log simples de requisições
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─── Rotas ───────────────────────────────────────────────────────────────────

app.use('/api/users',      usersRouter);
app.use('/api/simulados',  simuladosRouter);
app.use('/api/resultados', resultadosRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

// ─── Inicialização ───────────────────────────────────────────────────────────

async function start() {
  await seedDatabase(); // Popula o banco se necessário
  app.listen(PORT, () => {
    console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📡 API disponível em http://localhost:${PORT}/api\n`);
  });
}

start().catch(err => {
  console.error('Erro ao iniciar o servidor:', err);
  process.exit(1);
});
