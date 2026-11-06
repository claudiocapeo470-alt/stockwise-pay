import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/** Nombre de commandes boutique en attente (badge navigation). */
export function usePendingOrdersCount(): number {
  const { user, isEmployee, memberInfo } = useAuth();
  const ownerId = isEmployee ? memberInfo?.owner_id : user?.id;

  const { data } = useQuery({
    queryKey: ['pending-orders-count', ownerId],
    enabled: !!ownerId,
    staleTime: 120000,
    queryFn: async () => {
      const { data: store } = await supabase
        .from('online_store')
        .select('id')
        .eq('user_id', ownerId!)
        .maybeSingle();
      if (!store) return 0;
      const { count } = await supabase
        .from('store_orders')
        .select('id', { count: 'exact', head: true })
        .eq('store_id', store.id)
        .eq('status', 'pending');
      return count ?? 0;
    },
  });

  return data ?? 0;
}
