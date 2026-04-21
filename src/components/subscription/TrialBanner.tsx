import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TrialBanner() {
  const { isEmployee } = useAuth();
  const { status } = useSubscription();

  if (isEmployee || status.isActive || !status.subscriptionEnd) return null;

  const daysLeft = Math.ceil(
    (status.subscriptionEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (daysLeft > 7) return null;

  return (
    <div className="bg-warning/10 border-b border-warning/20 px-4 py-2 text-sm flex items-center gap-2">
      <AlertCircle className="h-4 w-4 text-warning" />
      <span>
        Votre abonnement expire dans <strong>{daysLeft} jour{daysLeft > 1 ? 's' : ''}</strong>.
      </span>
      <Link to="/app/subscription" className="ml-auto font-semibold text-primary underline">
        Renouveler
      </Link>
    </div>
  );
}
