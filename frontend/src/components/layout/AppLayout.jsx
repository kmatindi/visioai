import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Film, BarChart3, ShoppingBag,
  LogOut, Settings, Zap, ChevronDown, Bell, Plus, Wand2
} from 'lucide-react';
import { useState } from 'react';

const NAV = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/studio', icon: Film, label: 'Studio' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/marketplace', icon: ShoppingBag, label: 'Marketplace' },
];

const PLAN_COLORS = {
  free: '#606068',
  pro: '#C9A84C',
  studio: '#8B5CF6',
  enterprise: '#3B82F6',
};

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const planColor = PLAN_COLORS[user?.plan] || '#606068';
  const generationsLeft = user?.planDetails?.generationsPerMonth === -1
    ? '∞'
    : (user?.generationsRemaining ?? 0);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside className="w-60 flex flex-col border-r shrink-0" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        {/* Logo */}
        <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-display font-black text-black"
              style={{ background: 'linear-gradient(135deg, #E8C96A, #C9A84C)' }}>V</div>
            <span className="text-xl font-display font-bold">
              Visio<span style={{ color: 'var(--gold)' }}>AI</span>
            </span>
          </Link>
        </div>

        {/* Create New button */}
        <div className="p-4">
          <button
            onClick={() => navigate('/studio')}
            className="w-full btn-gold flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold"
          >
            <Plus size={16} />
            New Project
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1">
          {NAV.map(({ path, icon: Icon, label }) => {
            const active = location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'text-black'
                    : 'hover:bg-white/5'
                }`}
                style={active ? { background: 'linear-gradient(135deg, #E8C96A, #C9A84C)', color: '#000' } : { color: 'var(--text-secondary)' }}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Credits usage */}
        <div className="p-4 mx-3 mb-3 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Generations</span>
            <span className="text-xs font-bold" style={{ color: 'var(--gold)' }}>{generationsLeft} left</span>
          </div>
          {user?.planDetails?.generationsPerMonth !== -1 && (
            <div className="progress-bar mb-2">
              <div
                className="progress-fill"
                style={{ width: `${Math.min(100, ((user?.planDetails?.generationsPerMonth - (user?.generationsRemaining || 0)) / user?.planDetails?.generationsPerMonth) * 100)}%` }}
              />
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="badge-pro" style={{ color: planColor, borderColor: planColor + '40', background: planColor + '18' }}>
              {(user?.plan || 'FREE').toUpperCase()}
            </span>
            <Link to="/pricing" className="text-xs font-semibold" style={{ color: 'var(--gold)' }}>Upgrade →</Link>
          </div>
        </div>

        {/* User menu */}
        <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all hover:bg-white/5"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-black shrink-0"
              style={{ background: 'linear-gradient(135deg, #E8C96A, #C9A84C)' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
          </button>
          {userMenuOpen && (
            <div className="mt-1 rounded-xl overflow-hidden" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)' }}>
              <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left transition-all hover:bg-white/5"
                style={{ color: 'var(--text-secondary)' }}>
                <Settings size={14} /> Settings
              </button>
              <button onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left transition-all hover:bg-white/5"
                style={{ color: '#EF4444' }}>
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b"
          style={{ background: 'rgba(10,10,11,0.8)', backdropFilter: 'blur(12px)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Wand2 size={16} style={{ color: 'var(--gold)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              {NAV.find(n => location.pathname.startsWith(n.path))?.label || 'VisioAI'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg transition-all hover:bg-white/5">
              <Bell size={18} style={{ color: 'var(--text-secondary)' }} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: 'var(--gold)' }} />
            </button>
            <Link to="/studio">
              <button className="btn-gold flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold">
                <Zap size={14} />
                Create
              </button>
            </Link>
          </div>
        </header>

        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
