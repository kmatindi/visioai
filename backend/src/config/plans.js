/**
 * VisioAI Subscription Plan Configuration
 * Mirrors the monetisation architecture from the strategy brief.
 */
const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    generationsPerMonth: 5,
    maxResolution: '720p',
    watermark: true,
    commercialLicence: false,
    voiceOver: false,
    voiceCloning: false,
    apiAccess: false,
    maxClipDuration: 15, // seconds
    models: ['standard'],
    exportFormats: ['mp4'],
    supportLevel: 'community',
  },
  pro: {
    name: 'Pro',
    price: 29,
    generationsPerMonth: 100,
    maxResolution: '1080p',
    watermark: false,
    commercialLicence: true,
    voiceOver: true,
    voiceCloning: false,
    apiAccess: false,
    maxClipDuration: 30,
    models: ['standard', 'cinematic'],
    exportFormats: ['mp4', 'mov', 'webm'],
    supportLevel: 'email',
  },
  studio: {
    name: 'Studio',
    price: 99,
    generationsPerMonth: -1, // unlimited
    maxResolution: '4K',
    watermark: false,
    commercialLicence: true,
    voiceOver: true,
    voiceCloning: true,
    apiAccess: true,
    maxClipDuration: 120,
    models: ['standard', 'cinematic', 'ultra', 'vertical'],
    exportFormats: ['mp4', 'mov', 'webm', 'gif', 'frames'],
    priorityQueue: true,
    supportLevel: 'priority',
    characterConsistency: true,
    multilingualDubbing: true,
  },
  enterprise: {
    name: 'Enterprise',
    priceRange: '$500–5,000/mo',
    generationsPerMonth: -1,
    maxResolution: '4K',
    watermark: false,
    commercialLicence: true,
    voiceOver: true,
    voiceCloning: true,
    apiAccess: true,
    maxClipDuration: 600,
    models: ['all'],
    exportFormats: ['all'],
    priorityQueue: true,
    supportLevel: 'dedicated',
    characterConsistency: true,
    multilingualDubbing: true,
    privateDeployment: true,
    sso: true,
    sla: true,
    customModels: true,
    whiteLabel: true,
  },
};

/**
 * Credit pack options (usage-based billing)
 */
const CREDIT_PACKS = [
  { id: 'pack_10', price: 10, credits: 20, label: '20 generations' },
  { id: 'pack_25', price: 25, credits: 60, label: '60 generations' },
  { id: 'pack_50', price: 50, credits: 150, label: '150 generations' },
];

module.exports = { PLANS, CREDIT_PACKS };
