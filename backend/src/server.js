require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const aiDirectorRoutes = require('./routes/aiDirector');
const videoRoutes = require('./routes/video');
const voiceRoutes = require('./routes/voice');
const musicRoutes = require('./routes/music');
const exportRoutes = require('./routes/export');
const analyticsRoutes = require('./routes/analytics');
const marketplaceRoutes = require('./routes/marketplace');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Stricter limit for AI generation endpoints
const generationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Generation rate limit reached. Please wait a moment.' },
});
app.use('/api/video/generate', generationLimiter);
app.use('/api/voice/generate', generationLimiter);

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/ai-director', aiDirectorRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/marketplace', marketplaceRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      aiDirector: 'active',
      videoGeneration: process.env.KLING_API_KEY ? 'configured' : 'mock',
      voiceGeneration: process.env.ELEVENLABS_API_KEY ? 'configured' : 'mock',
      musicGeneration: process.env.SUNO_API_KEY ? 'configured' : 'mock',
    },
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 VisioAI Backend running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Mode: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
