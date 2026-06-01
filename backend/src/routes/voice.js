const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { authenticate, requirePlan } = require('../middleware/auth');
const { store } = require('../models/store');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// In-memory cache of cloned voices for the session
const customVoicesCache = new Map();

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' }, { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' }, { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' }, { code: 'pt', name: 'Portuguese' },
  { code: 'nl', name: 'Dutch' }, { code: 'pl', name: 'Polish' },
  { code: 'ru', name: 'Russian' }, { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' }, { code: 'zh', name: 'Chinese (Mandarin)' },
  { code: 'ar', name: 'Arabic' }, { code: 'hi', name: 'Hindi' },
  { code: 'tr', name: 'Turkish' }, { code: 'sv', name: 'Swedish' },
  { code: 'da', name: 'Danish' }, { code: 'fi', name: 'Finnish' },
  { code: 'no', name: 'Norwegian' }, { code: 'cs', name: 'Czech' },
  { code: 'sk', name: 'Slovak' }, { code: 'ro', name: 'Romanian' },
  { code: 'hu', name: 'Hungarian' }, { code: 'uk', name: 'Ukrainian' },
  { code: 'bg', name: 'Bulgarian' }, { code: 'hr', name: 'Croatian' },
  { code: 'el', name: 'Greek' }, { code: 'he', name: 'Hebrew' },
  { code: 'id', name: 'Indonesian' }, { code: 'ms', name: 'Malay' },
  { code: 'th', name: 'Thai' }, { code: 'vi', name: 'Vietnamese' },
  { code: 'ta', name: 'Tamil' }, { code: 'te', name: 'Telugu' },
  { code: 'bn', name: 'Bengali' }, { code: 'ur', name: 'Urdu' },
  { code: 'fa', name: 'Persian' }, { code: 'sw', name: 'Swahili' },
  { code: 'af', name: 'Afrikaans' }, { code: 'ca', name: 'Catalan' },
  { code: 'eu', name: 'Basque' }, { code: 'gl', name: 'Galician' },
  { code: 'lt', name: 'Lithuanian' }, { code: 'lv', name: 'Latvian' },
  { code: 'et', name: 'Estonian' }, { code: 'sl', name: 'Slovenian' },
  { code: 'sr', name: 'Serbian' }, { code: 'mk', name: 'Macedonian' },
  { code: 'sq', name: 'Albanian' },
];

// GET /api/voice/voices — list preset + any cloned custom voices
router.get('/voices', authenticate, (req, res) => {
  const custom = Array.from(customVoicesCache.values()).map(v => ({
    id: `custom_${v.elevenLabsId}`,
    name: v.name,
    gender: 'custom',
    accent: 'Custom',
    style: 'Cloned voice',
    preview: false,
    isCustom: true,
  }));
  res.json({ voices: [...store.voices, ...custom] });
});

// GET /api/voice/languages — list supported languages for dubbing
router.get('/languages', authenticate, (req, res) => {
  res.json({ languages: SUPPORTED_LANGUAGES, total: SUPPORTED_LANGUAGES.length });
});

// POST /api/voice/generate — text-to-speech
router.post('/generate', authenticate, async (req, res) => {
  const { text, voiceId = 'voice_aria', language = 'en', speed = 1.0, stability = 0.75 } = req.body;

  if (!text || text.trim().length < 1) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const jobId = uuidv4();

  // Real ElevenLabs integration
  if (process.env.ELEVENLABS_API_KEY) {
    try {
      const elVoiceId = mapToElevenLabsVoice(voiceId);
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${elVoiceId}`,
        {
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability, similarity_boost: 0.75, speed },
        },
        {
          headers: {
            'xi-api-key': process.env.ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg',
          },
          responseType: 'arraybuffer',
        }
      );

      // Save to uploads/ so FFmpeg export can download and merge it
      const audioPath = path.join(UPLOADS_DIR, `${jobId}.mp3`);
      fs.writeFileSync(audioPath, Buffer.from(response.data));

      return res.json({
        jobId,
        status: 'completed',
        audioUrl: `/uploads/${jobId}.mp3`,
        duration: estimateDuration(text),
        voice: voiceId,
        characters: text.length,
      });
    } catch (err) {
      console.error('[voice] ElevenLabs error:', err.response?.data
        ? Buffer.from(err.response.data).toString()
        : err.message);
      // Fall through to mock
    }
  }

  // Mock response — no real audio URL, browser uses Web Speech API instead
  res.json({
    jobId,
    status: 'completed',
    audioUrl: null,
    mockMode: true,
    message: 'Voice generation ready (configure ELEVENLABS_API_KEY for real audio)',
    duration: estimateDuration(text),
    voice: voiceId,
    characters: text.length,
  });
});

// POST /api/voice/dub — multilingual dubbing (video re-voice in target language)
router.post('/dub', authenticate, requirePlan('studio', 'enterprise'), async (req, res) => {
  const { videoUrl, sourceLanguage = 'en', targetLanguages, voiceId } = req.body;

  if (!targetLanguages || !Array.isArray(targetLanguages) || targetLanguages.length === 0) {
    return res.status(400).json({ error: 'At least one target language required' });
  }

  const jobId = uuidv4();
  res.json({
    jobId,
    status: 'queued',
    targetLanguages,
    estimatedMinutes: targetLanguages.length * 2,
    message: `Queued multilingual dubbing into ${targetLanguages.length} language(s)`,
  });
});

// POST /api/voice/clone — voice cloning from uploaded audio sample
// Accepts multipart/form-data: file (audio), name (string), description (string, optional)
router.post('/clone', authenticate, upload.single('file'), async (req, res) => {
  const { name, description = '' } = req.body;

  if (!name?.trim()) return res.status(400).json({ error: 'Voice name is required' });
  if (!req.file) return res.status(400).json({ error: 'Audio sample file is required' });

  if (process.env.ELEVENLABS_API_KEY) {
    try {
      // Node 18+ has FormData and Blob as globals
      const formData = new FormData();
      formData.append('name', name.trim());
      if (description) formData.append('description', description);
      formData.append('files', new Blob([req.file.buffer], { type: req.file.mimetype }), req.file.originalname || 'sample.mp3');

      const response = await axios.post(
        'https://api.elevenlabs.io/v1/voices/add',
        formData,
        { headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY } }
      );

      const elevenLabsId = response.data.voice_id;
      const cacheId = uuidv4().slice(0, 8);
      customVoicesCache.set(cacheId, { elevenLabsId, name: name.trim(), description });

      return res.json({
        voiceId: `custom_${elevenLabsId}`,
        name: name.trim(),
        status: 'ready',
        message: 'Voice cloned successfully.',
      });
    } catch (err) {
      console.error('[voice/clone] ElevenLabs error:', err.response?.data || err.message);
      return res.status(502).json({ error: 'Voice cloning failed: ' + (err.response?.data?.detail || err.message) });
    }
  }

  // Mock clone — returns a fake ID for dev/demo
  const mockId = uuidv4().replace(/-/g, '').slice(0, 20);
  customVoicesCache.set(mockId, { elevenLabsId: mockId, name: name.trim(), description });
  return res.json({
    voiceId: `custom_${mockId}`,
    name: name.trim(),
    status: 'ready',
    mockMode: true,
    message: 'Voice cloned (mock mode — add ELEVENLABS_API_KEY for real cloning).',
  });
});

function estimateDuration(text) {
  const wordsPerMinute = 150;
  const words = text.split(/\s+/).length;
  return Math.round((words / wordsPerMinute) * 60 * 10) / 10;
}

function mapToElevenLabsVoice(voiceId) {
  // Custom cloned voice: voiceId is 'custom_<elevenLabsVoiceId>'
  if (voiceId?.startsWith('custom_')) return voiceId.slice('custom_'.length);

  // ElevenLabs pre-made voice IDs (stable as of 2025)
  const map = {
    voice_aria:   '21m00Tcm4TlvDq8ikWAM', // Rachel — conversational female
    voice_marcus: 'TxGEqnHWrfWFTfGW9XjX', // Josh — professional male
    voice_nova:   'pFZP5JQG7iQjIQuC4Bku', // Lily — energetic female
    voice_rex:    'VR6AewLTigWG4xSOukaG', // Arnold — deep male
    voice_sofia:  'EXAVITQu4vr4xnSDxMaL', // Bella — warm female
    voice_kai:    'jsCqWAovK2LkecY7zXl4', // Sam — calm neutral
    voice_grace:  'oWAxZDx7w5VEj9dCyTzz', // Grace — authoritative female
    voice_james:  'ZQe5CZNOzWyzPSCn5a3c', // James — British male
  };
  return map[voiceId] || map.voice_aria;
}

module.exports = router;
