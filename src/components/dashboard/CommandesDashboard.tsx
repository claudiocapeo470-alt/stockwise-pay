import { useAuth } from '@/contexts/AuthContext';
import { useOnlineStore, useStoreOrders } from '@/hooks/useOnlineStore';
import { useInvoices } from '@/hooks/useInvoices';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, ClipboardList, FileText, FileCheck, Package, Clock, Users, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '@/hooks/useCurrency';
import { useMemo } from 'react';

export function CommandesDashboard() {
  const { memberInfo } = useAuth();
  const { store } = useOnlineStore();
  const { orders } = useStoreOrders(store?.id);
  const { invoices } = useInvoices('facture');
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const firstName = memberInfo?.member_first_name || 'Gestionnaire';

  const pending = useMemo(() => orders.filter(o => o.status === 'pending'), [orders]);
  const today = useMemo(() => orders.filter(o => new Date(o.created_at || '').toDateString() === new Date().toDateString()), [orders]);
  const todayCA = useMemo(() => today.reduce((s, o) => s + (o.total || 0), 0), [today]);

  // Last 5 orders
  const recentOrders = useMemo(() =>
    [...orders].sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()).slice(0, 5),
    [orders]
  );

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-500',
    confirmed: 'bg-blue-500',
    shipped: 'bg-purple-500',
    delivered: 'bg-green-500',
    cancelled: 'bg-destructive',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bonjour, {firstName} 👋</h1>
          <p className="text-sm text-muted-foreground">Gestion boutique en ligne</p>
        </div>
        {pending.length > 0 && (
          <Badge variant="destructive" className="animate-pulse gap-1">
            <Bell className="h-3 w-3" /> {pending.length} en attente
          </Badge>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className={pending.length > 0 ? 'border-amber-500/30' : ''}>
          <CardContent className="p-4">
            <ClipboardList className="h-5 w-5 text-amber-500 mb-2" />
            <p className="text-xl font-bold">{pending.length}</p>
            <p className="text-xs text-muted-foreground">En attente</p>
          </CardContent>
        </Card>
        <Card><CardContent className="p-4">
          <Package className="h-5 w-5 text-green-500 mb-2" />
          <p className="text-xl font-bold">{today.length}</p>
          <p className="text-xs text-muted-foreground">Aujourd'hui</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <ShoppingBag className="h-5 w-5 text-primary mb-2" />
          <p className="text-xl font-bold">{formatCurrency(todayCA)}</p>
          <p className="text-xs text-muted-foreground">CA boutique</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <Users className="h-5 w-5 text-blue-500 mb-2" />
          <p className="text-xl font-bold">{orders.length}</p>
          <p className="text-xs text-muted-foreground">Total commandes</p>
        </CardContent></Card>
      </div>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Dernières commandes</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium">{order.customer_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at || '').toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold">{formatCurrency(order.total)}</p>
                  <Badge className={statusColors[order.status || 'pending'] || 'bg-muted'}>
                    {order.status || 'pending'}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-12 gap-2" onClick={() => navigate('/app/boutique/commandes')}>
          <ClipboardList className="h-4 w-4" /> Commandes
        </Button>
        <Button variant="outline" className="h-12 gap-2" onClick={() => navigate('/app/boutique/produits')}>
          <ShoppingBag className="h-4 w-4" /> Produits
        </Button>
        <Button variant="outline" className="h-12 gap-2" onClick={() => navigate('/app/factures')}>
          <FileText className="h-4 w-4" /> Factures
        </Button>
        <Button variant="outline" className="h-12 gap-2" onClick={() => navigate('/app/clients')}>
          <Users className="h-4 w-4" /> Clients
        </Button>
      </div>
    </div>
  );
}
