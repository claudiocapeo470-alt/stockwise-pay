import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, AlertTriangle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';

export function TrialBanner() {
  const { status } = useSubscription();
  const { isEmployee } = useAuth();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('trial_banner_dismissed');
    if (wasDismissed) setDismissed(true);
  }, []);

  if (isEmployee || !status.isTrial || dismissed) return null;

  const { trialDaysLeft } = status;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('trial_banner_dismissed', 'true');
  };

  let bgClass = 'bg-primary/10 border-primary/20 text-primary';
  let Icon = Sparkles;
  let message = `🎉 Essai gratuit : ${trialDaysLeft} jours restants`;

  if (trialDaysLeft <= 0) {
    bgClass = 'bg-destructive/10 border-destructive/20 text-destructive';
    Icon = AlertCircle;
    message = '🚨 Dernier jour d\'essai !';
  } else if (trialDaysLeft <= 3) {
    bgClass = 'bg-warning/10 border-warning/20 text-warning';
    Icon = AlertTriangle;
    message = `⚠️ Votre essai se termine dans ${trialDaysLeft} jour${trialDaysLeft > 1 ? 's' : ''}`;
  }

  return (
    <div className={`flex items-center justify-between px-4 py-2 border-b ${bgClass} text-sm`}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span className="font-medium">{message}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          onClick={() => navigate('/tarifs')}
        >
          Voir les plans
        </Button>
        <button onClick={handleDismiss} className="p-1 hover:opacity-70 transition-opacity">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
