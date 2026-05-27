const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { authenticate, requirePlan } = require('../middleware/auth');
const { PLANS } = require('../config/plans');

const PLATFORMS = [
  { id: 'tiktok', label: 'TikTok', aspectRatio: '9:16', maxDuration: 180, resolution: '1080x1920' },
  { id: 'instagram_reels', label: 'Instagram Reels', aspectRatio: '9:16', maxDuration: 90, resolution: '1080x1920' },
  { id: 'youtube_shorts', label: 'YouTube Shorts', aspectRatio: '9:16', maxDuration: 60, resolution: '1080x1920' },
  { id: 'youtube', label: 'YouTube', aspectRatio: '16:9', maxDuration: null, resolution: '3840x2160' },
  { id: 'instagram_feed', label: 'Instagram Feed', aspectRatio: '1:1', maxDuration: 60, resolution: '1080x1080' },
  { id: 'facebook', label: 'Facebook', aspectRatio: '16:9', maxDuration: null, resolution: '1920x1080' },
  { id: 'twitter_x', label: 'X (Twitter)', aspectRatio: '16:9', maxDuration: 140, resolution: '1920x1080' },
  { id: 'linkedin', label: 'LinkedIn', aspectRatio: '16:9', maxDuration: 600, resolution: '1920x1080' },
];

// GET /api/export/platforms
router.get('/platforms', authenticate, (req, res) => {
  res.json({ platforms: PLATFORMS });
});

// POST /api/export/render
router.post('/render', authenticate, async (req, res) => {
  const { projectId, platforms, resolution = '1080p', format = 'mp4', includeWatermark } = req.body;

  const user = req.user;
  const plan = PLANS[user.plan];
  const maxRes = plan.maxResolution;

  // Enforce resolution cap per plan
  if (resolution === '4K' && maxRes !== '4K') {
    return res.status(403).json({
      error: `4K export requires Studio or Enterprise plan. Your plan supports up to ${maxRes}.`,
      upgradeUrl: '/pricing',
    });
  }

  const jobId = uuidv4();
  res.json({
    jobId,
    status: 'queued',
    resolution,
    format,
    platforms,
    watermark: plan.watermark || includeWatermark,
    estimatedSeconds: 45,
    message: 'Export render queued. Download link will be ready in ~45 seconds.',
  });
});

module.exports = router;
