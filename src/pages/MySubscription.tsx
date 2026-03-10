import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Crown, CreditCard, Calendar, Loader2 } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const PLANS = [
  { id: 'starter', name: 'Starter', price: 9900, color: 'bg-emerald-500' },
  { id: 'business', name: 'Business', price: 24900, color: 'bg-primary' },
  { id: 'pro', name: 'Pro', price: 49900, color: 'bg-purple-600' },
];

export default function MySubscription() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { status, isLoading: subLoading } = useSubscription();
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [payLoading, setPayLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('payment_history')
      .select('*')
      .eq('user_id', user.id)
      .order('paid_at', { ascending: false })
      .then(({ data }) => {
        setHistory(data || []);
        setHistoryLoading(false);
      });
  }, [user]);

  const handleChoosePlan = async (planId: string, billing: 'monthly' | 'annual' = 'monthly') => {
    if (!user) return;
    setPayLoading(planId);
    try {
      const { data, error } = await supabase.functions.invoke('moneroo-init-payment', {
        body: { plan: planId, billing, user_id: user.id }
      });

      if (error || !data?.checkout_url) {
        toast.error('Erreur lors de l\'initialisation du paiement');
        return;
      }

      window.location.href = data.checkout_url;
    } catch {
      toast.error('Erreur de connexion');
    } finally {
      setPayLoading(null);
    }
  };

  const getPlanBadge = (planName: string | null) => {
    switch (planName) {
      case 'trial': return <Badge variant="secondary">Essai gratuit</Badge>;
      case 'starter': return <Badge className="bg-emerald-500">Starter</Badge>;
      case 'business': return <Badge className="bg-primary">Business</Badge>;
      case 'pro': return <Badge className="bg-purple-600">Pro</Badge>;
      default: return <Badge variant="outline">Aucun</Badge>;
    }
  };

  if (subLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="ghost" onClick={() => navigate('/app/settings')} className="gap-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Retour aux paramètres
      </Button>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Crown className="h-5 w-5" /> Mon plan actuel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {getPlanBadge(status.planName)}
            {status.isTrial && (
              <span className="text-sm text-muted-foreground">
                {status.trialDaysLeft > 0 ? `${status.trialDaysLeft} jours restants` : 'Expiré'}
              </span>
            )}
            {!status.isTrial && status.isActive && status.subscriptionEnd && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Actif jusqu'au {status.subscriptionEnd.toLocaleDateString('fr-FR')}
              </span>
            )}
            {status.isExpired && <Badge variant="destructive">Expiré</Badge>}
          </div>
          {status.subscription?.plan_price > 0 && (
            <p className="text-2xl font-bold">{status.subscription.plan_price.toLocaleString()} <span className="text-base text-muted-foreground">XOF / mois</span></p>
          )}
        </CardContent>
      </Card>

      {/* Change Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> Changer de plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PLANS.map((plan) => {
              const isCurrent = status.planName === plan.id;
              return (
                <Card key={plan.id} className={`p-4 ${isCurrent ? 'border-primary border-2' : ''}`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{plan.name}</h3>
                      {isCurrent && <Badge variant="outline" className="text-xs">Actuel</Badge>}
                    </div>
                    <p className="text-2xl font-bold">{plan.price.toLocaleString()} <span className="text-sm text-muted-foreground font-normal">XOF/mois</span></p>
                    <Button
                      className="w-full"
                      variant={isCurrent ? 'outline' : 'default'}
                      disabled={isCurrent || !!payLoading}
                      onClick={() => handleChoosePlan(plan.id)}
                    >
                      {payLoading === plan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : isCurrent ? 'Plan actuel' : 'Passer à ce plan'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des paiements</CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
          ) : history.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Aucun paiement enregistré</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell>{new Date(h.paid_at).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell className="capitalize">{h.plan_name}</TableCell>
                    <TableCell>{h.amount?.toLocaleString()} {h.currency}</TableCell>
                    <TableCell>
                      <Badge variant={h.status === 'success' ? 'default' : 'destructive'}>
                        {h.status === 'success' ? 'Payé' : 'Échoué'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
