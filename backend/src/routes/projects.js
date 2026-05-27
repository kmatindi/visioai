const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/auth');
const { store } = require('../models/store');

// Seed demo projects for demo user
if (!store.projects.length) {
  const demoProjects = [
    { title: 'Summer Collection Launch', status: 'completed', type: 'ecommerce' },
    { title: 'New York Property Tour', status: 'completed', type: 'real-estate' },
    { title: 'Product Demo — AirPods Max', status: 'processing', type: 'ecommerce' },
    { title: 'Python Course Intro', status: 'completed', type: 'education' },
    { title: 'Brand Story Reel', status: 'draft', type: 'social' },
    { title: 'Hotel Maldives Promo', status: 'completed', type: 'hospitality' },
  ].map((p, i) => ({
    id: uuidv4(),
    userId: 'demo-user-001',
    ...p,
    aspectRatio: i % 3 === 0 ? '16:9' : '9:16',
    thumbnail: `https://picsum.photos/seed/${i + 200}/400/225`,
    generationsCount: Math.floor(Math.random() * 8) + 1,
    duration: Math.floor(Math.random() * 30) + 5,
    createdAt: new Date(Date.now() - (i + 1) * 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    views: Math.floor(Math.random() * 50000) + 500,
    shares: Math.floor(Math.random() * 1000) + 50,
  }));
  store.projects.push(...demoProjects);
}

// GET /api/projects
router.get('/', authenticate, (req, res) => {
  const { page = 1, limit = 12, status, type } = req.query;
  let projects = store.projects.filter(p => p.userId === req.user.id);
  if (status) projects = projects.filter(p => p.status === status);
  if (type) projects = projects.filter(p => p.type === type);
  projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  const total = projects.length;
  const paginated = projects.slice((page - 1) * limit, page * limit);
  res.json({ projects: paginated, total, page: +page, pages: Math.ceil(total / limit) });
});

// GET /api/projects/:id
router.get('/:id', authenticate, (req, res) => {
  const project = store.projects.find(p => p.id === req.params.id && p.userId === req.user.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const generations = store.generations.filter(g => g.projectId === project.id);
  res.json({ ...project, generations });
});

// POST /api/projects
router.post('/', authenticate, (req, res) => {
  const { title, type, aspectRatio = '9:16', description } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  const project = {
    id: uuidv4(),
    userId: req.user.id,
    title,
    type: type || 'social',
    aspectRatio,
    description,
    status: 'draft',
    thumbnail: null,
    generationsCount: 0,
    duration: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    views: 0,
    shares: 0,
  };
  store.projects.push(project);
  const user = store.users.find(u => u.id === req.user.id);
  if (user) user.totalProjects = (user.totalProjects || 0) + 1;
  res.status(201).json(project);
});

// PATCH /api/projects/:id
router.patch('/:id', authenticate, (req, res) => {
  const project = store.projects.find(p => p.id === req.params.id && p.userId === req.user.id);
  if (!project) return res.status(404).json({ error: 'Not found' });
  const allowed = ['title', 'description', 'type', 'aspectRatio', 'status', 'thumbnail'];
  allowed.forEach(k => { if (req.body[k] !== undefined) project[k] = req.body[k]; });
  project.updatedAt = new Date().toISOString();
  res.json(project);
});

// DELETE /api/projects/:id
router.delete('/:id', authenticate, (req, res) => {
  const idx = store.projects.findIndex(p => p.id === req.params.id && p.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  store.projects.splice(idx, 1);
  res.json({ success: true });
});

module.exports = router;
