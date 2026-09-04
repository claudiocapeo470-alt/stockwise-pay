import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from './useCompany';
import { useSubscription } from './useSubscription';
import { notifyUser } from '@/lib/notifyUser';

/** Évite d'envoyer deux fois la même alerte (par jour). */
function alreadyNotified(key: string): boolean {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const stored = localStorage.getItem(`alert:${key}`);
    if (stored === today) return true;
    localStorage.setItem(`alert:${key}`, today);
    return false;
  } catch {
    return false;
  }
}

/**
 * Alertes métier périodiques + temps réel :
 * - factures échues, paiements en retard
 * - abonnement bientôt expiré (J-3) ou échec de paiement
 * - nouvel avis client sur la boutique en ligne
 */
export function useBusinessAlerts() {
  const { user, isEmployee, memberInfo } = useAuth();
  const { company } = useCompany();
  const { status } = useSubscription();

  const ownerId = isEmployee ? (memberInfo?.owner_id || company?.owner_id) : user?.id;

  // --- Échéances : factures échues + paiements en retard ---
  useEffect(() => {
    if (!ownerId || isEmployee) return;

    const check = async () => {
      const nowIso = new Date().toISOString();

      const { data: overdueInvoices } = await supabase
        .from('invoices')
        .select('id, document_number, document_type, client_name, total_amount, due_date, status')
        .eq('user_id', ownerId)
        .lt('due_date', nowIso)
        .in('status', ['envoye', 'brouillon']);

      (overdueInvoices || []).forEach((inv: any) => {
        if (alreadyNotified(`invoice-overdue-${inv.id}`)) return;
        const label = `${inv.document_type === 'devis' ? 'Devis' : 'Facture'} ${inv.document_number}`;
        const body = `${label} — ${inv.client_name || 'client'} — ${Number(inv.total_amount || 0).toLocaleString('fr-FR')} FCFA`;
        notifyUser({
          companyId: company?.id,
          userId: ownerId,
          type: 'warning',
          title: 'Facture échue',
          message: body,
          url: inv.document_type === 'devis' ? '/app/devis' : '/app/factures',
          tag: `invoice-overdue-${inv.id}`,
          requireInteraction: true,
        });
      });

      const { data: latePayments } = await supabase
        .from('payments')
        .select('id, customer_name, customer_first_name, customer_last_name, remaining_amount, due_date, status')
        .eq('user_id', ownerId)
        .lt('due_date', nowIso)
        .in('status', ['pending', 'partial', 'overdue']);

      (latePayments || []).forEach((pay: any) => {
        if (alreadyNotified(`payment-overdue-${pay.id}`)) return;
        const client =
          pay.customer_name ||
          [pay.customer_first_name, pay.customer_last_name].filter(Boolean).join(' ') ||
          'Client';
        const body = `${client} — reste ${Number(pay.remaining_amount || 0).toLocaleString('fr-FR')} FCFA`;
        notifyUser({
          companyId: company?.id,
          userId: ownerId,
          type: 'warning',
          title: 'Paiement en retard',
          message: body,
          url: '/app/paiements',
          tag: `payment-overdue-${pay.id}`,
          requireInteraction: true,
        });
      });
    };

    void check();
    const interval = setInterval(check, 1000 * 60 * 60);
    return () => clearInterval(interval);
    }, [ownerId, isEmployee, company?.id]);

  // --- Abonnement : expiration proche + échec de paiement ---
  useEffect(() => {
    if (!ownerId || isEmployee) return;

    const daysLeft = status.trialDaysLeft;
    if (status.subscriptionEnd && daysLeft > 0 && daysLeft <= 3) {
      if (!alreadyNotified(`subscription-expiring-${ownerId}`)) {
        const body = `Votre abonnement expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}.`;
        notifyUser({
          companyId: company?.id,
          userId: ownerId,
          type: 'warning',
          title: 'Abonnement bientôt expiré',
          message: body,
          url: '/app/subscription',
          tag: 'subscription-expiring',
        });
      }
    }

    const checkFailure = async () => {
      const since = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();
      const { data } = await supabase
        .from('payment_history')
        .select('id, plan_name, status, created_at')
        .eq('user_id', ownerId)
        .eq('status', 'failed')
        .gte('created_at', since);

      (data || []).forEach((p: any) => {
        if (alreadyNotified(`subscription-failed-${p.id}`)) return;
        const body = `Le paiement de votre abonnement ${p.plan_name || ''} a échoué.`;
        notifyUser({
          companyId: company?.id,
          userId: ownerId,
          type: 'error',
          title: 'Échec de paiement abonnement',
          message: body,
          url: '/app/subscription',
          tag: `subscription-failed-${p.id}`,
          requireInteraction: true,
        });
      });
    };

    void checkFailure();
  }, [ownerId, isEmployee, status.trialDaysLeft, status.subscriptionEnd, company?.id]);

  // --- Nouvel avis client sur la boutique ---
  useEffect(() => {
    if (!ownerId || isEmployee) return;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    (async () => {
      const { data: store } = await supabase
        .from('online_store')
        .select('id')
        .eq('user_id', ownerId)
        .maybeSingle();
      if (!store?.id || cancelled) return;

      channel = supabase
        .channel(`reviews-${store.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'store_reviews', filter: `store_id=eq.${store.id}` },
          (payload) => {
            const review = payload.new as any;
            const body = `${review.customer_name || 'Un client'} a laissé ${review.rating || 0}/5`;
            notifyUser({
              companyId: company?.id,
              userId: ownerId,
              type: 'success',
              title: 'Nouvel avis client',
              message: body,
              url: '/app/boutique/avis',
              tag: `review-${review.id}`,
            });
          },
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [ownerId, isEmployee, company?.id]);
}
