import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOnlineStore, useStoreOrders } from "@/hooks/useOnlineStore";
import { useDeliveries } from "@/hooks/useDeliveries";
import { useCompany } from "@/hooks/useCompany";
import { toast } from "sonner";
import { Phone, MessageCircle, Package, Clock, DollarSign, TrendingUp, Truck } from "lucide-react";
import { useOrderNotifications } from '@/hooks/useOrderNotifications';


const STATUS_MAP: Record<string, { label: string; color: string; emoji: string }> = {
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", emoji: "⏳" },
  confirmed: { label: "Confirmée", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", emoji: "✅" },
  preparing: { label: "En préparation", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400", emoji: "🍳" },
  shipped: { label: "Expédiée", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400", emoji: "🚚" },
  delivered: { label: "Livrée", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", emoji: "✅" },
  cancelled: { label: "Annulée", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", emoji: "❌" },
};

export default function StoreOrders() {
  const { store } = useOnlineStore();
  const { orders, updateOrderStatus } = useStoreOrders(store?.id);
  const { company } = useCompany();
  const { createDelivery } = useDeliveries();
  useOrderNotifications(store?.id);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const handleCreateDelivery = async (order: any) => {
    if (!company?.id) return;
    try {
      await createDelivery.mutateAsync({ store_order_id: order.id });
      toast.success(`Livraison créée pour la commande ${order.order_number}`);
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la création");
    }
  };

  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString());
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const todayRevenue = todayOrders.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.total || 0), 0);

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status });
      toast.success("Statut mis à jour");
    } catch (e: any) { toast.error(e.message); }
  };

  if (!store) return <div className="text-center py-16"><p className="text-muted-foreground">Configurez d'abord votre boutique</p></div>;

  return (
    <div className="space-y-5 animate-fade-in max-w-5xl mx-auto w-full">
      

      {/* Stats */}
      <div className="stat-scroller" style={{ ["--stat-cols" as any]: 4 }}>
        {[
          { icon: Package, label: "Aujourd'hui", value: todayOrders.length, color: "text-primary" },
          { icon: Clock, label: "En attente", value: pendingOrders.length, color: "text-yellow-600" },
          { icon: DollarSign, label: "Revenus du jour", value: `${todayRevenue.toLocaleString()} F`, color: "text-green-600" },
          { icon: TrendingUp, label: "Total commandes", value: orders.length, color: "text-blue-600" },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-3 sm:p-4 flex items-center gap-3">
              <s.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${s.color} flex-shrink-0`} />
              <div className="min-w-0">
                <p className="text-lg sm:text-xl font-bold truncate">{s.value}</p>
                <p className="text-xs text-muted-foreground truncate">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop table */}
      <Card className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Commande</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Articles</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map(order => {
              const status = STATUS_MAP[order.status] || STATUS_MAP.pending;
              const items = Array.isArray(order.items) ? order.items : [];
              return (
                <TableRow key={order.id} className="cursor-pointer" onClick={() => setSelectedOrder(order)}>
                  <TableCell className="font-mono text-sm">{order.order_number}</TableCell>
                  <TableCell><div><p className="font-medium">{order.customer_name}</p><p className="text-xs text-muted-foreground">{order.customer_phone}</p></div></TableCell>
                  <TableCell>{items.length} article{items.length > 1 ? 's' : ''}</TableCell>
                  <TableCell className="font-bold">{(order.total || 0).toLocaleString()} FCFA</TableCell>
                  <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>{status.emoji} {status.label}</span></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell>
                    <Select value={order.status} onValueChange={v => handleStatusChange(order.id, v)}>
                      <SelectTrigger className="w-32 h-8 text-xs" onClick={e => e.stopPropagation()}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_MAP).map(([key, val]) => (
                          <SelectItem key={key} value={key}>{val.emoji} {val.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
            {orders.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Aucune commande reçue</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile cards — design minimaliste */}
      <div className="md:hidden space-y-4">
        {orders.map(order => {
          const status = STATUS_MAP[order.status] || STATUS_MAP.pending;
          const items = Array.isArray(order.items) ? order.items : [];
          return (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="bg-card border border-border rounded-2xl p-4 shadow-soft active:scale-[0.99] transition-transform cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <Package className="h-5 w-5 text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[15px] truncate leading-tight">{order.customer_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {order.order_number} · {items.length} article{items.length > 1 ? 's' : ''}
                  </p>
                </div>
                <p className="font-bold text-[15px] shrink-0">{(order.total || 0).toLocaleString()} <span className="text-xs font-normal text-muted-foreground">F</span></p>
              </div>

              <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString('fr-FR')}</span>
                <Select value={order.status} onValueChange={v => handleStatusChange(order.id, v)}>
                  <SelectTrigger className="w-36 h-9 rounded-xl text-xs" onClick={e => e.stopPropagation()}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_MAP).map(([key, val]) => (
                      <SelectItem key={key} value={key}>{val.emoji} {val.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        })}
        {orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-20 w-20 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
              <Package className="h-10 w-10 text-accent" />
            </div>
            <p className="font-semibold text-lg">Aucune commande reçue</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">Les commandes de votre boutique s'afficheront ici.</p>
          </div>
        )}
      </div>


      {/* Order detail modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Commande {selectedOrder.order_number}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{selectedOrder.customer_name}</p>
                  <p className="text-muted-foreground">{selectedOrder.customer_phone}</p>
                  {selectedOrder.customer_email && <p className="text-muted-foreground">{selectedOrder.customer_email}</p>}
                  {selectedOrder.customer_address && <p className="text-muted-foreground">{selectedOrder.customer_address}</p>}
                </div>
                <div className="border rounded-lg p-3 space-y-2">
                  {(Array.isArray(selectedOrder.items) ? selectedOrder.items : []).map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{item.icon || '📦'} {item.name} ×{item.quantity}</span>
                      <span className="font-medium">{((item.price || 0) * (item.quantity || 1)).toLocaleString()} F</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 space-y-1 text-sm">
                    <div className="flex justify-between"><span>Sous-total</span><span>{(selectedOrder.subtotal || 0).toLocaleString()} F</span></div>
                    <div className="flex justify-between"><span>Livraison</span><span>{(selectedOrder.delivery_fee || 0).toLocaleString()} F</span></div>
                    <div className="flex justify-between font-bold text-base"><span>TOTAL</span><span>{(selectedOrder.total || 0).toLocaleString()} FCFA</span></div>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" asChild className="flex-1 gap-1"><a href={`tel:${selectedOrder.customer_phone}`}><Phone className="h-4 w-4" />Appeler</a></Button>
                  <Button variant="outline" size="sm" asChild className="flex-1 gap-1"><a href={`https://wa.me/${selectedOrder.customer_phone?.replace(/\s/g, '')}?text=${encodeURIComponent(`Bonjour ${selectedOrder.customer_name}, votre commande ${selectedOrder.order_number} est ${STATUS_MAP[selectedOrder.status]?.label || selectedOrder.status}. Merci !`)}`} target="_blank"><MessageCircle className="h-4 w-4" />WhatsApp</a></Button>
                </div>
                {selectedOrder.status === 'confirmed' || selectedOrder.status === 'preparing' ? (
                  <Button size="sm" className="w-full gap-2" onClick={() => { handleCreateDelivery(selectedOrder); setSelectedOrder(null); }}>
                    <Truck className="h-4 w-4" /> Créer une livraison
                  </Button>
                ) : null}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
