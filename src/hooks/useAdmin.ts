import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const adminKeys = {
  users: ['admin', 'users'] as const,
  allProducts: ['admin', 'products'] as const,
  metrics: ['admin', 'metrics'] as const,
  subscriptions: ['admin', 'subscriptions'] as const,
  paymentHistory: (userId: string) => ['admin', 'payment-history', userId] as const,
};

// ─── Users ──────────────────────────────────────────────
export function useAdminUsers() {
  return useQuery({
    queryKey: adminKeys.users,
    queryFn: async () => {
      const [{ data: profiles }, { data: roles }, { data: subs }] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('user_roles').select('user_id, role'),
        supabase.from('subscribers').select('user_id, subscribed').eq('subscribed', true),
      ]);
      return (profiles || []).map((p: any) => ({
        ...p,
        account_status: p.account_status || 'active',
        role: roles?.find((r: any) => r.user_id === p.user_id)?.role || 'user',
        subscribed: !!subs?.find((s: any) => s.user_id === p.user_id),
      }));
    },
  });
}

export function useToggleUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      const { error } = await supabase.functions.invoke('admin-toggle-user-status', {
        body: { userId, status },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Statut mis à jour');
      qc.invalidateQueries({ queryKey: adminKeys.users });
    },
  });
}

// ─── Products (all users) ───────────────────────────────
export function useAdminAllProducts() {
  return useQuery({
    queryKey: adminKeys.allProducts,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, profiles!inner(email)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

// ─── Metrics ────────────────────────────────────────────
export function useAdminMetrics() {
  return useQuery({
    queryKey: adminKeys.metrics,
    queryFn: async () => {
      const [{ count: totalUsers }, { count: activeSubs }, { data: sales }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('subscribers').select('*', { count: 'exact', head: true }).eq('subscribed', true),
        supabase.from('sales').select('total_amount'),
      ]);
      const revenue = sales?.reduce((sum: number, s: any) => sum + s.total_amount, 0) || 0;
      return {
        totalUsers: totalUsers || 0,
        activeSubs: activeSubs || 0,
        revenue,
        totalSales: sales?.length || 0,
      };
    },
  });
}

// ─── Subscriptions ──────────────────────────────────────
export function useAdminSubscriptions() {
  return useQuery({
    queryKey: adminKeys.subscriptions,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useAdminPaymentHistory(userId: string | null) {
  return useQuery({
    queryKey: adminKeys.paymentHistory(userId || ''),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', userId!)
        .order('paid_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
}

export function useExtendSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ subId, days, currentEnd }: { subId: string; days: number; currentEnd: string | null }) => {
      const base = currentEnd ? new Date(currentEnd) : new Date();
      base.setDate(base.getDate() + days);
      const { error } = await supabase
        .from('subscribers')
        .update({
          subscription_end: base.toISOString(),
          subscribed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subId);
      if (error) throw error;
      return days;
    },
    onSuccess: (days) => {
      toast.success(`+${days} jours ajoutés`);
      qc.invalidateQueries({ queryKey: adminKeys.subscriptions });
    },
  });
}

// ─── Mass email ─────────────────────────────────────────
export function useSendMassEmail() {
  return useMutation({
    mutationFn: async (payload: {
      subject: string;
      message: string;
      notificationType: 'all' | 'subscribed' | 'specific';
      specificEmail?: string;
    }) => {
      const { error } = await supabase.functions.invoke('admin-send-mass-email', {
        body: payload,
      });
      if (error) throw error;
    },
    onSuccess: () => toast.success('Emails envoyés'),
  });
}
