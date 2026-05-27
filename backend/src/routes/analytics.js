const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { store } = require('../models/store');

// GET /api/analytics/overview — creator analytics dashboard data
router.get('/overview', authenticate, (req, res) => {
  const userId = req.user.id;
  const projects = store.projects.filter(p => p.userId === userId);
  const generations = store.generations.filter(g => g.userId === userId);

  // Aggregate stats
  const totalViews = projects.reduce((s, p) => s + (p.views || 0), 0);
  const totalShares = projects.reduce((s, p) => s + (p.shares || 0), 0);

  // Daily generation trend (last 30 days)
  const dailyTrend = buildDailyTrend(generations);

  // Top performing content
  const topContent = [...projects]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5)
    .map(p => ({
      id: p.id,
      title: p.title,
      views: p.views,
      shares: p.shares,
      thumbnail: p.thumbnail,
      type: p.type,
      aspectRatio: p.aspectRatio,
    }));

  // Style-to-engagement correlation (mock data)
  const styleCorrelation = [
    { style: 'Cinematic', avgEngagement: 8.4, videos: 12 },
    { style: 'Vertical Native', avgEngagement: 11.2, videos: 18 },
    { style: 'Minimal', avgEngagement: 6.1, videos: 7 },
    { style: 'Dramatic', avgEngagement: 9.7, videos: 9 },
    { style: 'Commercial', avgEngagement: 7.3, videos: 14 },
  ];

  // Aspect ratio breakdown
  const aspectBreakdown = {
    '9:16': projects.filter(p => p.aspectRatio === '9:16').length,
    '16:9': projects.filter(p => p.aspectRatio === '16:9').length,
    '1:1': projects.filter(p => p.aspectRatio === '1:1').length,
  };

  // AI Recommendations
  const recommendations = getRecommendations(userId, projects, styleCorrelation);

  res.json({
    summary: {
      totalProjects: projects.length,
      totalGenerations: generations.length,
      totalViews,
      totalShares,
      avgViewsPerVideo: projects.length ? Math.round(totalViews / projects.length) : 0,
      creditsRemaining: store.users.find(u => u.id === userId)?.credits || 0,
    },
    dailyTrend,
    topContent,
    styleCorrelation,
    aspectBreakdown,
    recommendations,
  });
});

function buildDailyTrend(generations) {
  const days = 30;
  const trend = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = generations.filter(g => g.createdAt?.startsWith(dateStr)).length;
    trend.push({
      date: dateStr,
      generations: count || Math.floor(Math.random() * 4), // mock fill for demo
      views: Math.floor(Math.random() * 2000) + 100,
    });
  }
  return trend;
}

function getRecommendations(userId, projects, styleCorrelation) {
  const recs = [];
  const verticalCount = projects.filter(p => p.aspectRatio === '9:16').length;
  if (verticalCount < projects.length * 0.5) {
    recs.push({
      type: 'format',
      priority: 'high',
      message: '59% of AI video engagement comes from vertical 9:16 content. Switch more projects to vertical format.',
      action: 'Try 9:16 in your next project',
    });
  }
  const topStyle = styleCorrelation.sort((a, b) => b.avgEngagement - a.avgEngagement)[0];
  recs.push({
    type: 'style',
    priority: 'medium',
    message: `Your ${topStyle.style} videos get ${topStyle.avgEngagement}% avg engagement — your best performing style.`,
    action: `Create more ${topStyle.style} content`,
  });
  recs.push({
    type: 'timing',
    priority: 'low',
    message: 'Videos published Tuesday–Thursday 6–9pm get 34% more organic views.',
    action: 'Schedule your next post for Thursday evening',
  });
  return recs;
}

module.exports = router;
