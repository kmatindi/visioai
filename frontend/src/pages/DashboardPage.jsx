import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { projectsAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Plus, Film, TrendingUp, Zap, Clock, Eye, Share2,
  MoreHorizontal, Play, Trash2, ExternalLink, Folder
} from 'lucide-react';

const STATUS_COLORS = {
  completed: { bg: 'rgba(34,197,94,0.1)', color: '#22C55E', border: 'rgba(34,197,94,0.3)' },
  processing: { bg: 'rgba(201,168,76,0.1)', color: 'var(--gold)', border: 'rgba(201,168,76,0.3)' },
  draft: { bg: 'rgba(96,96,104,0.15)', color: 'var(--text-muted)', border: 'rgba(96,96,104,0.3)' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);

  useEffect(() => {
    projectsAPI.list().then(r => setProjects(r.data.projects)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleNewProject = async () => {
    setCreating(true);
    try {
      const { data } = await projectsAPI.create({ title: 'Untitled Project', type: 'social' });
      navigate(`/studio/${data.id}`);
    } catch {
      navigate('/studio');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await projectsAPI.delete(id);
      setProjects(p => p.filter(x => x.id !== id));
      toast.success('Project deleted');
    } catch {
      toast.error('Could not delete project');
    }
    setMenuOpen(null);
  };

  const totalViews = projects.reduce((s, p) => s + (p.views || 0), 0);
  const totalGen = projects.reduce((s, p) => s + (p.generationsCount || 0), 0);
  const planDisplay = { free: 'Free', pro: 'Pro', studio: 'Studio', enterprise: 'Enterprise' }[user?.plan] || 'Free';

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {projects.length} project{projects.length !== 1 ? 's' : ''} · {planDisplay} plan
            </p>
          </div>
          <button onClick={handleNewProject} disabled={creating}
            className="btn-gold flex items-center gap-2 py-2.5 px-5 rounded-xl font-semibold text-sm">
            <Plus size={16} />
            {creating ? 'Creating…' : 'New Project'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Projects', value: projects.length, icon: Folder, color: 'var(--gold)' },
            { label: 'Total Generations', value: totalGen, icon: Zap, color: '#8B5CF6' },
            { label: 'Total Views', value: totalViews.toLocaleString(), icon: Eye, color: '#3B82F6' },
            { label: 'Credits Left', value: user?.generationsRemaining === 'unlimited' ? '∞' : user?.generationsRemaining ?? '—', icon: TrendingUp, color: '#22C55E' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="p-4 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
                  <Icon size={14} style={{ color }} />
                </div>
              </div>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'New social reel', icon: '📱', type: 'social', ratio: '9:16' },
            { label: 'Product video', icon: '🛍️', type: 'ecommerce', ratio: '9:16' },
            { label: 'Property tour', icon: '🏠', type: 'real-estate', ratio: '16:9' },
            { label: 'Course intro', icon: '🎓', type: 'education', ratio: '16:9' },
          ].map(q => (
            <button key={q.label} onClick={() => navigate('/studio')}
              className="p-3 rounded-xl text-left transition-all hover:-translate-y-0.5 gradient-border"
              style={{ background: 'var(--bg-card)' }}>
              <span className="text-2xl block mb-2">{q.icon}</span>
              <span className="text-sm font-semibold">{q.label}</span>
              <span className="block text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{q.ratio}</span>
            </button>
          ))}
        </div>

        {/* Projects */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Recent Projects</h2>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{projects.length} total</span>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="animate-shimmer h-40" />
                <div className="p-4 space-y-2">
                  <div className="h-4 rounded animate-shimmer w-3/4" />
                  <div className="h-3 rounded animate-shimmer w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px dashed var(--border)' }}>
            <Film size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
            <p className="font-semibold mb-1">No projects yet</p>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Create your first AI video in under a minute</p>
            <button onClick={handleNewProject} className="btn-gold py-2.5 px-6 rounded-xl font-semibold text-sm flex items-center gap-2 mx-auto">
              <Plus size={15} /> New Project
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {projects.map(project => {
              const sc = STATUS_COLORS[project.status] || STATUS_COLORS.draft;
              return (
                <div key={project.id} className="rounded-2xl overflow-hidden group transition-all hover:-translate-y-1"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  {/* Thumbnail */}
                  <div className="relative h-40 overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                    {project.thumbnail ? (
                      <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film size={28} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    )}
                    {/* Overlay */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2"
                      style={{ background: 'rgba(0,0,0,0.6)' }}>
                      <Link to={`/studio/${project.id}`}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                        style={{ background: 'var(--gold)' }}>
                        <Play size={14} fill="black" style={{ color: 'black' }} />
                      </Link>
                      <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                        style={{ background: 'rgba(255,255,255,0.15)' }}>
                        <ExternalLink size={13} />
                      </a>
                    </div>
                    {/* Status badge */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                      {project.status}
                    </div>
                    {/* Aspect ratio */}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs"
                      style={{ background: 'rgba(0,0,0,0.6)', color: 'var(--text-secondary)' }}>
                      {project.aspectRatio}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{project.title}</h3>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {new Date(project.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="relative">
                        <button onClick={() => setMenuOpen(menuOpen === project.id ? null : project.id)}
                          className="p-1 rounded-lg transition-all hover:bg-white/10 ml-2" style={{ color: 'var(--text-muted)' }}>
                          <MoreHorizontal size={16} />
                        </button>
                        {menuOpen === project.id && (
                          <div className="absolute right-0 top-8 w-36 rounded-xl overflow-hidden z-20"
                            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)' }}>
                            <Link to={`/studio/${project.id}`}
                              className="flex items-center gap-2 px-3 py-2 text-sm transition-all hover:bg-white/5"
                              style={{ color: 'var(--text-secondary)' }}>
                              <Play size={12} /> Open Studio
                            </Link>
                            <button onClick={() => handleDelete(project.id)}
                              className="flex items-center gap-2 px-3 py-2 text-sm w-full text-left transition-all hover:bg-white/5"
                              style={{ color: '#EF4444' }}>
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-1"><Eye size={11} /> {(project.views || 0).toLocaleString()}</span>
                      <span className="flex items-center gap-1"><Share2 size={11} /> {project.shares || 0}</span>
                      <span className="flex items-center gap-1"><Zap size={11} /> {project.generationsCount || 0} gen</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* New project card */}
            <button onClick={handleNewProject}
              className="rounded-2xl flex flex-col items-center justify-center gap-2 p-8 transition-all hover:-translate-y-1 upload-zone"
              style={{ minHeight: 200 }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(201,168,76,0.1)' }}>
                <Plus size={20} style={{ color: 'var(--gold)' }} />
              </div>
              <span className="text-sm font-semibold">New Project</span>
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
