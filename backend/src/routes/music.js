const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { authenticate } = require('../middleware/auth');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const REPLICATE_API = 'https://api.replicate.com/v1';

const MUSIC_MOODS = [
  { id: 'energetic', label: 'Energetic', bpm: '120–140', tags: ['upbeat', 'social', 'ads'] },
  { id: 'cinematic', label: 'Cinematic', bpm: '60–90',  tags: ['film', 'product', 'storytelling'] },
  { id: 'relaxed',   label: 'Relaxed',   bpm: '70–95',  tags: ['lifestyle', 'nature', 'wellness'] },
  { id: 'dramatic',  label: 'Dramatic',  bpm: '80–110', tags: ['real-estate', 'luxury', 'fashion'] },
  { id: 'corporate', label: 'Corporate', bpm: '100–115',tags: ['business', 'explainer', 'b2b'] },
  { id: 'playful',   label: 'Playful',   bpm: '115–130',tags: ['kids', 'fun', 'social'] },
  { id: 'inspiring', label: 'Inspiring', bpm: '90–110', tags: ['education', 'motivation', 'brand'] },
  { id: 'ambient',   label: 'Ambient',   bpm: '60–80',  tags: ['meditation', 'bg', 'minimal'] },
];

// Descriptive prompts mapped to each mood for musicgen
const MOOD_PROMPTS = {
  energetic: 'upbeat energetic electronic music, driving beat, fast tempo, commercial advertisement style',
  cinematic: 'epic cinematic orchestral music, sweeping strings, emotional film score, no vocals',
  relaxed:   'calm relaxing ambient music, soft piano, gentle acoustic guitar, peaceful, no vocals',
  dramatic:  'dramatic intense orchestral music, powerful strings, emotional tension, dark and suspenseful',
  corporate: 'professional corporate background music, modern clean sound, upbeat business presentation',
  playful:   'fun playful music, cheerful melody, light and happy, bright synths, positive energy',
  inspiring: 'inspiring motivational music, uplifting, energetic build, positive, triumphant',
  ambient:   'atmospheric ambient background music, minimal, drone pads, peaceful meditation',
};

router.get('/moods', authenticate, (req, res) => {
  res.json({ moods: MUSIC_MOODS });
});

// POST /api/music/generate
router.post('/generate', authenticate, async (req, res) => {
  const { mood = 'cinematic', duration = 30, prompt, bpm, key } = req.body;
  const jobId = uuidv4();
  const moodMeta = MUSIC_MOODS.find(m => m.id === mood);

  if (process.env.REPLICATE_API_KEY) {
    try {
      const headers = {
        Authorization: `Bearer ${process.env.REPLICATE_API_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'wait',
      };

      const musicPrompt = prompt || MOOD_PROMPTS[mood] || `${mood} background music`;
      // musicgen max is 30s per generation
      const clampedDuration = Math.min(Math.max(duration, 5), 30);

      const createRes = await axios.post(
        `${REPLICATE_API}/models/meta/musicgen/predictions`,
        {
          input: {
            prompt: musicPrompt,
            duration: clampedDuration,
            model_version: 'stereo-melody-large',
            output_format: 'mp3',
            normalization_strategy: 'peak',
          },
        },
        { headers, timeout: 10000 }
      );

      const predictionId = createRes.data.id;
      console.log(`[music] Replicate prediction created: ${predictionId}`);

      // Poll until done (max 90s)
      const pollHeaders = { Authorization: `Bearer ${process.env.REPLICATE_API_KEY}` };
      let audioUrl = null;
      const MAX_POLLS = 45;
      for (let i = 0; i < MAX_POLLS; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const poll = await axios.get(`${REPLICATE_API}/predictions/${predictionId}`, { headers: pollHeaders, timeout: 10000 });
        const { status, output, error } = poll.data;
        if (status === 'succeeded') {
          audioUrl = Array.isArray(output) ? output[0] : output;
          break;
        }
        if (status === 'failed' || status === 'canceled') {
          throw new Error(error || `Prediction ${status}`);
        }
      }

      if (!audioUrl) throw new Error('Timed out waiting for music generation');

      // Download and save to uploads/ so FFmpeg export can merge it
      const audioRes = await axios.get(audioUrl, { responseType: 'stream', timeout: 30000 });
      const audioPath = path.join(UPLOADS_DIR, `${jobId}.mp3`);
      await new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(audioPath);
        audioRes.data.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      return res.json({
        jobId,
        status: 'completed',
        mood,
        duration: clampedDuration,
        audioUrl: `/uploads/${jobId}.mp3`,
        metadata: { bpm: moodMeta?.bpm, key: key || 'C major' },
      });
    } catch (err) {
      console.error('[music] Replicate error:', err.response?.data || err.message);
      // Fall through to mock
    }
  }

  // Mock response
  res.json({
    jobId,
    status: 'completed',
    mood,
    duration,
    audioUrl: null,
    mockMode: true,
    message: 'Music generation ready (configure REPLICATE_API_KEY for real audio)',
    metadata: { bpm: moodMeta?.bpm, key: key || 'C major' },
  });
});

module.exports = router;
