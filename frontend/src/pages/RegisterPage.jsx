import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { ArrowLeft, Eye, EyeOff, Check } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = form.password.length >= 8 ? (form.password.match(/[A-Z]/) ? 'strong' : 'medium') : form.password.length > 0 ? 'weak' : '';
  const strengthColor = { strong: '#22C55E', medium: '#F59E0B', weak: '#EF4444' }[strength] || 'transparent';
  const strengthW = { strong: '100%', medium: '60%', weak: '30%' }[strength] || '0%';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
      toast.success('Account created! Welcome to VisioAI 🎬');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)',
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm mb-8 transition-colors hover:text-white" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={14} /> Back to home
        </Link>

        <div className="p-8 rounded-3xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-display font-black text-black"
              style={{ background: 'linear-gradient(135deg, #E8C96A, #C9A84C)' }}>V</div>
            <span className="text-2xl font-display font-bold">Visio<span style={{ color: 'var(--gold)' }}>AI</span></span>
          </div>

          <h1 className="text-2xl font-bold mb-1">Create your account</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>5 free generations/month · No credit card</p>

          {/* Free perks */}
          <div className="p-3 rounded-xl mb-6 space-y-1.5" style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
            {['AI Director Engine (free forever)', '5 video generations/month', 'All export formats'].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <Check size={13} style={{ color: 'var(--gold)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>{f}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name', label: 'Full name', type: 'text', placeholder: 'Your name' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder} required className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Min. 8 characters" required minLength={8}
                  className="w-full px-4 py-3 pr-10 rounded-xl text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-1.5">
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: strengthW, background: strengthColor }} />
                  </div>
                  <p className="text-xs mt-1" style={{ color: strengthColor }}>{strength} password</p>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="btn-gold w-full py-3 rounded-xl font-semibold text-sm disabled:opacity-50">
              {loading ? 'Creating account…' : 'Create free account'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
            Already have an account? <Link to="/login" className="font-semibold" style={{ color: 'var(--gold)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
