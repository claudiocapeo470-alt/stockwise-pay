import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { notifyUser } from '@/lib/notifyUser';

export function useOrderNotifications(storeId: string | undefined, companyId: string | undefined) {
  const { user, isEmployee, memberInfo } = useAuth();
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
          const ownerId = isEmployee ? memberInfo?.owner_id : user?.id;
          notifyUser({
            companyId,
            userId: ownerId,
            type: 'success',
            title: '🛍️ Nouvelle commande !',
            message: `${order.customer_name || 'Client'} — ${(order.total || 0).toLocaleString('fr-FR')} FCFA`,
            url: '/app/boutique/commandes',
            tag: `order-${order.id}`,
          });
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [storeId, companyId, isEmployee, memberInfo, user?.id]);
}
