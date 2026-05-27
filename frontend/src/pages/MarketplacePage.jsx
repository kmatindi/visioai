import { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { marketplaceAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Search, Star, Download, Filter, Sparkles } from 'lucide-react';

const CATEGORIES = ['all', 'cinematic', 'social', 'e-commerce', 'real-estate', 'education', 'news'];

export default function MarketplacePage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('trending');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    marketplaceAPI.templates({ category: category === 'all' ? undefined : category, sort, limit: 24 })
      .then(r => setTemplates(r.data.templates))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, sort]);

  const handlePurchase = async (id) => {
    try {
      await marketplaceAPI.purchase(id);
      toast.success('Template added to your library!');
    } catch {
      toast.error('Could not add template');
    }
  };

  const filtered = search
    ? templates.filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
    : templates;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Marketplace</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Video style templates, voice packs, and motion presets from the community.
          </p>
        </div>

        {/* Search + sort */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search templates…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
          <div className="flex gap-2">
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="py-2.5 px-4 rounded-xl text-sm outline-none"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              <option value="trending">Trending</option>
              <option value="new">Newest</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all"
              style={category === c
                ? { background: 'var(--gold)', color: '#000' }
                : { background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>

        {/* Featured */}
        {category === 'all' && !search && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={15} style={{ color: 'var(--gold)' }} />
              <h2 className="font-bold">Featured</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {templates.filter(t => t.featured).slice(0, 3).map(t => (
                <TemplateCard key={t.id} template={t} featured onPurchase={handlePurchase} />
              ))}
            </div>
          </div>
        )}

        {/* Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">All Templates</h2>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{filtered.length} results</span>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <div className="animate-shimmer h-32" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 rounded animate-shimmer w-3/4" />
                    <div className="h-3 rounded animate-shimmer w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-4 gap-4">
              {filtered.map(t => <TemplateCard key={t.id} template={t} onPurchase={handlePurchase} />)}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function TemplateCard({ template: t, featured, onPurchase }) {
  return (
    <div className={`rounded-2xl overflow-hidden transition-all hover:-translate-y-1 ${featured ? 'glow-gold' : ''}`}
      style={{ background: 'var(--bg-card)', border: featured ? '1px solid rgba(201,168,76,0.4)' : '1px solid var(--border)' }}>
      <div className="relative h-32 overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
        <img src={t.preview} alt={t.title} className="w-full h-full object-cover" />
        {t.price === 0 && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ background: 'rgba(34,197,94,0.9)', color: '#fff' }}>FREE</div>
        )}
        {featured && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold text-black"
            style={{ background: 'var(--gold)' }}>Featured</div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm truncate">{t.title}</h3>
        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>by {t.authorName}</p>
        <div className="flex items-center gap-2 mb-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1"><Star size={10} fill="var(--gold)" style={{ color: 'var(--gold)' }} /> {t.rating}</span>
          <span className="flex items-center gap-1"><Download size={10} /> {t.downloads.toLocaleString()}</span>
        </div>
        <button onClick={() => onPurchase(t.id)}
          className={`w-full py-2 rounded-xl text-xs font-semibold transition-all ${t.price === 0 ? 'btn-outline' : 'btn-gold'}`}>
          {t.price === 0 ? 'Add free' : `$${t.price}`}
        </button>
      </div>
    </div>
  );
}
