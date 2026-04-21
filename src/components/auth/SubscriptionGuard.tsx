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
  // Free Pro access for everyone — Moneroo & trial disabled.
  // The /app/subscription page remains visible so users can still subscribe via Paiement Pro.
  return <>{children}</>;
}
