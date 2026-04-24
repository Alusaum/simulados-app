/**
 * routes/users.js
 * Rotas para criação e login de usuários.
 * Login simples por e-mail (sem senha/JWT neste projeto).
 */

const express = require('express');
const router  = express.Router();
const { db }  = require('../database');

// POST /api/users/register — Cria um novo usuário
router.post('/register', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email)
    return res.status(400).json({ error: 'Nome e e-mail são obrigatórios.' });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return res.status(400).json({ error: 'Formato de e-mail inválido.' });

  try {
    const user = await db.users.insertAsync({
      name:      name.trim(),
      email:     email.trim().toLowerCase(),
      createdAt: new Date(),
    });
    res.status(201).json({ message: 'Usuário criado com sucesso!', user });
  } catch (err) {
    if (err.errorType === 'uniqueViolated')
      return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// POST /api/users/login — Login por e-mail
router.post('/login', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'E-mail é obrigatório.' });

  const user = await db.users.findOneAsync({ email: email.trim().toLowerCase() });
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

  res.json({ message: 'Login realizado com sucesso!', user });
});

// GET /api/users/:id — Busca um usuário
router.get('/:id', async (req, res) => {
  const user = await db.users.findOneAsync({ _id: req.params.id });
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
  res.json(user);
});

module.exports = router;
