import { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { analyticsAPI } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Eye, Share2, Zap, Sparkles, ArrowUp, ArrowDown } from 'lucide-react';

const PRIORITY_COLORS = { high: '#EF4444', medium: '#F59E0B', low: '#22C55E' };

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.overview().then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="h-8 w-48 rounded animate-shimmer" style={{ background: 'var(--bg-card)' }} />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-2xl animate-shimmer" style={{ background: 'var(--bg-card)' }} />)}
        </div>
        <div className="h-64 rounded-2xl animate-shimmer" style={{ background: 'var(--bg-card)' }} />
      </div>
    </AppLayout>
  );

  if (!data) return null;

  const { summary, dailyTrend, topContent, styleCorrelation, recommendations } = data;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Creator Analytics</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Understand what works. Correlate video style with engagement.
          </p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Views', value: summary.totalViews.toLocaleString(), icon: Eye, color: '#3B82F6', delta: '+23%' },
            { label: 'Total Shares', value: summary.totalShares.toLocaleString(), icon: Share2, color: '#8B5CF6', delta: '+11%' },
            { label: 'Generations', value: summary.totalGenerations, icon: Zap, color: 'var(--gold)', delta: '+67%' },
            { label: 'Avg Views/Video', value: summary.avgViewsPerVideo.toLocaleString(), icon: TrendingUp, color: '#22C55E', delta: '+8%' },
          ].map(({ label, value, icon: Icon, color, delta }) => (
            <div key={label} className="p-4 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
                  <Icon size={13} style={{ color }} />
                </div>
              </div>
              <p className="text-2xl font-bold mb-1">{value}</p>
              <span className="text-xs font-semibold flex items-center gap-1" style={{ color: '#22C55E' }}>
                <ArrowUp size={10} /> {delta} vs last month
              </span>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Daily trend */}
          <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h3 className="font-bold mb-4">Daily Activity (30 days)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={dailyTrend}>
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }}
                  labelFormatter={v => v}
                />
                <Area type="monotone" dataKey="views" stroke="#C9A84C" strokeWidth={2} fill="url(#goldGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Style correlation */}
          <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h3 className="font-bold mb-1">Style → Engagement Correlation</h3>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Avg engagement rate (%) by video style</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={styleCorrelation} layout="vertical" barSize={16}>
                <XAxis type="number" hide domain={[0, 15]} />
                <YAxis type="category" dataKey="style" width={80} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }}
                />
                <Bar dataKey="avgEngagement" fill="#C9A84C" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="p-5 rounded-2xl mb-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} style={{ color: 'var(--gold)' }} />
            <h3 className="font-bold">AI Recommendations</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {recommendations.map((rec, i) => (
              <div key={i} className="p-4 rounded-xl"
                style={{ background: 'var(--bg-elevated)', border: `1px solid ${PRIORITY_COLORS[rec.priority]}40` }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: PRIORITY_COLORS[rec.priority] }} />
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: PRIORITY_COLORS[rec.priority] }}>
                    {rec.priority} priority
                  </span>
                </div>
                <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{rec.message}</p>
                <button className="text-xs font-semibold" style={{ color: 'var(--gold)' }}>
                  {rec.action} →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Top content */}
        <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h3 className="font-bold mb-4">Top Performing Content</h3>
          <div className="space-y-3">
            {topContent.map((item, i) => (
              <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl transition-all hover:bg-white/5">
                <span className="text-2xl font-display font-black w-6 text-center text-gold-gradient">
                  {i + 1}
                </span>
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0" style={{ background: 'var(--bg-elevated)' }}>
                  {item.thumbnail
                    ? <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: 'var(--text-muted)' }}>No img</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{item.title}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.type} · {item.aspectRatio}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                    <Eye size={12} /> {(item.views || 0).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                    <Share2 size={12} /> {item.shares || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
