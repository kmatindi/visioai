import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import StudioPage from './pages/StudioPage';
import AnalyticsPage from './pages/AnalyticsPage';
import MarketplacePage from './pages/MarketplacePage';
import PricingPage from './pages/PricingPage';
import NotFoundPage from './pages/NotFoundPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-display font-black"
          style={{ background: 'linear-gradient(135deg, #E8C96A, #C9A84C)' }}>
          V
        </div>
        <div className="w-40 h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <div className="h-full rounded-full animate-pulse" style={{ background: 'linear-gradient(90deg, #A07830, #C9A84C)', width: '60%' }} />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: '10px',
            },
            success: {
              iconTheme: { primary: '#C9A84C', secondary: '#000' },
            },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/pricing" element={<PricingPage />} />

          {/* Protected */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/studio" element={<ProtectedRoute><StudioPage /></ProtectedRoute>} />
          <Route path="/studio/:projectId" element={<ProtectedRoute><StudioPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/marketplace" element={<ProtectedRoute><MarketplacePage /></ProtectedRoute>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
