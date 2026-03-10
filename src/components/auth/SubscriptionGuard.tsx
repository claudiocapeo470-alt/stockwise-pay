import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';

interface SubscriptionGuardProps {
  children: ReactNode;
}

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const { isEmployee, user } = useAuth();
  const { status, isLoading } = useSubscription();

  // Employees (PIN login) are never blocked
  if (isEmployee) return <>{children}</>;

  // Still loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4 animate-spin rounded-full"></div>
          <p className="text-muted-foreground text-sm">Vérification de l'abonnement...</p>
        </div>
      </div>
    );
  }

  // No user = let ProtectedRoute handle redirect
  if (!user) return <>{children}</>;

  // Expired subscription → redirect to pricing
  if (status.isExpired && !status.isActive) {
    return <Navigate to="/tarifs?expired=true" replace />;
  }

  return <>{children}</>;
}
