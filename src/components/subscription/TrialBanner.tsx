import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TrialBanner() {
  const { isEmployee } = useAuth();
  const { status } = useSubscription();

  if (isEmployee || !status.subscriptionEnd) return null;

  // Expired → critical banner
  if (status.isExpired) {
    return (
      <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 text-sm flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <span>Votre essai gratuit est terminé. Choisissez un plan pour continuer.</span>
        <Link to="/app/subscription" className="ml-auto font-semibold text-primary underline">
          S'abonner
        </Link>
      </div>
    );
  }

  // Active paid plan → no banner
  if (!status.isTrial) return null;

  const daysLeft = status.trialDaysLeft;

  // Show trial banner during the whole trial; emphasize last 7 days
  const isUrgent = daysLeft <= 7;
  return (
    <div className={`${isUrgent ? 'bg-warning/10 border-warning/20' : 'bg-primary/10 border-primary/20'} border-b px-4 py-2 text-sm flex items-center gap-2`}>
      <AlertCircle className={`h-4 w-4 ${isUrgent ? 'text-warning' : 'text-primary'}`} />
      <span>
        🎁 Essai gratuit — il vous reste <strong>{daysLeft} jour{daysLeft > 1 ? 's' : ''}</strong>.
      </span>
      <Link to="/app/subscription" className="ml-auto font-semibold text-primary underline">
        Voir les plans
      </Link>
    </div>
  );
}
