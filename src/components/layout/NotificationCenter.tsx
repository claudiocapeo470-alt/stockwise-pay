import { useState, useEffect } from 'react';
import { Bell, Check, Package, AlertTriangle, CreditCard, Truck, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/hooks/useCompany';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  read: boolean;
  created_at: string;
}

const TYPE_ICONS: Record<string, any> = {
  stock_alert: AlertTriangle,
  new_order: Package,
  payment: CreditCard,
  delivery: Truck,
  info: Info,
};

const TYPE_COLORS: Record<string, string> = {
  stock_alert: 'text-yellow-500',
  new_order: 'text-blue-500',
  payment: 'text-green-500',
  delivery: 'text-purple-500',
  info: 'text-muted-foreground',
};

export function NotificationCenter() {
  const { company } = useCompany();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!company?.id) return;

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (data) setNotifications(data as Notification[]);
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
        setNotifications(prev => [payload.new as Notification, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [company?.id]);

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = async () => {
    if (!company?.id) return;
    await supabase.from('notifications').update({ read: true }).eq('company_id', company.id).eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={markAllAsRead}>
              <Check className="h-3 w-3 mr-1" /> Tout lire
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">Aucune notification</p>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map(n => {
                const IconComp = TYPE_ICONS[n.type] || Info;
                const iconColor = TYPE_COLORS[n.type] || 'text-muted-foreground';
                return (
                  <div
                    key={n.id}
                    className={`flex gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                    onClick={() => markAsRead(n.id)}
                  >
                    <IconComp className={`h-4 w-4 mt-0.5 shrink-0 ${iconColor}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-tight ${!n.read ? 'font-semibold' : ''}`}>{n.title}</p>
                      {n.message && <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: fr })}
                      </p>
                    </div>
                    {!n.read && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
