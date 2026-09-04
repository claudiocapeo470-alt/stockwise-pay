import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/ui/PageLoader';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, isEmployee } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!user || !isAdmin || isEmployee) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
