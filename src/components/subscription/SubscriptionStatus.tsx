import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, CreditCard, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function SubscriptionStatus() {
  const { subscription, user, session } = useAuth();

  if (!subscription) {
    return null;
  }

  const subscriptionEnd = subscription.subscription_end ? new Date(subscription.subscription_end) : null;
  const now = new Date();
  const daysUntilExpiry = subscriptionEnd ? Math.ceil((subscriptionEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  const handleRenewSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {
          email: user.email,
          firstName: user.user_metadata?.first_name || '',
          lastName: user.user_metadata?.last_name || '',
        }
      });

      if (error) throw error;

      // Redirect to Paystack payment page
      window.location.href = data.authorization_url;
    } catch (error) {
      console.error('Subscription renewal error:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Statut de l'abonnement</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={subscription.subscribed ? "default" : "destructive"}>
              {subscription.subscribed ? "Actif" : "Inactif"}
            </Badge>
            {subscription.is_legacy && (
              <Badge variant="secondary">
                Utilisateur existant
              </Badge>
            )}
          </div>
        </div>
        <CreditCard className="h-5 w-5 text-muted-foreground" />
      </div>

      {subscriptionEnd && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {subscription.subscribed ? 'Renouvelé le' : 'Expire le'}: {' '}
            {subscriptionEnd.toLocaleDateString('fr-FR')}
          </span>
        </div>
      )}

      {subscription.is_legacy && !subscription.subscribed && daysUntilExpiry > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Période de grâce : {daysUntilExpiry} jour{daysUntilExpiry > 1 ? 's' : ''} restant{daysUntilExpiry > 1 ? 's' : ''}
          </AlertDescription>
        </Alert>
      )}

      {(!subscription.subscribed || daysUntilExpiry <= 7) && (
        <Button 
          onClick={handleRenewSubscription}
          className="w-full"
          size="sm"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          {subscription.subscribed ? 'Renouveler' : 'S\'abonner'} - 9999 FCFA
        </Button>
      )}
    </div>
  );
}