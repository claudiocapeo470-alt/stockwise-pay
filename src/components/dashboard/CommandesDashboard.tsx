import { useAuth } from '@/contexts/AuthContext';
import { useOnlineStore, useStoreOrders } from '@/hooks/useOnlineStore';
import { useInvoices } from '@/hooks/useInvoices';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ClipboardList, FileText, FileCheck, Package, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';

export function CommandesDashboard() {
  const { memberInfo } = useAuth();
  const { store } = useOnlineStore();
  const { orders } = useStoreOrders(store?.id);
  const { invoices } = useInvoices('facture');
  const navigate = useNavigate();
  const firstName = memberInfo?.member_first_name || 'Gestionnaire';
  const pending = useMemo(() => orders.filter(o => o.status === 'pending'), [orders]);
  const today = useMemo(() => orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()), [orders]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Bonjour, {firstName} 👋</h1>
        <p className="text-sm text-muted-foreground">Gestion boutique en ligne</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <ClipboardList className="h-5 w-5 text-amber-500 mb-2" />
            <p className="text-2xl font-bold">{pending.length}</p>
            <p className="text-xs text-muted-foreground">En attente</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Clock className="h-5 w-5 text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{today.length}</p>
            <p className="text-xs text-muted-foreground">Aujourd'hui</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <FileText className="h-5 w-5 text-green-500 mb-2" />
            <p className="text-2xl font-bold">{invoices?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Factures</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Package className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold">{orders.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-12 gap-2" onClick={() => navigate('/app/boutique/commandes')}>
          <ClipboardList className="h-4 w-4" /> Commandes
        </Button>
        <Button variant="outline" className="h-12 gap-2" onClick={() => navigate('/app/boutique/produits')}>
          <ShoppingBag className="h-4 w-4" /> Produits en ligne
        </Button>
        <Button variant="outline" className="h-12 gap-2" onClick={() => navigate('/app/factures')}>
          <FileText className="h-4 w-4" /> Factures
        </Button>
        <Button variant="outline" className="h-12 gap-2" onClick={() => navigate('/app/devis')}>
          <FileCheck className="h-4 w-4" /> Devis
        </Button>
      </div>
    </div>
  );
}