import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ─── Query keys ─────────────────────────────────────────────────────
export const ceoKeys = {
  all: ['ceo'] as const,
  dashboard: ['ceo', 'dashboard'] as const,
  users: ['ceo', 'users'] as const,
  subscriptions: ['ceo', 'subscriptions'] as const,
  analytics: ['ceo', 'analytics'] as const,
  settings: ['ceo', 'settings'] as const,
  appearance: ['ceo', 'settings', 'appearance'] as const,
};

// ─── Dashboard ──────────────────────────────────────────────────────
export function useCeoDashboard() {
  return useQuery({
    queryKey: ceoKeys.dashboard,
    queryFn: async () => {
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const [profiles, subs, products, salesMonth, recent5, recentSubs5] = await Promise.all([
        supabase.from('profiles').select('created_at', { count: 'exact' }),
        supabase.from('subscribers').select('*'),
        supabase.from('products').select('quantity, min_quantity', { count: 'exact' }),
        supabase.from('sales').select('total_amount').gte('sale_date', monthStart),
        supabase.from('profiles').select('first_name, last_name, email, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('subscribers').select('email, plan_name, subscribed, is_trial, created_at').order('created_at', { ascending: false }).limit(5),
      ]);
      return { profiles, subs: subs.data || [], products, salesMonth: salesMonth.data || [], recent5: recent5.data || [], recentSubs5: recentSubs5.data || [] };
    },
  });
}

// ─── Users ─────────────────────────────────────────────────────────
export function useCeoUsers() {
  return useQuery({
    queryKey: ceoKeys.users,
    queryFn: async () => {
      const [{ data: profiles }, { data: roles }, { data: subs }] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('user_roles').select('user_id, role'),
        supabase.from('subscribers').select('user_id, plan_name, subscribed'),
      ]);
      const rolesMap = new Map((roles || []).map(r => [r.user_id, r.role]));
      const subsMap = new Map((subs || []).map(s => [s.user_id, s]));
      return (profiles || []).map(p => ({
        ...p,
        role: rolesMap.get(p.user_id) || 'user',
        plan_name: subsMap.get(p.user_id)?.plan_name,
        subscribed: subsMap.get(p.user_id)?.subscribed,
      }));
    },
  });
}

export function useCeoUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ user_id, first_name, last_name, company_name }: { user_id: string; first_name: string | null; last_name: string | null; company_name: string | null }) => {
      const { error } = await supabase.from('profiles').update({ first_name, last_name, company_name }).eq('user_id', user_id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Utilisateur mis à jour'); qc.invalidateQueries({ queryKey: ceoKeys.users }); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useCeoGiveTrial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ user_id, email }: { user_id: string; email: string }) => {
      const trialEnd = new Date(Date.now() + 14 * 86400000).toISOString();
      const { error } = await supabase.from('subscribers').upsert({
        user_id, email, is_trial: true, subscribed: true,
        trial_ends_at: trialEnd, subscription_end: trialEnd, plan_name: 'trial',
      }, { onConflict: 'user_id' });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("14 jours d'essai accordés"); qc.invalidateQueries({ queryKey: ceoKeys.users }); qc.invalidateQueries({ queryKey: ceoKeys.subscriptions }); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useCeoToggleRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ user_id, currentRole }: { user_id: string; currentRole: string }) => {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      const { error } = await supabase.from('user_roles').upsert({ user_id, role: newRole as any }, { onConflict: 'user_id,role' });
      if (error) throw error;
      return newRole;
    },
    onSuccess: (newRole) => { toast.success(`Rôle changé en ${newRole}`); qc.invalidateQueries({ queryKey: ceoKeys.users }); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useCeoDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (user_id: string) => {
      const { error } = await supabase.from('profiles').delete().eq('user_id', user_id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Utilisateur supprimé'); qc.invalidateQueries({ queryKey: ceoKeys.users }); },
    onError: (e: any) => toast.error(e.message),
  });
}

