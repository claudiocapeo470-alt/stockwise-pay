import { ReactNode } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface SubscriptionGuardProps {
  children: ReactNode;
}

/**
 * Bloque l'accès aux modules si l'essai gratuit est terminé ET aucun abonnement actif.
 * - Employés : héritent de l'accès du propriétaire (jamais bloqués ici).
 * - La page /app/subscription reste toujours accessible pour souscrire.
 */
export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const { isEmployee } = useAuth();
  const { status, isLoading } = useSubscription();
  const location = useLocation();

  // Toujours autoriser la page d'abonnement et le callback de paiement.
  const isSubscriptionRoute =
    location.pathname.startsWith('/app/subscription') ||
    location.pathname.startsWith('/app/subscription-callback');

  if (isEmployee || isSubscriptionRoute) return <>{children}</>;

  // Pas d'écran de chargement : on laisse l'app s'afficher pendant la vérification.
  if (isLoading) return <>{children}</>;


  // Trial actif OU abonnement payant actif → accès libre.
  if (status.isActive) return <>{children}</>;

  // Essai terminé sans abonnement → rediriger vers la page d'abonnement.
  return <Navigate to="/app/subscription" replace />;
}
