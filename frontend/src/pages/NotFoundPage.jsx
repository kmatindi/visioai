import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4"
      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div>
        <div className="text-8xl font-display font-black mb-4 text-gold-gradient">404</div>
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn-gold inline-flex items-center gap-2 py-3 px-6 rounded-xl font-semibold">
          <ArrowLeft size={16} /> Back to home
        </Link>
      </div>
    </div>
  );
}
