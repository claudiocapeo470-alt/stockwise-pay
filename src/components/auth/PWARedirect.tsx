import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import HomePage from '@/pages/HomePage';

export function PWARedirect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const isPWA = window.matchMedia('(display-mode: standalone)').matches
    || (window.navigator as any).standalone === true;

  useEffect(() => {
    if (loading) return;
    if (isPWA) {
      if (user) {
        navigate('/app', { replace: true });
      } else {
        navigate('/auth', { replace: true });
      }
    }
  }, [isPWA, user, loading, navigate]);

  // In normal browser: show landing page
  if (!isPWA) return <HomePage />;

  // In PWA: show nothing during redirect
  return null;
}
