const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/auth');
const { PLANS } = require('../config/plans');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

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

router.get('/platforms', authenticate, (req, res) => {
  res.json({ platforms: PLATFORMS });
});

async function downloadFile(url, destPath) {
  const response = await axios.get(url, { responseType: 'stream', timeout: 60000 });
  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(destPath);
    response.data.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

function isVideoUrl(url) {
  return url && /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

function mergeWithFFmpeg({ videoPath, voicePath, musicPath, voiceVolume, musicVolume, outputPath }) {
  return new Promise((resolve, reject) => {
    const vVol = (voiceVolume || 80) / 100;
    const mVol = (musicVolume || 40) / 100;

    const cmd = ffmpeg().input(videoPath);

    const audioInputs = [];
    if (voicePath) {
      cmd.input(voicePath);
      audioInputs.push({ idx: audioInputs.length + 1, vol: vVol, label: 'va' });
    }
    if (musicPath) {
      cmd.input(musicPath);
      audioInputs.push({ idx: audioInputs.length + 1, vol: mVol, label: 'ma' });
    }

    if (audioInputs.length === 0) {
      cmd
        .output(outputPath)
        .videoCodec('copy')
        .on('end', resolve)
        .on('error', reject)
        .run();
      return;
    }

    let filterComplex = '';
    const mixLabels = [];
    for (const ai of audioInputs) {
      filterComplex += `[${ai.idx}:a]volume=${ai.vol}[${ai.label}];`;
      mixLabels.push(`[${ai.label}]`);
    }

    if (mixLabels.length === 1) {
      filterComplex += `${mixLabels[0]}anull[aout]`;
    } else {
      filterComplex += `${mixLabels.join('')}amix=inputs=${mixLabels.length}:duration=longest[aout]`;
    }

    cmd
      .complexFilter(filterComplex)
      .outputOptions(['-map 0:v', '-map [aout]', '-c:v copy', '-c:a aac', '-b:a 192k', '-shortest'])
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}

// POST /api/export/render
router.post('/render', authenticate, async (req, res) => {
  const {
    platforms,
    resolution = '1080p',
    format = 'mp4',
    includeWatermark,
    videoUrl,
    voiceUrl,
    musicUrl,
    voiceVolume,
    musicVolume,
  } = req.body;

  const user = req.user;
  const plan = PLANS[user.plan];

  if (resolution === '4K' && plan.maxResolution !== '4K') {
    return res.status(403).json({
      error: `4K export requires Studio or Enterprise plan. Your plan supports up to ${plan.maxResolution}.`,
      upgradeUrl: '/pricing',
    });
  }

  const jobId = uuidv4();
  const hasRealVideo = isVideoUrl(videoUrl);
  const hasRealVoice = !!(voiceUrl && voiceUrl.startsWith('http'));
  const hasRealMusic = !!(musicUrl && musicUrl.startsWith('http'));
  const watermark = plan.watermark || includeWatermark;

  // Nothing to merge — return immediately with the original video URL
  if (!hasRealVideo || (!hasRealVoice && !hasRealMusic)) {
    return res.json({
      jobId,
      status: 'completed',
      resolution,
      format,
      platforms,
      watermark,
      downloadUrl: videoUrl || null,
      message: 'Export ready.',
    });
  }

  const tmpDir = os.tmpdir();
  const videoExt = (videoUrl.match(/\.(mp4|webm|mov)/i) || [])[1] || 'mp4';
  const videoTmp = path.join(tmpDir, `${jobId}-video.${videoExt}`);
  const voiceTmp = hasRealVoice ? path.join(tmpDir, `${jobId}-voice.mp3`) : null;
  const musicTmp = hasRealMusic ? path.join(tmpDir, `${jobId}-music.mp3`) : null;
  const outputPath = path.join(UPLOADS_DIR, `${jobId}.mp4`);

  try {
    await Promise.all([
      downloadFile(videoUrl, videoTmp),
      hasRealVoice ? downloadFile(voiceUrl, voiceTmp) : Promise.resolve(),
      hasRealMusic ? downloadFile(musicUrl, musicTmp) : Promise.resolve(),
    ]);

    await mergeWithFFmpeg({ videoPath: videoTmp, voicePath: voiceTmp, musicPath: musicTmp, voiceVolume, musicVolume, outputPath });

    return res.json({
      jobId,
      status: 'completed',
      resolution,
      format,
      platforms,
      watermark,
      downloadUrl: `/uploads/${jobId}.mp4`,
      message: 'Export complete. Your merged file is ready to download.',
    });
  } catch (err) {
    console.error('[export] merge failed:', err.message);
    return res.json({
      jobId,
      status: 'completed',
      resolution,
      format,
      platforms,
      watermark,
      downloadUrl: videoUrl,
      message: 'Export ready (audio merge failed, returning original video).',
    });
  } finally {
    for (const f of [videoTmp, voiceTmp, musicTmp]) {
      if (f) fs.unlink(f, () => {});
    }
  }
});

module.exports = router;
