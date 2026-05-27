const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { store } = require('../models/store');

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, plan: user.plan, name: user.name },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password and name are required' });
    }
    if (store.users.find(u => u.email === email)) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = {
      id: uuidv4(),
      email,
      password: hashed,
      name,
      plan: 'free',
      credits: 5,
      creditsUsed: 0,
      avatar: null,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      totalGenerations: 0,
      totalProjects: 0,
    };
    store.users.push(user);
    const token = signToken(user);
    const { password: _, ...safeUser } = user;
    res.status(201).json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = store.users.find(u => u.email === email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    user.lastActive = new Date().toISOString();
    const token = signToken(user);
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/demo — instant demo login (no credentials needed)
router.post('/demo', (req, res) => {
  const user = store.users.find(u => u.id === 'demo-user-001');
  if (!user) return res.status(404).json({ error: 'Demo account not found' });
  const token = signToken(user);
  const { password: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

module.exports = router;
