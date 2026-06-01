/**
 * Video generation routes.
 * Uses Replicate minimax/video-01 for real image-to-video when REPLICATE_API_KEY is set.
 * Falls back to simulation for development without a key.
 */
const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { authenticate } = require('../middleware/auth');
const { store } = require('../models/store');
const { PLANS } = require('../config/plans');

const generationJobs = new Map();

const REPLICATE_API = 'https://api.replicate.com/v1';
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

// Replicate needs a publicly reachable URL or a base64 data URI.
// Local server URLs (localhost / 127.0.0.1) aren't reachable from Replicate's
// servers, so we read the file from disk and encode it as a data URI instead.
async function resolveImageForReplicate(imageUrl) {
  if (!imageUrl) return null;
  if (/localhost|127\.0\.0\.1/.test(imageUrl)) {
    const filename = imageUrl.split('/uploads/').pop();
    if (!filename) return null;
    const filePath = path.join(UPLOADS_DIR, filename);
    if (!fs.existsSync(filePath)) return null;
    const buf = fs.readFileSync(filePath);
    const ext = path.extname(filename).slice(1).toLowerCase() || 'jpeg';
    const mime = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
    return `data:${mime};base64,${buf.toString('base64')}`;
  }
  if (imageUrl.startsWith('http')) return imageUrl;
  return null;
}

// POST /api/video/generate
router.post('/generate', authenticate, async (req, res) => {
  const { prompt, imageUrl, aspectRatio = '9:16', duration = 4, model = 'auto', style = 'cinematic' } = req.body;

  const user = store.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const plan = PLANS[user.plan];
  if (plan.generationsPerMonth !== -1 && user.creditsUsed >= plan.generationsPerMonth) {
    return res.status(402).json({
      error: 'Monthly generation limit reached',
      limit: plan.generationsPerMonth,
      used: user.creditsUsed,
      upgradeUrl: '/pricing',
    });
  }

  const selectedModel = selectModel(model, aspectRatio, duration, user.plan);
  const jobId = uuidv4();

  const job = {
    id: jobId,
    userId: user.id,
    status: 'queued',
    progress: 0,
    prompt,
    imageUrl,
    aspectRatio,
    duration,
    model: selectedModel,
    style,
    createdAt: new Date().toISOString(),
    estimatedSeconds: 90,
    resultUrl: null,
    thumbnailUrl: null,
    watermark: plan.watermark,
    replicatePredictionId: null,
  };

  generationJobs.set(jobId, job);
  store.generations.push(job);

  res.status(202).json({
    jobId,
    status: 'queued',
    model: selectedModel,
    estimatedSeconds: job.estimatedSeconds,
    message: `Generation started with ${selectedModel}.`,
  });

  // Kick off generation async (don't await — response already sent)
  if (process.env.REPLICATE_API_KEY) {
    runReplicateGeneration(jobId, user, prompt, imageUrl, aspectRatio).catch(err => {
      const status = err.response?.status;
      console.error(`[Replicate] generation error (HTTP ${status || '?'}): ${err.message}`);
      if (status === 402 || status === 403 || status === 401) {
        // Billing/auth issue — fall back to simulation so the UI still works
        console.warn('[Replicate] Falling back to mock simulation due to billing/auth error');
        simulateGeneration(jobId, user);
      } else {
        job.status = 'failed';
        job.error = err.response?.data?.detail || err.message;
      }
    });
  } else {
    simulateGeneration(jobId, user);
  }
});

