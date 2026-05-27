# VisioAI — Full-Stack AI Video Creation Platform

> The operating system for video creators. Image → Video → Voice → Music → Captions → 4K Export in one workflow.

Built to the strategy brief: $1M ARR Year 1 target, $1B+ by Year 5. Equivalent to ElevenLabs for video.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| State | React Context + Axios |
| Charts | Recharts |
| AI Director | Anthropic Claude API (or offline mock) |
| Video Gen | Kling Omni, Veo 3.1, Runway (configurable) |
| Voice | ElevenLabs API (configurable) |
| Music | Suno API (configurable) |

---

## Quick Start

### 1. Install dependencies

```bash
# Root (installs both workspaces)
npm install

# Or separately:
cd backend && npm install
cd frontend && npm install
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and add your API keys:

```env
# Required for AI Director to use real Claude
ANTHROPIC_API_KEY=your_key_here

# Optional — platform works in mock mode without these
ELEVENLABS_API_KEY=...
KLING_API_KEY=...
RUNWAY_API_KEY=...
SUNO_API_KEY=...
```

> **Mock mode**: All AI generation works without API keys — it returns structured mock responses. Add real API keys to enable actual audio/video generation.

### 3. Run development servers

```bash
# Both frontend + backend together:
npm run dev

# Or separately:
cd backend && npm run dev    # → http://localhost:5000
cd frontend && npm run dev   # → http://localhost:5173
```

### 4. Demo login

Use the **"Try live demo"** button on the landing page or login page — no account needed. Demo account has Studio plan access.

---

## Platform Pages

| Route | Description |
|---|---|
| `/` | Landing page with pricing, features, testimonials |
| `/login` | Sign in + instant demo |
| `/register` | Free account creation |
| `/dashboard` | Project library, stats, quick actions |
| `/studio` | Full creation workspace (6-step workflow) |
| `/analytics` | Creator analytics + AI recommendations |
| `/marketplace` | Template & style marketplace |
| `/pricing` | All plans + credit packs |

---

## Core Features Built

### 1. AI Director Engine
The centrepiece differentiator. Takes any simple user prompt ("coffee cup on marble") and rewrites it into a fully-engineered 150-word cinematic prompt with camera movements, lighting, colour grade, and physics instructions.

- **With ANTHROPIC_API_KEY**: Uses Claude Haiku for real AI enhancement
- **Without**: Uses a sophisticated rule-based mock that demonstrates the concept

### 2. Full Studio Workflow
6-step creation workspace:
1. **Image upload** — drag & drop, file picker
2. **AI Director** — prompt enhancement with aspect ratio & style control
3. **Animate** — model selection (Kling Omni, Veo, Runway), duration, generation progress polling
4. **Voice** — 8 voice characters, 50-language selector, script input
5. **Music** — 6 mood categories, duration control
6. **Export** — platform selector (TikTok, Reels, YouTube, etc.), resolution (720p/1080p/4K)

### 3. Model-Agnostic Routing
Auto-routes to the best model based on aspect ratio, duration, and plan tier. Users never need to know which underlying model is running.

### 4. Creator Analytics Dashboard
- 30-day generation & views trend chart
- Style → engagement correlation bar chart
- AI-powered content recommendations (3 priority levels)
- Top performing content leaderboard

### 5. Template Marketplace
- 24 pre-seeded templates across 6 categories
- Sort by trending/new/rating
- Free & paid templates (30% commission model)
- Category filtering

### 6. Subscription Tiers
Full plan enforcement:
- **Free**: 5 gen/mo, watermark, 720p
- **Pro**: 100 gen/mo, 1080p, commercial licence, voice-over ($29/mo)
- **Studio**: Unlimited, 4K, voice cloning, API, character consistency, multilingual dubbing ($99/mo)
- **Enterprise**: Private deployment, SSO, SLA, custom models ($500–5,000/mo)

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/demo` | Instant demo login |
| GET | `/api/users/me` | Current user + plan details |
| POST | `/api/ai-director/enhance` | Enhance prompt with AI Director |
| POST | `/api/video/generate` | Start video generation job |
| GET | `/api/video/status/:id` | Poll generation progress |
| POST | `/api/voice/generate` | Generate voice-over |
| GET | `/api/voice/voices` | List available voices |
| GET | `/api/voice/languages` | 50 supported languages |
| POST | `/api/music/generate` | Generate background music |
| GET | `/api/projects` | List user projects |
| POST | `/api/projects` | Create project |
| GET | `/api/analytics/overview` | Creator analytics data |
| GET | `/api/marketplace/templates` | Browse marketplace |
| GET | `/api/health` | Server health + API key status |

---

## Adding Real AI Models

### Video Generation (Kling)
```env
KLING_API_KEY=your_key
```
Update `backend/src/routes/video.js` → `simulateGeneration()` to call the real Kling API.

### Voice-over (ElevenLabs)
```env
ELEVENLABS_API_KEY=your_key
```
Already wired in `backend/src/routes/voice.js` — add key and it activates automatically.

### AI Director (Claude/Anthropic)
```env
ANTHROPIC_API_KEY=your_key
```
Already wired in `backend/src/routes/aiDirector.js` — add key and it activates automatically.

### Music (Suno)
```env
SUNO_API_KEY=your_key
```
Hook in `backend/src/routes/music.js` → `POST /generate`.

---

## Deployment

### Frontend (Vercel / Netlify)
```bash
cd frontend && npm run build
# Deploy the dist/ folder
```

### Backend (Railway / Render / Fly.io)
```bash
cd backend && npm start
# Set NODE_ENV=production and all API keys as environment variables
```

### Full-stack (Docker)
A `docker-compose.yml` can be added for containerized deployment. The backend serves as the API and the frontend is built as a static SPA.

---

## Revenue Streams (per strategy)

1. **Subscription SaaS** — Free / Pro ($29) / Studio ($99) / Enterprise ($500–5,000)
2. **Credit packs** — $10 / $25 / $50 top-ups
3. **API access** — $0.05–0.15/generation
4. **White-label** — $2,000–10,000/month
5. **Marketplace** — 30% commission on template sales
6. **Data licensing** — Year 3+
7. **Vertical SaaS** — Real Estate ($149), E-commerce ($199), Education ($79)

---

*VisioAI · Confidential · May 2026*
