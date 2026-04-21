import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export function useOrderNotifications(storeId: string | undefined) {
  const { isEmployee, memberInfo } = useAuth();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!storeId) return;

    const role = (memberInfo?.member_role_name || '').toLowerCase();
    const shouldNotify = !isEmployee ||
      role.includes('manager') ||
      role.includes('commande') ||
      role.includes('fusionn');

    if (!shouldNotify) return;

    channelRef.current = supabase
      .channel(`orders-${storeId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'store_orders', filter: `store_id=eq.${storeId}` },
        (payload) => {
          const order = payload.new as any;
          toast.success('🛍️ Nouvelle commande !', {
            description: `Commande de ${order.customer_name || 'client'} — ${(order.total || 0).toLocaleString()} FCFA`,
            duration: 6000,
            action: {
              label: 'Voir',
              // Use SPA navigation via custom event (handled in AppLayout)
              onClick: () => window.dispatchEvent(
                new CustomEvent('app-navigate', { detail: '/app/boutique/commandes' })
              ),
            },
          });
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [storeId, isEmployee, memberInfo]);
}
