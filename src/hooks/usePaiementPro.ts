import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type PaiementProPlan = 'starter' | 'business' | 'pro';
export type BillingCycle = 'monthly' | 'yearly';

interface InitArgs {
  plan: PaiementProPlan;
  amount: number;
  billing_cycle?: BillingCycle;
}

export function usePaiementPro() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);

  const initPayment = async ({ plan, amount, billing_cycle = 'monthly' }: InitArgs) => {
    if (!user) {
      toast.error('Vous devez être connecté pour vous abonner');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('paiementpro-init', {
        body: {
          plan,
          amount,
          billing_cycle,
          email: user.email,
          firstName: profile?.first_name || 'Client',
          lastName: profile?.last_name || '',
          phone: '',
        },
      });

      if (error || !data?.payment_url) {
        console.error('paiementpro-init error:', error, data);
        toast.error('Impossible d\'initier le paiement', {
          description: (data as any)?.error || error?.message,
        });
        return;
      }

      // Redirect to Paiement Pro hosted page
      window.location.href = data.payment_url;
    } catch (err: any) {
      toast.error('Erreur réseau', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return { initPayment, loading };
}
