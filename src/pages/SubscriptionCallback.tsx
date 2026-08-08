import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionSuccessView } from '@/components/subscription/SubscriptionSuccessView';

export default function SubscriptionCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [plan, setPlan] = useState('');

  const paymentId = searchParams.get('paymentId');
  const planParam = searchParams.get('plan') || '';

  useEffect(() => {
    setPlan(planParam);

    if (!paymentId) {
      const checkSubscriber = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setStatus('failed'); return; }

        const { data } = await supabase
          .from('subscribers')
          .select('moneroo_payment_id, plan_name')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data?.moneroo_payment_id) {
          verifyPayment(data.moneroo_payment_id);
          if (data.plan_name) setPlan(data.plan_name);
        } else {
          setStatus('failed');
        }
      };
      checkSubscriber();
      return;
    }

    verifyPayment(paymentId);
  }, [paymentId, planParam]);

  const verifyPayment = async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('moneroo-verify-payment', {
        body: { payment_id: id }
      });

      if (error || !data) { setStatus('failed'); return; }

      if (data.status === 'success') {
        setStatus('success');
        if (data.plan) setPlan(data.plan);
      } else if (data.status === 'pending') {
        setTimeout(() => verifyPayment(id), 2000);
      } else {
        setStatus('failed');
      }
    } catch {
      setStatus('failed');
    }
  };

  return (
    <div className="h-[100dvh] overflow-hidden bg-background flex flex-col px-5 py-6">
      <div className="mx-auto w-full max-w-md flex-1 min-h-0">
        {status === 'loading' && (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Confirmation du paiement…</p>
          </div>
        )}

        {status === 'success' && (
          <SubscriptionSuccessView
            planLabel={plan?.toUpperCase()}
            description={`Félicitations, votre abonnement ${plan ? plan.toUpperCase() : 'Premium'} est activé. Profitez de toutes les fonctionnalités de Stocknix !`}
            onDone={() => navigate('/app')}
            onClose={() => navigate('/app')}
          />
        )}

        {status === 'failed' && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-5">
            <div className="h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-2xl font-extrabold">Paiement non abouti</h2>
              <p className="text-sm text-muted-foreground">Aucun montant n'a été débité de votre compte.</p>
            </div>
            <div className="w-full max-w-xs space-y-2">
              <Button onClick={() => navigate('/tarifs')} className="w-full h-12 rounded-full">Réessayer</Button>
              <Button variant="ghost" onClick={() => navigate('/app')} className="w-full h-12 rounded-full">Retour à l'accueil</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
