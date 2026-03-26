import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Package, CheckCircle, Truck, Clock, Store } from 'lucide-react';

const STEPS = [
  { key: 'pending', label: 'Commande reçue', icon: Package },
  { key: 'confirmed', label: 'Confirmée', icon: CheckCircle },
  { key: 'preparing', label: 'En préparation', icon: Clock },
  { key: 'shipped', label: 'En livraison', icon: Truck },
  { key: 'delivered', label: 'Livrée', icon: CheckCircle },
];

const STATUS_INDEX: Record<string, number> = { pending: 0, confirmed: 1, preparing: 2, shipped: 3, delivered: 4, cancelled: -1 };

export default function OrderTracking() {
  const { slug, orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!orderId) return;

      const { data: orderData } = await supabase
        .from('store_orders')
        .select('*, store:online_store(*)')
        .eq('id', orderId)
        .single();

      if (orderData) {
        setOrder(orderData);
        setStore((orderData as any).store);
      }
      setLoading(false);
    };

    fetch();

    // Realtime updates
    const channel = supabase
      .channel(`order-track-${orderId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'store_orders',
        filter: `id=eq.${orderId}`,
      }, (payload) => {
        setOrder((prev: any) => ({ ...prev, ...payload.new }));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent animate-spin rounded-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card><CardContent className="py-12 text-center"><Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" /><h2 className="text-lg font-semibold">Commande introuvable</h2><p className="text-sm text-muted-foreground">Vérifiez le lien de suivi</p></CardContent></Card>
      </div>
    );
  }

  const currentStep = STATUS_INDEX[order.status] ?? 0;
  const isCancelled = order.status === 'cancelled';
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {store?.logo_url ? (
            <img src={store.logo_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Store className="h-5 w-5 text-primary" /></div>
          )}
          <div>
            <h1 className="font-semibold">{store?.name || 'Boutique'}</h1>
            <p className="text-xs text-muted-foreground">Suivi de commande</p>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-bold">{order.order_number}</span>
              {isCancelled ? (
                <Badge variant="destructive">Annulée</Badge>
              ) : (
                <Badge variant="default">{STEPS[currentStep]?.label || order.status}</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Passée le {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </CardContent>
        </Card>

        {/* Timeline */}
        {!isCancelled && (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-0">
                {STEPS.map((step, i) => {
                  const isCompleted = i <= currentStep;
                  const isCurrent = i === currentStep;
                  return (
                    <div key={step.key} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'} ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                          <step.icon className="h-4 w-4" />
                        </div>
                        {i < STEPS.length - 1 && (
                          <div className={`w-0.5 h-8 ${i < currentStep ? 'bg-primary' : 'bg-border'}`} />
                        )}
                      </div>
                      <div className="pt-1.5">
                        <p className={`text-sm ${isCompleted ? 'font-semibold' : 'text-muted-foreground'}`}>{step.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Items */}
        <Card>
          <CardContent className="p-4 space-y-2">
            <h3 className="font-semibold text-sm mb-2">Articles commandés</h3>
            {items.map((item: any, i: number) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{item.icon || '📦'} {item.name} ×{item.quantity}</span>
                <span className="font-medium">{((item.price || 0) * (item.quantity || 1)).toLocaleString()} F</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2 space-y-1 text-sm">
              <div className="flex justify-between"><span>Sous-total</span><span>{(order.subtotal || 0).toLocaleString()} F</span></div>
              {(order.delivery_fee || 0) > 0 && <div className="flex justify-between"><span>Livraison</span><span>{order.delivery_fee.toLocaleString()} F</span></div>}
              <div className="flex justify-between font-bold text-base"><span>Total</span><span>{(order.total || 0).toLocaleString()} FCFA</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Customer info */}
        <Card>
          <CardContent className="p-4 text-sm space-y-1">
            <h3 className="font-semibold mb-2">Informations de livraison</h3>
            <p>{order.customer_name}</p>
            <p className="text-muted-foreground">{order.customer_phone}</p>
            {order.customer_address && <p className="text-muted-foreground">{order.customer_address}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
