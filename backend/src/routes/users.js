const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { store } = require('../models/store');
const { PLANS } = require('../config/plans');

// GET /api/users/me
router.get('/me', authenticate, (req, res) => {
  const user = store.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password, ...safe } = user;
  const plan = PLANS[user.plan];
  res.json({
    ...safe,
    planDetails: plan,
    generationsRemaining: plan.generationsPerMonth === -1
      ? 'unlimited'
      : plan.generationsPerMonth - (user.creditsUsed || 0),
  });
});

// PATCH /api/users/me
router.patch('/me', authenticate, (req, res) => {
  const user = store.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const allowed = ['name', 'avatar'];
  allowed.forEach(k => { if (req.body[k] !== undefined) user[k] = req.body[k]; });
  const { password, ...safe } = user;
  res.json(safe);
});

// POST /api/users/upgrade — mock plan upgrade
router.post('/upgrade', authenticate, (req, res) => {
  const { plan } = req.body;
  const validPlans = ['free', 'pro', 'studio', 'enterprise'];
  if (!validPlans.includes(plan)) return res.status(400).json({ error: 'Invalid plan' });
  const user = store.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.plan = plan;
  user.credits = PLANS[plan].generationsPerMonth === -1 ? 9999 : PLANS[plan].generationsPerMonth;
  user.creditsUsed = 0;
  const { password, ...safe } = user;
  res.json({ ...safe, message: `Successfully upgraded to ${PLANS[plan].name}` });
});

module.exports = router;
