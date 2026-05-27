import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Wand2, Film, Mic2, Music, Captions, Upload, Zap,
  ChevronRight, Star, Users, TrendingUp, Globe,
  Check, ArrowRight, Play, Sparkles
} from 'lucide-react';

const FEATURES = [
  {
    icon: Wand2, title: 'AI Director Engine',
    desc: 'Type "coffee cup on marble" and get a fully-engineered 150-word cinematic prompt. Perfect output, first try.',
    badge: 'Core Differentiator',
  },
  {
    icon: Film, title: 'Image → Video',
    desc: 'Animate any image with Kling Omni, Veo 3.1, or Runway. Model-agnostic routing picks the best for your input.',
  },
  {
    icon: Mic2, title: '50-Language Voice + Lip Sync',
    desc: 'Generate voice-over in 50 languages with synchronized lip movement. Record once, distribute globally.',
    badge: 'vs ElevenLabs',
  },
  {
    icon: Music, title: 'AI Music Generation',
    desc: 'Generate original royalty-free music matched to your video mood. No Suno subscription needed.',
  },
  {
    icon: Captions, title: 'Smart Captions',
    desc: 'Auto-generate captions with customizable styles. 40% higher engagement on captioned social videos.',
  },
  {
    icon: Upload, title: '4K Export → Social',
    desc: 'Export optimized for TikTok, Reels, YouTube Shorts, or broadcast. One click, perfect every time.',
  },
];

const STATS = [
  { value: '$2.8B', label: 'Image-to-video market 2026' },
  { value: '38.9%', label: 'Annual market CAGR' },
  { value: '50M+', label: 'Global content creators' },
  { value: '5 → 1', label: 'Tools replaced' },
];

const PLANS = [
  {
    name: 'Free', price: 0, period: '/mo',
    features: ['5 generations/month', 'AI Director Engine', '720p export', 'Watermark included', 'Community support'],
    cta: 'Get started free', variant: 'outline', popular: false,
  },
  {
    name: 'Pro', price: 29, period: '/mo',
    features: ['100 generations/month', 'All AI models', '1080p export', 'Commercial licence', 'AI Voice-over', 'No watermark'],
    cta: 'Start Pro', variant: 'gold', popular: true,
  },
  {
    name: 'Studio', price: 99, period: '/mo',
    features: ['Unlimited generations', '4K export', 'Voice cloning', 'API access', 'Character consistency', '50-language dubbing', 'Priority queue'],
    cta: 'Start Studio', variant: 'outline', popular: false,
  },
];

const TESTIMONIALS = [
  { name: 'Sarah K.', role: 'E-commerce Brand Owner', text: 'Replaced Midjourney + Runway + ElevenLabs in one tool. My TikTok ads now cost $8 to produce vs. $200. Game changer.', avatar: 'SK', rating: 5 },
  { name: 'Marcus T.', role: 'Real Estate Agent', text: 'Property listings with VisioAI videos get 403% more inquiries. I\'ve closed 3 extra deals in 2 months.', avatar: 'MT', rating: 5 },
  { name: 'Priya R.', role: 'Online Course Creator', text: 'I built an entire $2,000 course using VisioAI for all the video content. No camera needed. 10x my output.', avatar: 'PR', rating: 5 },
];

const WORKFLOW = [
  { step: '01', title: 'Upload or describe', desc: 'Drop an image or just type what you want' },
  { step: '02', title: 'AI Director enhances', desc: 'Your simple idea becomes a cinematic prompt' },
  { step: '03', title: 'Generate & compose', desc: 'Video, voice, music, captions — all in one place' },
  { step: '04', title: 'Export & publish', desc: 'Platform-optimized in one click' },
];

