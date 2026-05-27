const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/auth');

const MUSIC_MOODS = [
  { id: 'energetic', label: 'Energetic', bpm: '120–140', tags: ['upbeat', 'social', 'ads'] },
  { id: 'cinematic', label: 'Cinematic', bpm: '60–90', tags: ['film', 'product', 'storytelling'] },
  { id: 'relaxed', label: 'Relaxed', bpm: '70–95', tags: ['lifestyle', 'nature', 'wellness'] },
  { id: 'dramatic', label: 'Dramatic', bpm: '80–110', tags: ['real-estate', 'luxury', 'fashion'] },
  { id: 'corporate', label: 'Corporate', bpm: '100–115', tags: ['business', 'explainer', 'b2b'] },
  { id: 'playful', label: 'Playful', bpm: '115–130', tags: ['kids', 'fun', 'social'] },
  { id: 'inspiring', label: 'Inspiring', bpm: '90–110', tags: ['education', 'motivation', 'brand'] },
  { id: 'ambient', label: 'Ambient', bpm: '60–80', tags: ['meditation', 'bg', 'minimal'] },
];

// GET /api/music/moods
router.get('/moods', authenticate, (req, res) => {
  res.json({ moods: MUSIC_MOODS });
});

// POST /api/music/generate
router.post('/generate', authenticate, async (req, res) => {
  const { mood = 'cinematic', duration = 30, prompt, bpm, key } = req.body;

  const jobId = uuidv4();

  // Real Suno integration would go here
  if (process.env.SUNO_API_KEY) {
    // TODO: integrate Suno API
  }

  // Mock response
  res.json({
    jobId,
    status: 'completed',
    mood,
    duration,
    audioUrl: null,
    mockMode: true,
    message: 'Music generation ready (configure SUNO_API_KEY for real audio)',
    metadata: { bpm: bpm || MUSIC_MOODS.find(m => m.id === mood)?.bpm, key: key || 'C major' },
  });
});

module.exports = router;
