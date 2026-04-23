import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * Petite icône d'alerte d'abonnement à placer dans le header (à côté de la cloche).
 * - Affiche un point rouge pulsant si l'essai expire dans ≤ 7 jours ou est terminé.
 * - Affiche un point neutre pendant l'essai (> 7 jours).
 * - Masquée pour un plan payant actif et pour les employés.
 */
export function SubscriptionAlert() {
  const { isEmployee } = useAuth();
  const { status } = useSubscription();

  if (isEmployee) return null;

  // Plan payant actif → pas besoin d'alerte
  if (status.isActive && !status.isTrial) return null;

  // Pas encore d'info → on n'affiche rien
  if (!status.subscriptionEnd && !status.isExpired) return null;

  const isExpired = status.isExpired;
  const daysLeft = status.trialDaysLeft;
  const isUrgent = isExpired || daysLeft <= 7;

  const label = isExpired
    ? 'Votre essai est terminé — réabonnez-vous'
    : `Essai gratuit — ${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to="/app/subscription"
            aria-label={label}
            className={`relative inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${
              isUrgent ? 'text-destructive hover:text-destructive' : ''
            }`}
          >
            <Crown className="h-5 w-5" />
            <span
              className={`absolute top-2 right-2 h-2 w-2 rounded-full ${
                isUrgent ? 'bg-destructive animate-pulse' : 'bg-primary'
              }`}
            />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="bottom">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
