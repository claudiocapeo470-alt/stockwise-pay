import { useState } from "react";
import { SectionHeading } from "@/components/layout/PageShell";
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
import { Phone, MessageCircle, Package, Clock, DollarSign, TrendingUp, Truck, CheckCircle2, ChefHat, XCircle, PackageCheck } from "lucide-react";
import { useOrderNotifications } from '@/hooks/useOrderNotifications';


const STATUS_MAP: Record<string, { label: string; color: string; icon: any; iconColor: string }> = {
  pending: { label: "En attente", color: "bg-warning/10 text-warning", icon: Clock, iconColor: "text-warning" },
  confirmed: { label: "Confirmée", color: "bg-primary/10 text-primary", icon: CheckCircle2, iconColor: "text-primary" },
  preparing: { label: "En préparation", color: "bg-orange-500/10 text-orange-600", icon: ChefHat, iconColor: "text-orange-600" },
  shipped: { label: "Expédiée", color: "bg-accent/10 text-accent", icon: Truck, iconColor: "text-accent" },
  delivered: { label: "Livrée", color: "bg-success/10 text-success", icon: PackageCheck, iconColor: "text-success" },
  cancelled: { label: "Annulée", color: "bg-destructive/10 text-destructive", icon: XCircle, iconColor: "text-destructive" },
};

/** Rendu unifié d'un item de statut (icône + libellé) */
function StatusOption({ statusKey }: { statusKey: string }) {
  const s = STATUS_MAP[statusKey] || STATUS_MAP.pending;
  const Icon = s.icon;
  return (
    <span className="flex items-center gap-2">
      <Icon className={`h-4 w-4 ${s.iconColor}`} />
      <span>{s.label}</span>
    </span>
  );
}


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
          { icon: DollarSign, label: "Revenus du jour", value: `${todayRevenue.toLocaleString('de-DE')} F`, color: "text-green-600" },
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

      <SectionHeading
        title="Détails des commandes"
        count={orders.length}
      />

      {/* Liste minimaliste unifiée */}
      {orders.length === 0 ? (
        <ListEmpty
          icon={<Package className="h-6 w-6" />}
          title="Aucune commande reçue"
          description="Les commandes de votre boutique s'afficheront ici."
        />
      ) : (
        <ListShell>
          {orders.map(order => {
            const status = STATUS_MAP[order.status] || STATUS_MAP.pending;
            const items = Array.isArray(order.items) ? order.items : [];
            const Icon = status.icon;
            return (
              <ListRow
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                leading={<ListAvatar icon={<Icon className="h-5 w-5" />} tone="primary" />}
                title={order.customer_name}
                badge={<ListBadge className={status.color}>{status.label}</ListBadge>}
                subtitle={`${order.order_number} · ${items.length} article${items.length > 1 ? 's' : ''} · ${new Date(order.created_at).toLocaleDateString('fr-FR')}`}
                value={<>{(order.total || 0).toLocaleString('de-DE')}<span className="text-[11px] font-normal text-muted-foreground ml-1">FCFA</span></>}
                actions={
                  <Select value={order.status} onValueChange={v => handleStatusChange(order.id, v)}>
                    <SelectTrigger className="w-[52px] sm:w-36 h-9 rounded-xl text-xs" onClick={e => e.stopPropagation()}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(STATUS_MAP).map((key) => (
                        <SelectItem key={key} value={key}><StatusOption statusKey={key} /></SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                }
              />
            );
          })}
        </ListShell>
      )}




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
                      <span className="font-medium">{((item.price || 0) * (item.quantity || 1)).toLocaleString('de-DE')} F</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 space-y-1 text-sm">
                    <div className="flex justify-between"><span>Sous-total</span><span>{(selectedOrder.subtotal || 0).toLocaleString('de-DE')} F</span></div>
                    <div className="flex justify-between"><span>Livraison</span><span>{(selectedOrder.delivery_fee || 0).toLocaleString('de-DE')} F</span></div>
                    <div className="flex justify-between font-bold text-base"><span>TOTAL</span><span>{(selectedOrder.total || 0).toLocaleString('de-DE')} FCFA</span></div>
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
