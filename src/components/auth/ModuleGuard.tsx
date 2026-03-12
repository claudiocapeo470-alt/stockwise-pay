import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useCompanyModules } from '@/hooks/useCompanyModules';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ModuleGuardProps {
  children: ReactNode;
}

export function ModuleGuard({ children }: ModuleGuardProps) {
  const { loading: authLoading, isEmployee } = useAuth();
  const { onboardingCompleted, loading: companyLoading } = useCompanyModules();

  if (isEmployee) return <>{children}</>;

  if (authLoading || companyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
