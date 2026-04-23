import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/hooks/useCompany';

export type ActivityAction =
  | 'sale.created'
  | 'sale.refunded'
  | 'product.created'
  | 'product.updated'
  | 'product.deleted'
  | 'order.created'
  | 'order.status_changed'
  | 'login.success'
  | 'login.failed'
  | 'logout'
  | 'lock.locked'
  | 'lock.unlocked'
  | 'cash_session.opened'
  | 'cash_session.closed'
  | 'invoice.created'
  | 'invoice.paid'
  | 'team.member_added'
  | 'team.member_removed'
  | 'subscription.payment_initiated'
  | 'subscription.activated'
  | 'store.published'
  | 'store.unpublished';

interface LogParams {
  action: ActivityAction;
  entity_type?: string;
  entity_id?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Hook de tracking SaaS — enregistre toutes les actions importantes dans activity_logs.
 * Utilisation : const { log } = useActivityLog(); log({ action: 'sale.created', metadata: { total: 1500 } });
 */
export function useActivityLog() {
  const { user, isEmployee, memberInfo } = useAuth();
  const { company } = useCompany();

  const log = useCallback(
    async ({ action, entity_type, entity_id, metadata = {} }: LogParams) => {
      if (!user) return;
      try {
        await supabase.from('activity_logs').insert({
          company_id: company?.id ?? null,
          user_id: user.id,
          member_id: isEmployee && memberInfo ? memberInfo.member_id : null,
          user_role: isEmployee
            ? memberInfo?.member_role_name || 'employee'
            : 'owner',
          action,
          entity_type: entity_type ?? null,
          entity_id: entity_id ?? null,
          metadata,
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        });
      } catch (err) {
        // Ne jamais bloquer l'UX pour un log
        console.warn('[activity_log] failed:', err);
      }
    },
    [user, isEmployee, memberInfo, company?.id]
  );

  return { log };
}