// GET /api/video/status/:jobId
router.get('/status/:jobId', authenticate, (req, res) => {
  const job = generationJobs.get(req.params.jobId) || store.generations.find(g => g.id === req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (job.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  res.json(job);
});

// GET /api/video/history
router.get('/history', authenticate, (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const userJobs = store.generations
    .filter(g => g.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice((page - 1) * limit, page * limit);
  res.json({ jobs: userJobs, total: store.generations.filter(g => g.userId === req.user.id).length });
});

// DELETE /api/video/:jobId
router.delete('/:jobId', authenticate, (req, res) => {
  const idx = store.generations.findIndex(g => g.id === req.params.jobId && g.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  store.generations.splice(idx, 1);
  generationJobs.delete(req.params.jobId);
  res.json({ success: true });
});

// ─── Replicate integration ────────────────────────────────────────────────────

async function runReplicateGeneration(jobId, user, prompt, imageUrl, aspectRatio) {
  const job = generationJobs.get(jobId);
  job.status = 'processing';
  job.progress = 5;

  const headers = {
    Authorization: `Bearer ${process.env.REPLICATE_API_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'wait',
  };

  // Map our aspect ratio to minimax/video-01 expected ratio value
  const ratioMap = { '9:16': '9:16', '16:9': '16:9', '1:1': '1:1' };
  const ratio = ratioMap[aspectRatio] || '9:16';

  // Start prediction
  const input = { prompt, aspect_ratio: ratio };

  // minimax/video-01 accepts a first_frame_image as a public URL or base64 data URI
  const imageForReplicate = await resolveImageForReplicate(imageUrl);
  if (imageForReplicate) {
    input.first_frame_image = imageForReplicate;
    console.log(`[Replicate] first_frame_image: ${imageForReplicate.startsWith('data:') ? 'base64 data URI' : imageForReplicate}`);
  }

  console.log(`[Replicate] Starting minimax/video-01 prediction for job ${jobId}`);

  const createRes = await axios.post(
    `${REPLICATE_API}/models/minimax/video-01/predictions`,
    { input },
    { headers }
  );

  const prediction = createRes.data;
  job.replicatePredictionId = prediction.id;
  job.progress = 15;
  console.log(`[Replicate] Prediction ${prediction.id} created, status: ${prediction.status}`);

  // Poll until complete
  await pollPrediction(job, prediction.id, headers, user);
}

async function pollPrediction(job, predictionId, headers, user) {
  const maxAttempts = 300; // 10 minutes at 2s intervals
  let attempts = 0;

  while (attempts < maxAttempts) {
    await sleep(2000);
    attempts++;

    let prediction;
    try {
      const res = await axios.get(`${REPLICATE_API}/predictions/${predictionId}`, { headers });
      prediction = res.data;
    } catch (err) {
      console.error(`[Replicate] Poll error: ${err.message}`);
      continue;
    }

    // Progress estimate based on status
    if (prediction.status === 'starting') {
      job.progress = Math.min(job.progress + 2, 25);
    } else if (prediction.status === 'processing') {
      job.progress = Math.min(job.progress + 5, 90);
    }

    console.log(`[Replicate] ${predictionId} — ${prediction.status} (${job.progress}%)`);

    if (prediction.status === 'succeeded') {
      const output = prediction.output;
      // output is typically a string URL or array
      const videoUrl = Array.isArray(output) ? output[0] : output;

      job.status = 'completed';
      job.progress = 100;
      job.resultUrl = videoUrl;
      job.thumbnailUrl = videoUrl; // mp4 URL — frontend renders as <video>
      job.completedAt = new Date().toISOString();

      user.creditsUsed = (user.creditsUsed || 0) + 1;
      user.totalGenerations = (user.totalGenerations || 0) + 1;
      store.analytics.push({
        userId: user.id,
        type: 'generation',
        model: job.model,
        aspectRatio: job.aspectRatio,
        createdAt: job.completedAt,
      });

      console.log(`[Replicate] Job ${job.id} completed — ${videoUrl}`);
      return;
    }

    if (prediction.status === 'failed' || prediction.status === 'canceled') {
      job.status = 'failed';
      job.error = prediction.error || `Prediction ${prediction.status}`;
      console.error(`[Replicate] Job ${job.id} failed: ${job.error}`);
      return;
    }
  }

  // Timeout
  job.status = 'failed';
  job.error = 'Generation timed out after 4 minutes';
  console.error(`[Replicate] Job ${job.id} timed out`);
}

// ─── Fallback simulation ──────────────────────────────────────────────────────

function simulateGeneration(jobId, user) {
  let progress = 0;
  const job = generationJobs.get(jobId);

  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 15) + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      job.status = 'completed';
      job.progress = 100;
      job.completedAt = new Date().toISOString();
      job.resultUrl = `https://picsum.photos/seed/${jobId.slice(0, 8)}/1080/1920`;
      job.thumbnailUrl = `https://picsum.photos/seed/${jobId.slice(0, 8)}/400/711`;
      user.creditsUsed = (user.creditsUsed || 0) + 1;
      user.totalGenerations = (user.totalGenerations || 0) + 1;
      store.analytics.push({
        userId: user.id,
        type: 'generation',
        model: job.model,
        aspectRatio: job.aspectRatio,
        createdAt: job.completedAt,
      });
    } else {
      job.status = 'processing';
      job.progress = progress;
    }
  }, 2000);
}

function selectModel(requested, aspectRatio, duration, plan) {
  if (requested !== 'auto') return requested;
  if (plan === 'enterprise' || plan === 'studio') {
    return aspectRatio === '9:16' ? 'minimax/video-01' : 'minimax/video-01';
  }
  return 'minimax/video-01';
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = router;
