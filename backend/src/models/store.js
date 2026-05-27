/**
 * In-memory data store for development.
 * Replace with a real database (PostgreSQL / MongoDB) for production.
 */
const { v4: uuidv4 } = require('uuid');

const store = {
  users: [],
  projects: [],
  generations: [],
  analytics: [],
  marketplace: generateMockTemplates(),
  voices: generateMockVoices(),
};

function generateMockTemplates() {
  const categories = ['cinematic', 'social', 'e-commerce', 'real-estate', 'education', 'news'];
  return Array.from({ length: 24 }, (_, i) => ({
    id: uuidv4(),
    title: [
      'Cinematic Drift', 'Neon City Pulse', 'Golden Hour Glow', 'Ocean Wave Surge',
      'Forest Whisper', 'Urban Street Beat', 'Luxury Product Reveal', 'Property Walkthrough',
      'Course Intro Fade', 'Breaking News Blur', 'Retro Film Grain', 'Minimal White Space',
      'Dramatic Storm', 'Soft Morning Light', 'Bold Typography', 'Viral Vertical Loop',
      'E-com Lifestyle', 'Real Estate Drone', 'Tutorial Explainer', 'Podcast Waveform',
      'Brand Reveal', 'TikTok Dance BG', 'Travel Montage', 'Product 360',
    ][i],
    category: categories[i % categories.length],
    author: `creator_${i + 1}`,
    authorName: ['PixelDrift', 'NeonHaze', 'GoldenFrame', 'OceanView', 'ForestLens', 'UrbanShot'][i % 6],
    price: [0, 0, 4.99, 9.99, 14.99, 0][i % 6],
    downloads: Math.floor(Math.random() * 5000) + 100,
    rating: (3.5 + Math.random() * 1.5).toFixed(1),
    tags: ['cinematic', 'vertical', '4k', 'trending', 'new'][i % 5],
    preview: `https://picsum.photos/seed/${i + 10}/400/225`,
    featured: i < 6,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  }));
}

function generateMockVoices() {
  return [
    { id: 'voice_aria', name: 'Aria', gender: 'female', accent: 'American', style: 'conversational', preview: true },
    { id: 'voice_marcus', name: 'Marcus', gender: 'male', accent: 'British', style: 'professional', preview: true },
    { id: 'voice_nova', name: 'Nova', gender: 'female', accent: 'Australian', style: 'energetic', preview: true },
    { id: 'voice_rex', name: 'Rex', gender: 'male', accent: 'American', style: 'deep', preview: true },
    { id: 'voice_sofia', name: 'Sofia', gender: 'female', accent: 'Spanish', style: 'warm', preview: true },
    { id: 'voice_kai', name: 'Kai', gender: 'neutral', accent: 'American', style: 'calm', preview: true },
    { id: 'voice_grace', name: 'Grace', gender: 'female', accent: 'British', style: 'authoritative', preview: true },
    { id: 'voice_james', name: 'James', gender: 'male', accent: 'American', style: 'storyteller', preview: true },
  ];
}

// Seed a demo user
store.users.push({
  id: 'demo-user-001',
  email: 'demo@visioai.com',
  password: '$2a$10$rIC/yEWGH3MrJqb4ZB/5vu8gHuRopsBqH1fBiqF6AMHCOH7dQFmQC', // "demo1234"
  name: 'Demo Creator',
  plan: 'studio',
  credits: 85,
  creditsUsed: 15,
  avatar: null,
  createdAt: new Date().toISOString(),
  lastActive: new Date().toISOString(),
  totalGenerations: 47,
  totalProjects: 8,
});

module.exports = { store, uuidv4 };
