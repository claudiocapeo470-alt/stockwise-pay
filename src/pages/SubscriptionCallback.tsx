import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

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
      // Try to get from subscriber record
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

      if (error || !data) {
        setStatus('failed');
        return;
      }

      if (data.status === 'success') {
        setStatus('success');
        if (data.plan) setPlan(data.plan);
        // Auto-redirect after 3 seconds
        setTimeout(() => navigate('/app'), 3000);
      } else if (data.status === 'pending') {
        // Retry after 3 seconds
        setTimeout(() => verifyPayment(id), 3000);
      } else {
        setStatus('failed');
      }
    } catch {
      setStatus('failed');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          {status === 'loading' && (
            <>
              <Loader2 className="h-16 w-16 text-primary mx-auto animate-spin" />
              <div>
                <h2 className="text-xl font-bold">Vérification du paiement en cours...</h2>
                <p className="text-muted-foreground text-sm mt-2">Veuillez patienter quelques instants</p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-12 w-12 text-success" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Félicitations ! 🎉</h2>
                <p className="text-muted-foreground mt-2">
                  Votre abonnement <span className="font-semibold text-foreground uppercase">{plan}</span> est activé.
                </p>
                <p className="text-xs text-muted-foreground mt-1">Redirection automatique dans 3 secondes...</p>
              </div>
              <Button onClick={() => navigate('/app')} className="w-full">
                Aller au dashboard
              </Button>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <XCircle className="h-12 w-12 text-destructive" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Paiement non abouti</h2>
                <p className="text-muted-foreground mt-2">Aucun montant n'a été débité de votre compte.</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={() => navigate('/tarifs')} className="w-full">Réessayer</Button>
                <Button variant="outline" onClick={() => navigate('/app')}>Contacter le support</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
