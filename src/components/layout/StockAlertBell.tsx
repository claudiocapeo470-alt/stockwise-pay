import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStockAlerts } from '@/hooks/useStockAlerts';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export function StockAlertBell() {
  const { alerts, unreadCount, markAsRead, markAllAsRead } = useStockAlerts();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h4 className="font-semibold text-sm">Alertes stock</h4>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">
              Tout marquer comme lu
            </button>
          )}
        </div>
        <ScrollArea className="max-h-72">
          {alerts.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">Aucune alerte</p>
          ) : (
            <div className="divide-y divide-border">
              {alerts.map(alert => (
                <button
                  key={alert.id}
                  onClick={() => markAsRead(alert.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors ${!alert.read ? 'bg-primary/5' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg flex-shrink-0">⚠️</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{alert.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        Stock : {alert.currentStock} / min. {alert.minQuantity}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {formatDistanceToNow(alert.timestamp, { addSuffix: true, locale: fr })}
                      </p>
                    </div>
                    {!alert.read && <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