// ─── Subscriptions ─────────────────────────────────────────────────
export function useCeoSubscriptions() {
  return useQuery({
    queryKey: ceoKeys.subscriptions,
    queryFn: async () => {
      const { data, error } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCeoExtendSub() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, currentEnd, days }: { id: string; currentEnd: string | null; days: number }) => {
      const base = currentEnd && new Date(currentEnd) > new Date() ? new Date(currentEnd) : new Date();
      const newEnd = new Date(base.getTime() + days * 86400000).toISOString();
      const { error } = await supabase.from('subscribers').update({ subscription_end: newEnd, subscribed: true }).eq('id', id);
      if (error) throw error;
      return days;
    },
    onSuccess: (days) => { toast.success(`+${days} jours accordés`); qc.invalidateQueries({ queryKey: ceoKeys.subscriptions }); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useCeoChangePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, plan }: { id: string; plan: { name: string; label: string; days: number; price: number } }) => {
      const newEnd = new Date(Date.now() + plan.days * 86400000).toISOString();
      const { error } = await supabase.from('subscribers').update({
        plan_name: plan.name, plan_price: plan.price, subscription_end: newEnd,
        subscribed: true, is_trial: plan.name === 'trial',
        trial_ends_at: plan.name === 'trial' ? newEnd : null,
      }).eq('id', id);
      if (error) throw error;
      return plan.label;
    },
    onSuccess: (label) => { toast.success(`Plan changé en ${label}`); qc.invalidateQueries({ queryKey: ceoKeys.subscriptions }); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useCeoDeactivateSub() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('subscribers').update({ subscribed: false, is_trial: false }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Abonnement désactivé'); qc.invalidateQueries({ queryKey: ceoKeys.subscriptions }); },
    onError: (e: any) => toast.error(e.message),
  });
}

// ─── Analytics ─────────────────────────────────────────────────────
export function useCeoAnalytics() {
  return useQuery({
    queryKey: ceoKeys.analytics,
    queryFn: async () => {
      const [{ data: profiles }, { data: subs }, { data: sales }] = await Promise.all([
        supabase.from('profiles').select('created_at'),
        supabase.from('subscribers').select('plan_name, plan_price, subscribed'),
        supabase.from('sales').select('total_amount, sale_date'),
      ]);
      return { profiles: profiles || [], subs: subs || [], sales: sales || [] };
    },
  });
}

// ─── Settings (ceo_settings table) ──────────────────────────────────
export function useCeoSettings() {
  return useQuery({
    queryKey: ceoKeys.settings,
    queryFn: async () => {
      const { data } = await supabase.from('ceo_settings' as any).select('key, value');
      const map: Record<string, any> = {};
      (data as any[] | null)?.forEach((r: any) => { map[r.key] = r.value; });
      return map;
    },
  });
}

export function useSaveCeoSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { error } = await supabase.from('ceo_settings' as any).upsert(
        { key, value, updated_at: new Date().toISOString() } as any,
        { onConflict: 'key' }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ceoKeys.settings });
      qc.invalidateQueries({ queryKey: ceoKeys.appearance });
    },
  });
}

export function useCeoAppearance() {
  return useQuery({
    queryKey: ceoKeys.appearance,
    queryFn: async () => {
      const { data } = await supabase.from('ceo_settings' as any).select('*').eq('key', 'appearance').maybeSingle();
      return (data as any)?.value || null;
    },
  });
}

// ─── Mass email (edge function) ────────────────────────────────────
export function useSendMassEmail() {
  return useMutation({
    mutationFn: async ({ subject, message, notificationType }: { subject: string; message: string; notificationType: string }) => {
      const { data, error } = await supabase.functions.invoke('admin-send-mass-email', { body: { subject, message, notificationType } });
      if (error) throw error;
      return data;
    },
    onError: (e: any) => toast.error('Erreur', { description: e.message }),
  });
}
