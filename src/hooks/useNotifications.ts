import { useEffect, useState } from 'react';
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
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!company?.id) { setIsLoading(false); return; }

    let active = true;
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })
        .limit(100);
      if (active) {
        if (data) setNotifications(data as AppNotification[]);
        setIsLoading(false);
      }
    };

    fetchNotifications();

    const channel = supabase
      .channel(`notifications-${company.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `company_id=eq.${company.id}`,
      }, (payload) => {
        setNotifications(prev => [payload.new as AppNotification, ...prev]);
      })
      .subscribe();

    return () => { active = false; supabase.removeChannel(channel); };
  }, [company?.id]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = async () => {
    if (!company?.id) return;
    await supabase.from('notifications').update({ read: true }).eq('company_id', company.id).eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return { notifications, unreadCount, isLoading, markAsRead, markAllAsRead };
}