export default function LandingPage() {
  const { user, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [loadingDemo, setLoadingDemo] = useState(false);

  const handleDemo = async () => {
    setLoadingDemo(true);
    try {
      await demoLogin();
      navigate('/dashboard');
      toast.success('Welcome to VisioAI Studio! (Demo mode)');
    } catch {
      toast.error('Could not start demo — is the backend running?');
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b" style={{ background: 'rgba(10,10,11,0.85)', backdropFilter: 'blur(16px)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-display font-black text-black"
              style={{ background: 'linear-gradient(135deg, #E8C96A, #C9A84C)' }}>V</div>
            <span className="text-xl font-display font-bold">Visio<span style={{ color: 'var(--gold)' }}>AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Pricing', 'Marketplace'].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="text-sm font-medium transition-colors hover:text-white" style={{ color: 'var(--text-secondary)' }}>{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard" className="btn-gold py-2 px-5 rounded-xl text-sm font-semibold">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Sign in</Link>
                <Link to="/register" className="btn-gold py-2 px-5 rounded-xl text-sm font-semibold">Start free</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-20 px-6">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #C9A84C 0%, transparent 70%)' }} />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-8"
            style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: 'var(--gold)' }}>
            <Sparkles size={14} />
            The operating system for video creators
          </div>

          <h1 className="text-6xl md:text-7xl font-display font-black leading-[1.05] mb-6">
            One tool.<br />
            <span className="text-gold-gradient">Five replaced.</span>
          </h1>

          <p className="text-xl max-w-2xl mx-auto mb-4" style={{ color: 'var(--text-secondary)' }}>
            Image → Video → Voice → Music → Captions → 4K Export — all in one workflow.
            The tool ElevenLabs, Runway, and Midjourney can't be because they're point solutions.
          </p>

          <p className="text-sm mb-10" style={{ color: 'var(--text-muted)' }}>
            5 tools · 5 subscriptions · ~$130/month → VisioAI at <strong style={{ color: 'var(--gold)' }}>$29/month</strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <button className="btn-gold flex items-center gap-2 py-3.5 px-8 rounded-xl text-base font-bold">
                <Zap size={18} />
                Start creating free
                <ArrowRight size={16} />
              </button>
            </Link>
            <button
              onClick={handleDemo}
              disabled={loadingDemo}
              className="btn-outline flex items-center gap-2 py-3.5 px-8 rounded-xl text-base font-semibold"
            >
              <Play size={16} />
              {loadingDemo ? 'Loading demo…' : 'Try live demo'}
            </button>
          </div>

          <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
            No credit card required · 5 free generations per month
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y py-12 px-6" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-display font-black mb-1 text-gold-gradient">{value}</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-display font-black mb-3">From idea to published video in minutes</h2>
            <p style={{ color: 'var(--text-secondary)' }}>No technical knowledge required. The AI Director handles the hard part.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {WORKFLOW.map(({ step, title, desc }) => (
              <div key={step} className="relative">
                <div className="p-6 rounded-2xl h-full" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <div className="text-4xl font-display font-black mb-3 text-gold-gradient">{step}</div>
                  <h3 className="font-bold mb-2">{title}</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                </div>
                {step !== '04' && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                    <ChevronRight size={20} style={{ color: 'var(--gold)' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-display font-black mb-3">8 structural advantages.<br />Not marketing copy.</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              These aren't features competitors can copy next week. They're architecture.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, badge }) => (
              <div key={title} className="p-6 rounded-2xl transition-all hover:-translate-y-1 gradient-border"
                style={{ background: 'var(--bg-card)' }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(201,168,76,0.15)' }}>
                    <Icon size={20} style={{ color: 'var(--gold)' }} />
                  </div>
                  {badge && <span className="badge-gold text-xs">{badge}</span>}
                </div>
                <h3 className="font-bold mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Director Showcase */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 rounded-3xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Wand2 size={16} style={{ color: 'var(--gold)' }} />
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--gold)' }}>AI Director in action</span>
            </div>
            <h3 className="text-2xl font-display font-bold mb-6">You type 4 words. We return a movie.</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <p className="text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Your input</p>
                <p className="text-lg font-semibold">"coffee cup on marble"</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)' }}>
                <p className="text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: 'var(--gold)' }}>AI Director output</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  "Vertical 9:16 frame, ceramic coffee cup on white Carrara marble surface, rich espresso steam rising slowly in soft morning light. Camera: macro lens, gentle dolly-in from 40cm to 15cm. Lighting: diffused natural daylight from left at 5600K, subtle rim light from rear. Colour grade: warm morning tones, teal shadow offset, 35mm film grain overlay. Shallow depth of field, bokeh background resolving to sun-drenched window. Steam particles catch light rays. Duration: 5 seconds at 24fps. Cinematic luxury commercial aesthetic."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-display font-black mb-3">Replace $130/month of tools for $29</h2>
            <p style={{ color: 'var(--text-secondary)' }}>No credit card required to start. Cancel anytime.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map(({ name, price, period, features, cta, variant, popular }) => (
              <div key={name} className={`relative p-6 rounded-2xl ${popular ? 'glow-gold' : ''}`}
                style={{ background: 'var(--bg-card)', border: popular ? '1px solid var(--gold)' : '1px solid var(--border)' }}>
                {popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-black"
                    style={{ background: 'linear-gradient(135deg, #E8C96A, #C9A84C)' }}>
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-xl font-bold mb-1">{name}</h3>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-4xl font-display font-black">${price}</span>
                  <span className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{period}</span>
                </div>
                <ul className="space-y-2.5 mb-8">
                  {features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <Check size={15} className="shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <button className={`w-full py-3 rounded-xl font-semibold text-sm ${variant === 'gold' ? 'btn-gold' : 'btn-outline'}`}>
                    {cta}
                  </button>
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center mt-6 text-sm" style={{ color: 'var(--text-muted)' }}>
            Enterprise plans from $500/mo — private deployment, SSO, SLA · <Link to="/pricing" className="underline" style={{ color: 'var(--gold)' }}>See all plans</Link>
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-display font-black mb-3">Creators are replacing 5 tools with 1</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, text, avatar, rating }) => (
              <div key={name} className="p-6 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} size={14} fill="var(--gold)" style={{ color: 'var(--gold)' }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-black"
                    style={{ background: 'linear-gradient(135deg, #E8C96A, #C9A84C)' }}>{avatar}</div>
                  <div>
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-5xl font-display font-black mb-4">
            The window is open.<br />
            <span className="text-gold-gradient">It won't stay open forever.</span>
          </h2>
          <p className="mb-8 text-lg" style={{ color: 'var(--text-secondary)' }}>
            Join 50,000+ creators who replaced their tool stack with VisioAI.
          </p>
          <Link to="/register">
            <button className="btn-gold flex items-center gap-2 py-4 px-10 rounded-xl text-lg font-bold mx-auto">
              <Zap size={20} />
              Start creating free — no credit card
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-display font-black text-black"
                style={{ background: 'linear-gradient(135deg, #E8C96A, #C9A84C)' }}>V</div>
              <span className="font-display font-bold">Visio<span style={{ color: 'var(--gold)' }}>AI</span></span>
            </div>
            <p className="text-sm max-w-xs" style={{ color: 'var(--text-muted)' }}>The operating system for video creators. $1M ARR target, Year 1.</p>
          </div>
          <div className="flex gap-12 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-white">Product</span>
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
              <Link to="/marketplace" className="hover:text-white transition-colors">Marketplace</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-white">Company</span>
              <a href="#" className="hover:text-white transition-colors">About</a>
              <a href="#" className="hover:text-white transition-colors">Blog</a>
              <a href="#" className="hover:text-white transition-colors">API Docs</a>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t flex justify-between text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          <span>© 2026 VisioAI. All rights reserved.</span>
          <span>Privacy · Terms · Cookie Policy</span>
        </div>
      </footer>
    </div>
  );
}
