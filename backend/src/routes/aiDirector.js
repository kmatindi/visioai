/**
 * AI Director Engine — the core VisioAI differentiator.
 * Rewrites simple user prompts into fully-engineered cinematic video prompts.
 */
const router = require('express').Router();
const axios = require('axios');
const { authenticate } = require('../middleware/auth');

const SYSTEM_PROMPT = `You are the VisioAI Director Engine — an expert AI cinematographer and video prompt engineer.

Your job: Take any simple description of a scene or motion and rewrite it as a professional, highly-detailed video generation prompt optimised for AI video models (Kling, Veo, Runway).

Your output prompt must include ALL of the following elements:
1. SUBJECT: Precise description of what is in frame
2. ACTION/MOTION: Exact movement, speed, and physics
3. CAMERA: Shot type (close-up, wide, aerial, macro, etc.), camera movement (dolly in, pan left, orbit, static), and lens characteristics
4. LIGHTING: Light source, quality (hard/soft), colour temperature, time of day if relevant
5. COLOUR GRADE: Film look, colour palette, mood (warm golden, cool blue, desaturated, high contrast)
6. ATMOSPHERE: Depth of field, particles (dust, rain, bokeh), environmental details
7. STYLE: Cinematic reference if applicable (e.g., "shot like a Nolan film", "Instagram Reels aesthetic")
8. DURATION & PACING: Suggested clip length and edit pace

Rules:
- Output ONLY the engineered prompt — no preamble, no explanation, no bullet points
- Target 120–180 words for the output prompt
- Make it immediately usable with Kling Omni, Veo 3, or Runway Gen-4
- Optimise for the aspect ratio if the user specifies one (default: 9:16 vertical for social)
- If the user specifies a vertical/social format, front-load vertical-first framing instructions`;

/**
 * POST /api/ai-director/enhance
 * Takes a simple prompt and returns a fully engineered cinematic prompt.
 */
router.post('/enhance', authenticate, async (req, res) => {
  const { prompt, aspectRatio = '9:16', style = 'cinematic', duration = 'auto' } = req.body;

  if (!prompt || prompt.trim().length < 3) {
    return res.status(400).json({ error: 'Prompt is too short' });
  }

  // If Anthropic API key is configured, use Claude
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 400,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: `User's simple prompt: "${prompt}"\nAspect ratio: ${aspectRatio}\nStyle preference: ${style}\nTarget duration: ${duration}`,
            },
          ],
        },
        {
          headers: {
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
        }
      );
      const enhanced = response.data.content[0].text.trim();
      return res.json({ original: prompt, enhanced, model: 'claude-haiku', tokens: response.data.usage });
    } catch (err) {
      console.error('AI Director (Anthropic) error:', err.message);
      // Fall through to mock
    }
  }

  // Mock enhancement for development (no API key needed)
  const enhanced = buildMockEnhancement(prompt, aspectRatio, style);
  res.json({ original: prompt, enhanced, model: 'mock-director' });
});

/**
 * POST /api/ai-director/suggest
 * Returns 3 prompt ideas based on a category/use-case.
 */
router.post('/suggest', authenticate, async (req, res) => {
  const { category = 'social', industry } = req.body;
  const suggestions = getMockSuggestions(category, industry);
  res.json({ suggestions });
});

function buildMockEnhancement(prompt, aspectRatio, style) {
  const isVertical = aspectRatio === '9:16';
  const frameNote = isVertical
    ? 'Vertical 9:16 frame, subject centred for mobile viewing, upper-third rule applied. '
    : 'Cinematic 16:9 widescreen composition, rule-of-thirds framing. ';

  return `${frameNote}${capitalise(prompt.trim())} — captured in a ${style} style with a ${getCamera(style)} lens configuration. ${getMotion(prompt)} The scene unfolds in ${getLighting(prompt)}, with ${getColorGrade(style)} colour grading lending a ${getMood(style)} quality. Shallow depth of field separates subject from a softly blurred environment, ${getAtmosphere(prompt)}. Camera movement: ${getCameraMove(style)}, creating a dynamic, high-production feel. Shot duration: 4–6 seconds at 24fps. Rendered at maximum quality for commercial use. Optimised for ${isVertical ? 'TikTok, Instagram Reels, and YouTube Shorts' : 'YouTube and broadcast'} distribution.`;
}

function getCamera(style) {
  const map = { cinematic: '35mm anamorphic', commercial: '50mm prime', dramatic: '24mm wide', minimal: '85mm portrait' };
  return map[style] || '50mm prime';
}
function getMotion(p) {
  if (p.includes('water') || p.includes('wave')) return 'Fluid motion with realistic fluid dynamics and caustic light refractions.';
  if (p.includes('fire') || p.includes('flame')) return 'Volumetric fire simulation with authentic ember particles rising upward.';
  if (p.includes('person') || p.includes('walk')) return 'Natural human locomotion with subtle motion blur and cloth physics.';
  return 'Smooth, physics-accurate motion with natural deceleration curves.';
}
function getLighting(p) {
  if (p.includes('night') || p.includes('dark')) return 'dramatic low-key artificial lighting with deep shadows and practical light sources';
  if (p.includes('sunset') || p.includes('golden')) return 'warm golden-hour magic light at 3200K, long directional shadows';
  return 'soft diffused natural daylight at 5600K, overcast studio quality';
}
function getColorGrade(style) {
  const map = { cinematic: 'teal-and-orange Hollywood blockbuster', commercial: 'clean neutral', dramatic: 'high-contrast desaturated', minimal: 'muted pastel' };
  return map[style] || 'teal-and-orange';
}
function getMood(style) {
  const map = { cinematic: 'epic', commercial: 'polished', dramatic: 'intense', minimal: 'elegant' };
  return map[style] || 'compelling';
}
function getAtmosphere(p) {
  if (p.includes('rain')) return 'fine rain particles catching light, wet surface reflections';
  if (p.includes('fog') || p.includes('mist')) return 'atmospheric volumetric mist layers adding cinematic depth';
  return 'fine dust motes suspended in the light rays adding depth';
}
function getCameraMove(style) {
  const map = { cinematic: 'slow cinematic dolly-in with imperceptible upward tilt', commercial: 'clean static lock-off', dramatic: 'handheld push-in', minimal: 'gentle orbital drift' };
  return map[style] || 'slow dolly-in';
}
function capitalise(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

function getMockSuggestions(category, industry) {
  const base = {
    social: [
      'A steaming coffee cup on a marble surface, morning light streaming through a window',
      'Fashion model walking through neon-lit city streets at night, rain-slicked pavement',
      'Hands opening a beautifully packaged product box, confetti rising',
    ],
    'real-estate': [
      'Luxury penthouse living room with floor-to-ceiling city views at golden hour',
      'Swimming pool terrace with infinity edge overlooking the ocean at sunset',
      'Modern kitchen with stone island, natural light flooding through skylights',
    ],
    ecommerce: [
      'Premium watch rotating on a black marble surface with dramatic rim lighting',
      'Skincare product bottles surrounded by fresh botanicals and water droplets',
      'Athletic shoes launching into the air with motion-trail particle effects',
    ],
    education: [
      'Abstract 3D molecular structures rotating in deep blue scientific space',
      'Glowing neural network pathways expanding through a dark void',
      'Historical map with animated routes spreading across continents',
    ],
  };
  return base[category] || base.social;
}

module.exports = router;
