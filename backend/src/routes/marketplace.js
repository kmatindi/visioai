const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { store } = require('../models/store');

// GET /api/marketplace/templates
router.get('/templates', authenticate, (req, res) => {
  const { category, featured, page = 1, limit = 12, sort = 'trending' } = req.query;

  let templates = [...store.marketplace];
  if (category && category !== 'all') templates = templates.filter(t => t.category === category);
  if (featured === 'true') templates = templates.filter(t => t.featured);

  if (sort === 'trending') templates.sort((a, b) => b.downloads - a.downloads);
  else if (sort === 'new') templates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  else if (sort === 'rating') templates.sort((a, b) => b.rating - a.rating);

  const total = templates.length;
  const paginated = templates.slice((page - 1) * limit, page * limit);

  res.json({
    templates: paginated,
    total,
    page: +page,
    pages: Math.ceil(total / limit),
    categories: ['cinematic', 'social', 'e-commerce', 'real-estate', 'education', 'news'],
  });
});

// GET /api/marketplace/templates/:id
router.get('/templates/:id', authenticate, (req, res) => {
  const template = store.marketplace.find(t => t.id === req.params.id);
  if (!template) return res.status(404).json({ error: 'Template not found' });
  res.json(template);
});

// POST /api/marketplace/templates/:id/purchase
router.post('/templates/:id/purchase', authenticate, (req, res) => {
  const template = store.marketplace.find(t => t.id === req.params.id);
  if (!template) return res.status(404).json({ error: 'Template not found' });
  template.downloads += 1;
  res.json({ success: true, template, message: 'Template added to your library' });
});

module.exports = router;
