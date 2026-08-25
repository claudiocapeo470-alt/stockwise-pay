import { AlertTriangle, Bell, Check, CreditCard, Info, Package, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNotifications } from '@/hooks/useNotifications';
import { SectionHeading } from '@/components/layout/PageShell';
import { ListShell, ListRow, ListAvatar, ListEmpty } from '@/components/layout/MinimalList';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useState } from 'react';
import { FilterPills } from '@/components/layout/FilterPills';

const TYPE_ICONS: Record<string, any> = {
  stock_alert: AlertTriangle,
  new_order: Package,
  payment: CreditCard,
  delivery: Truck,
  info: Info,
};

const TYPE_TONES: Record<string, 'muted' | 'primary' | 'success' | 'warning' | 'destructive'> = {
  stock_alert: 'warning',
  new_order: 'primary',
  payment: 'success',
  delivery: 'primary',
  info: 'muted',
};

export default function Notifications() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState('all');

  const filtered = notifications.filter(n =>
    filter === 'all' ? true : filter === 'unread' ? !n.read : n.read,
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <FilterPills
        filters={[
          { key: 'all', label: 'Toutes', count: notifications.length },
          { key: 'unread', label: 'Non lues', count: unreadCount },
          { key: 'read', label: 'Lues' },
        ]}
        value={filter}
        onChange={setFilter}
      />

      <SectionHeading
        title="Notifications"
        count={filtered.length}
        action={
          unreadCount > 0 ? (
            <Button variant="ghost" size="sm" className="h-9 rounded-xl gap-1.5 text-xs" onClick={markAllAsRead}>
              <Check className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Tout lire</span>
            </Button>
          ) : undefined
        }
      />

      {filtered.length === 0 ? (
        <ListEmpty
          icon={<Bell className="h-6 w-6" />}
          title="Aucune notification"
          description="Vos alertes de stock, commandes et paiements apparaîtront ici."
        />
      ) : (
        <ListShell>
          {filtered.map(n => {
            const Icon = TYPE_ICONS[n.type] || Info;
            return (
              <ListRow
                key={n.id}
                className={!n.read ? 'bg-primary/5' : undefined}
                leading={<ListAvatar icon={<Icon className="h-5 w-5" />} tone={TYPE_TONES[n.type] || 'muted'} />}
                title={n.title}
                subtitle={n.message || undefined}
                hint={formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: fr })}
                onClick={() => !n.read && markAsRead(n.id)}
                actions={!n.read ? <span className="h-2.5 w-2.5 rounded-full bg-primary" /> : undefined}
              />
            );
          })}
        </ListShell>
      )}
    </div>
  );
}
