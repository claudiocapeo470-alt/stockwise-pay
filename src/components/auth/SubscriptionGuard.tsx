import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface SubscriptionGuardProps {
  children: ReactNode;
}

/**
 * Gates app access on an active Paiement Pro subscription for owners.
 * Employees inherit access via the owner.
 *
 * Bypass routes: /app/subscription, /tarifs (must remain reachable when expired).
 */
export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const { isEmployee } = useAuth();
  const { status, isLoading } = useSubscription();
  const location = useLocation();

  // Allow employees through — they don't manage billing
  if (isEmployee) return <>{children}</>;

  // Allow the subscription page itself and pricing
  const path = location.pathname;
  if (path.startsWith('/app/subscription') || path.startsWith('/tarifs')) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!status.isActive) {
    return <Navigate to="/app/subscription" replace />;
  }

  return <>{children}</>;
}
