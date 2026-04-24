/**
 * routes/simulados.js
 * Listagem e detalhamento dos simulados e suas questões.
 */

const express = require('express');
const router  = express.Router();
const { db }  = require('../database');

// GET /api/simulados — Lista todos com contagem de questões e tentativas
router.get('/', async (req, res) => {
  const simulados = await db.simulados.findAsync({}).sort({ createdAt: 1 });

  // Conta tentativas de cada simulado
  const result = await Promise.all(simulados.map(async (s) => {
    const attemptCount = await db.attempts.countAsync({ simuladoId: s._id });
    return {
      id:             s._id,
      title:          s.title,
      description:    s.description,
      time_limit:     s.timeLimit,
      question_count: s.questions.length,
      attempt_count:  attemptCount,
      created_at:     s.createdAt,
    };
  }));

  res.json(result);
});

// GET /api/simulados/:id — Simulado com questões (sem gabarito)
router.get('/:id', async (req, res) => {
  const s = await db.simulados.findOneAsync({ _id: req.params.id });
  if (!s) return res.status(404).json({ error: 'Simulado não encontrado.' });

  // Remove o campo correctOption antes de enviar ao cliente
  const questions = s.questions.map(({ correctOption, explanation, ...rest }) => rest);

  res.json({
    id:          s._id,
    title:       s.title,
    description: s.description,
    time_limit:  s.timeLimit,
    questions,
  });
});

// GET /api/simulados/:id/answers — Gabarito (usado pós-finalização)
router.get('/:id/answers', async (req, res) => {
  const s = await db.simulados.findOneAsync({ _id: req.params.id });
  if (!s) return res.status(404).json({ error: 'Simulado não encontrado.' });

  const answers = s.questions.map(q => ({
    id:            q.id,
    correctOption: q.correctOption,
    explanation:   q.explanation,
  }));

  res.json(answers);
});

module.exports = router;
