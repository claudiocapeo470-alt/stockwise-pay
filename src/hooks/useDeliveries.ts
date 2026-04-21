import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from './useCompany';

export interface Delivery {
  id: string;
  store_order_id: string | null;
  driver_member_id: string | null;
  company_id: string;
  status: string;
  assigned_at: string | null;
  started_at: string | null;
  delivered_at: string | null;
  problem_reason: string | null;
  proof_url: string | null;
  created_at: string;
  // joined
  driver?: { id: string; first_name: string; last_name: string | null; photo_url: string | null };
  order?: { id: string; order_number: string; customer_name: string; customer_phone: string; customer_address: string | null; total: number; items: any };
}

export function useDeliveries(driverMemberId?: string) {
  const { company } = useCompany();
  const qc = useQueryClient();
  const companyId = company?.id;

  const deliveriesQuery = useQuery({
    queryKey: ['deliveries', companyId, driverMemberId],
    queryFn: async () => {
      let query = supabase
        .from('deliveries')
        .select('*, company_members!deliveries_driver_member_id_fkey(id, first_name, last_name, photo_url), store_orders!deliveries_store_order_id_fkey(id, order_number, customer_name, customer_phone, customer_address, total, items)')
        .eq('company_id', companyId!);

      if (driverMemberId) {
        query = query.eq('driver_member_id', driverMemberId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((d: any) => ({
        ...d,
        driver: d.company_members || undefined,
        order: d.store_orders || undefined,
      })) as Delivery[];
    },
    enabled: !!companyId,
  });

  const createDelivery = useMutation({
    mutationFn: async (d: { store_order_id: string; driver_member_id?: string }) => {
      const { error } = await supabase.from('deliveries').insert({
        company_id: companyId!,
        store_order_id: d.store_order_id,
        driver_member_id: d.driver_member_id || null,
        status: d.driver_member_id ? 'assigned' : 'unassigned',
        assigned_at: d.driver_member_id ? new Date().toISOString() : null,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deliveries', companyId, driverMemberId] }),
  });

  const assignDriver = useMutation({
    mutationFn: async ({ deliveryId, driverMemberId }: { deliveryId: string; driverMemberId: string }) => {
      const { error } = await supabase.from('deliveries').update({
        driver_member_id: driverMemberId,
        status: 'assigned',
        assigned_at: new Date().toISOString(),
      }).eq('id', deliveryId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deliveries', companyId, driverMemberId] }),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ deliveryId, status, problemReason }: { deliveryId: string; status: string; problemReason?: string }) => {
      const updates: any = { status };
      if (status === 'in_progress') updates.started_at = new Date().toISOString();
      if (status === 'delivered') updates.delivered_at = new Date().toISOString();
      if (status === 'problem') updates.problem_reason = problemReason || null;
      const { error } = await supabase.from('deliveries').update(updates).eq('id', deliveryId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deliveries', companyId, driverMemberId] }),
  });

  return {
    deliveries: deliveriesQuery.data || [],
    loading: deliveriesQuery.isLoading,
    createDelivery,
    assignDriver,
    updateStatus,
  };
}
