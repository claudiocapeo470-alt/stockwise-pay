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
  const [loadingPlan, setLoadingPlan] = useState<PaiementProPlan | null>(null);

  const initPayment = async ({ plan, amount, billing_cycle = 'monthly' }: InitArgs) => {
    if (!user) {
      toast.error('Vous devez être connecté pour vous abonner');
      return;
    }
    if (loadingPlan) return; // prevent concurrent clicks

    // Garde-fou : montant minimal
    if (!amount || amount < 100) {
      toast.error('Montant invalide', { description: 'Le montant doit être supérieur à 100 XOF.' });
      return;
    }

    setLoadingPlan(plan);
    try {
      // S'assurer d'avoir une session valide avant l'appel
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Session expirée', { description: 'Veuillez vous reconnecter.' });
        setLoadingPlan(null);
        return;
      }

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

      // Cas erreur HTTP renvoyée par l'edge function
      if (error) {
        // Tenter d'extraire le message d'erreur du contexte renvoyé
        let serverMessage: string | undefined;
        try {
          const ctx: any = (error as any).context;
          if (ctx && typeof ctx.json === 'function') {
            const body = await ctx.json();
            serverMessage = body?.error || body?.message;
          }
        } catch { /* ignore */ }

        console.error('paiementpro-init error:', { error, data, serverMessage });
        toast.error("Impossible d'initier le paiement", {
          description: serverMessage || (data as any)?.error || error.message || 'Erreur inconnue',
        });
        setLoadingPlan(null);
        return;
      }

      if (!data?.payment_url) {
        console.error('paiementpro-init no url:', data);
        toast.error("Impossible d'initier le paiement", {
          description: (data as any)?.error || 'Aucune URL de paiement reçue',
        });
        setLoadingPlan(null);
        return;
      }

      // Redirect to Paiement Pro hosted page
      window.location.href = data.payment_url;
    } catch (err: any) {
      console.error('paiementpro-init network error:', err);
      toast.error('Erreur réseau', { description: err.message });
      setLoadingPlan(null);
    }
  };

  return { initPayment, loadingPlan, loading: loadingPlan !== null };
}
