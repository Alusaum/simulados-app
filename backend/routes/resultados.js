/**
 * routes/resultados.js
 * Salvar tentativas, histórico e ranking.
 */

const express = require('express');
const router  = express.Router();
const { db }  = require('../database');

// POST /api/resultados — Salva uma tentativa e calcula a nota
router.post('/', async (req, res) => {
  const { user_id, simulado_id, answers, time_taken } = req.body;

  if (!user_id || !simulado_id || !answers)
    return res.status(400).json({ error: 'Dados incompletos.' });

  const simulado = await db.simulados.findOneAsync({ _id: simulado_id });
  if (!simulado) return res.status(404).json({ error: 'Simulado não encontrado.' });

  // Calcula pontuação comparando respostas do usuário com o gabarito
  let score = 0;
  const detailedAnswers = simulado.questions.map((q) => {
    const userAnswer = answers[q.id] || null;
    const isCorrect  = userAnswer === q.correctOption;
    if (isCorrect) score++;

    return {
      question_id:    q.id,
      user_answer:    userAnswer,
      correct_option: q.correctOption,
      explanation:    q.explanation,
      is_correct:     isCorrect,
      question: {
        statement: q.statement,
        option_a:  q.options.a,
        option_b:  q.options.b,
        option_c:  q.options.c,
        option_d:  q.options.d,
      },
    };
  });

  const total = simulado.questions.length;

  const attempt = await db.attempts.insertAsync({
    userId:          user_id,
    simuladoId:      simulado_id,
    simuladoTitle:   simulado.title,
    score,
    totalQuestions:  total,
    timeTaken:       time_taken || 0,
    answers:         detailedAnswers,
    createdAt:       new Date(),
  });

  res.status(201).json({
    attempt_id: attempt._id,
    score,
    total,
    percentage: Math.round((score / total) * 100),
    answers:    detailedAnswers,
  });
});

// GET /api/resultados/ranking — Ranking global (deve vir ANTES de /:id)
router.get('/ranking', async (req, res) => {
  const attempts = await db.attempts.findAsync({});
  const users    = await db.users.findAsync({});

  const userMap = Object.fromEntries(users.map(u => [u._id, u.name]));

  // Agrupa por usuário
  const stats = {};
  for (const a of attempts) {
    if (!stats[a.userId]) {
      stats[a.userId] = {
        id:            a.userId,
        name:          userMap[a.userId] || 'Desconhecido',
        totalAttempts: 0,
        totalPct:      0,
        bestPct:       0,
        totalCorrect:  0,
      };
    }
    const pct = Math.round((a.score / a.totalQuestions) * 100);
    stats[a.userId].totalAttempts++;
    stats[a.userId].totalPct     += pct;
    stats[a.userId].totalCorrect += a.score;
    if (pct > stats[a.userId].bestPct) stats[a.userId].bestPct = pct;
  }

  const ranking = Object.values(stats)
    .map(u => ({
      ...u,
      avg_percentage:  Math.round(u.totalPct / u.totalAttempts),
      total_attempts:  u.totalAttempts,
      total_correct:   u.totalCorrect,
      best_percentage: u.bestPct,
    }))
    .sort((a, b) => b.avg_percentage - a.avg_percentage || b.total_correct - a.total_correct)
    .slice(0, 20);

  res.json(ranking);
});

// GET /api/resultados/user/:userId — Histórico de um usuário
router.get('/user/:userId', async (req, res) => {
  const attempts = await db.attempts
    .findAsync({ userId: req.params.userId })
    .sort({ createdAt: -1 });

  const result = attempts.map(a => ({
    id:              a._id,
    simulado_id:     a.simuladoId,
    simulado_title:  a.simuladoTitle,
    score:           a.score,
    total_questions: a.totalQuestions,
    time_taken:      a.timeTaken,
    percentage:      Math.round((a.score / a.totalQuestions) * 100),
    created_at:      a.createdAt,
  }));

  res.json(result);
});

// GET /api/resultados/attempt/:id — Detalhe de uma tentativa
router.get('/attempt/:id', async (req, res) => {
  const attempt = await db.attempts.findOneAsync({ _id: req.params.id });
  if (!attempt) return res.status(404).json({ error: 'Tentativa não encontrada.' });

  res.json({
    ...attempt,
    percentage: Math.round((attempt.score / attempt.totalQuestions) * 100),
  });
});

module.exports = router;
