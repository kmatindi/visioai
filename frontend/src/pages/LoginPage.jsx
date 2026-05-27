import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Zap, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    try {
      await demoLogin();
      navigate('/dashboard');
      toast.success('Welcome to the VisioAI demo!');
    } catch {
      toast.error('Demo login failed — is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm mb-8 transition-colors hover:text-white" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={14} /> Back to home
        </Link>

        <div className="p-8 rounded-3xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-display font-black text-black"
              style={{ background: 'linear-gradient(135deg, #E8C96A, #C9A84C)' }}>V</div>
            <span className="text-2xl font-display font-bold">Visio<span style={{ color: 'var(--gold)' }}>AI</span></span>
          </div>

          <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-10 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-gold w-full py-3 rounded-xl font-semibold text-sm disabled:opacity-50">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          <button onClick={handleDemo} disabled={loading}
            className="btn-outline w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            <Zap size={15} style={{ color: 'var(--gold)' }} />
            Try instant demo (no account needed)
          </button>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
            Don't have an account? <Link to="/register" className="font-semibold" style={{ color: 'var(--gold)' }}>Start free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
