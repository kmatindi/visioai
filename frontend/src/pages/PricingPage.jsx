import { Link, useNavigate } from 'react-router-dom';
import { Check, ArrowLeft, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useState } from 'react';

const PLANS = [
  {
    id: 'free', name: 'Free', price: 0, period: 'forever',
    features: [
      '5 generations/month',
      'AI Director Engine',
      '720p export',
      'Watermark on export',
      'Community support',
      '1 project',
    ],
    notIncluded: ['Commercial licence', 'Voice-over', 'API access', '4K export'],
    cta: 'Start free',
  },
  {
    id: 'pro', name: 'Pro', price: 29, period: '/month',
    popular: true,
    features: [
      '100 generations/month',
      'All AI models (Kling, Veo, Runway)',
      '1080p export',
      'Commercial licence',
      'AI Voice-over (50 languages)',
      'No watermark',
      'Email support',
      'Unlimited projects',
    ],
    notIncluded: ['Voice cloning', 'API access', '4K export'],
    cta: 'Start Pro — $29/mo',
  },
  {
    id: 'studio', name: 'Studio', price: 99, period: '/month',
    features: [
      'Unlimited generations',
      'All AI models + priority queue',
      '4K export',
      'Commercial licence',
      'AI Voice-over + Voice cloning',
      'Character consistency layer',
      '50-language auto-dubbing + lip sync',
      'API access',
      'Priority support',
    ],
    notIncluded: [],
    cta: 'Start Studio — $99/mo',
  },
  {
    id: 'enterprise', name: 'Enterprise', price: null, period: 'custom',
    features: [
      'Everything in Studio',
      'Private deployment (Vertex AI)',
      'SSO / SAML',
      'SLA guarantee',
      'Custom models',
      'White-label option',
      'Dedicated account manager',
      'Volume discounts',
      'HIPAA / GDPR compliance',
    ],
    notIncluded: [],
    cta: 'Contact sales',
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [upgrading, setUpgrading] = useState(null);

  const handleUpgrade = async (planId) => {
    if (!user) {
      navigate('/register');
      return;
    }
    if (planId === 'enterprise') {
      toast.success('Contact us at enterprise@visioai.com');
      return;
    }
    setUpgrading(planId);
    try {
      await userAPI.upgrade(planId);
      toast.success(`Upgraded to ${planId.charAt(0).toUpperCase() + planId.slice(1)}!`);
      navigate('/dashboard');
    } catch {
      toast.error('Upgrade failed');
    } finally {
      setUpgrading(null);
    }
  };

  return (
    <div className="min-h-screen py-16 px-6" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="max-w-6xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm mb-12 transition-colors hover:text-white" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={14} /> Back
        </Link>

        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-4"
            style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: 'var(--gold)' }}>
            <Zap size={13} />
            Replace $130/month of tools for $29
          </div>
          <h1 className="text-5xl font-display font-black mb-3">Simple, honest pricing</h1>
          <p style={{ color: 'var(--text-secondary)' }}>No hidden fees. Cancel anytime. Full features from day one.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-5">
          {PLANS.map(plan => (
            <div key={plan.id} className={`relative p-6 rounded-2xl flex flex-col ${plan.popular ? 'glow-gold' : ''}`}
              style={{ background: 'var(--bg-card)', border: plan.popular ? '1px solid var(--gold)' : '1px solid var(--border)' }}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold text-black"
                  style={{ background: 'var(--gold)' }}>
                  MOST POPULAR
                </div>
              )}
              <div className="mb-5">
                <h2 className="text-lg font-bold mb-1">{plan.name}</h2>
                <div className="flex items-end gap-1">
                  {plan.price !== null ? (
                    <>
                      <span className="text-4xl font-display font-black">${plan.price}</span>
                      <span className="text-sm pb-1" style={{ color: 'var(--text-muted)' }}>{plan.period}</span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold">Custom</span>
                  )}
                </div>
                {plan.id === 'pro' && (
                  <p className="text-xs mt-1" style={{ color: '#22C55E' }}>Replaces $130/mo of tools</p>
                )}
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <Check size={13} className="shrink-0 mt-0.5" style={{ color: plan.popular ? 'var(--gold)' : '#22C55E' }} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={upgrading === plan.id || (user?.plan === plan.id)}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                  plan.popular ? 'btn-gold' : 'btn-outline'
                } disabled:opacity-50`}>
                {upgrading === plan.id ? 'Upgrading…'
                  : user?.plan === plan.id ? 'Current plan'
                  : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Credit packs */}
        <div className="mt-12 p-8 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h3 className="text-xl font-bold mb-2">Need more generations?</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Buy credit packs anytime — no subscription required.</p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: '20 generations', price: '$10', highlight: false },
              { label: '60 generations', price: '$25', highlight: true },
              { label: '150 generations', price: '$50', highlight: false },
            ].map(({ label, price, highlight }) => (
              <div key={label} className="p-4 rounded-xl flex items-center justify-between"
                style={{ background: 'var(--bg-elevated)', border: `1px solid ${highlight ? 'var(--gold)' : 'var(--border)'}` }}>
                <div>
                  <p className="font-semibold">{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>One-time purchase</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold" style={{ color: highlight ? 'var(--gold)' : 'var(--text-primary)' }}>{price}</p>
                  <button className="text-xs font-semibold mt-1" style={{ color: 'var(--gold)' }}>Buy →</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-sm mt-8" style={{ color: 'var(--text-muted)' }}>
          Questions? Email us at <a href="mailto:hello@visioai.com" className="underline" style={{ color: 'var(--gold)' }}>hello@visioai.com</a>
        </p>
      </div>
    </div>
  );
}
