import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/hooks/useCompany';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  read: boolean;
  created_at: string;
}

/** Chargement + temps réel des notifications de l'entreprise. */
export function useNotifications() {
  const { company } = useCompany();
  const companyId = company?.id;
  const queryClient = useQueryClient();
  const queryKey = ['notifications', companyId];
  const query = useQuery({
    queryKey,
    enabled: !!companyId,
    queryFn: async () => {
      const { data, error } = await supabase.from('notifications').select('*').eq('company_id', companyId || '').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return data as AppNotification[];
    },
    staleTime: 120000,
    refetchInterval: 30000,
  });
  const notifications = query.data || [];
  const isLoading = !!companyId && query.isLoading;

  useEffect(() => {
    if (!companyId) return;
    const channel = supabase
      .channel(`notifications-${companyId}-${crypto.randomUUID()}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `company_id=eq.${companyId}`,
      }, () => {
        void queryClient.invalidateQueries({ queryKey: ['notifications', companyId] });
      })
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [companyId, queryClient]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    if (!companyId) return;
    const { data, error } = await supabase.from('notifications').update({ read: true }).eq('id', id).eq('company_id', companyId).select('id');
    if (error || !data?.length) { toast.error('Impossible de marquer la notification comme lue'); return; }
    queryClient.setQueryData<AppNotification[]>(queryKey, prev => prev?.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = async () => {
    if (!companyId) return;
    const { data, error } = await supabase.from('notifications').update({ read: true }).eq('company_id', companyId).eq('read', false).select('id');
    if (error) { toast.error('Impossible de marquer les notifications comme lues'); return; }
    const updated = new Set(data?.map(n => n.id));
    queryClient.setQueryData<AppNotification[]>(queryKey, prev => prev?.map(n => updated.has(n.id) ? { ...n, read: true } : n));
    void queryClient.invalidateQueries({ queryKey });
  };

  return { notifications, unreadCount, isLoading, error: query.error, retry: query.refetch, markAsRead, markAllAsRead };
}
