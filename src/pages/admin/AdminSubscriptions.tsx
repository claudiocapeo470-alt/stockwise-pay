import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Edit, Users, Clock, AlertTriangle, DollarSign, Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { EditSubscriptionDialog } from "@/components/admin/EditSubscriptionDialog";

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [editingSubscription, setEditingSubscription] = useState<any>(null);
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [historyModal, setHistoryModal] = useState<{ open: boolean; userId: string; history: any[] }>({ open: false, userId: '', history: [] });

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const { data } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false });
      setSubscriptions(data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    }
  };

  const now = new Date();

  const getStatus = (sub: any) => {
    if (sub.is_trial && sub.trial_ends_at && new Date(sub.trial_ends_at) > now) return 'trial';
    if (sub.subscribed && sub.subscription_end && new Date(sub.subscription_end) > now) return 'active';
    return 'expired';
  };

  const getDaysLeft = (sub: any) => {
    if (!sub.subscription_end) return 0;
    return Math.max(0, Math.ceil((new Date(sub.subscription_end).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const filtered = subscriptions.filter(sub => {
    const status = getStatus(sub);
    if (filterPlan !== 'all' && sub.plan_name !== filterPlan) return false;
    if (filterStatus !== 'all' && status !== filterStatus) return false;
    return true;
  });

  const stats = {
    active: subscriptions.filter(s => getStatus(s) === 'active').length,
    trial: subscriptions.filter(s => getStatus(s) === 'trial').length,
    expired: subscriptions.filter(s => getStatus(s) === 'expired').length,
    revenue: subscriptions.filter(s => getStatus(s) === 'active').reduce((sum, s) => sum + (s.plan_price || s.amount || 0), 0),
  };

  const getPlanBadge = (planName: string) => {
    switch (planName) {
      case 'trial': return <Badge variant="secondary">Essai</Badge>;
      case 'starter': return <Badge className="bg-emerald-500 text-white">Starter</Badge>;
      case 'business': return <Badge className="bg-primary text-primary-foreground">Business</Badge>;
      case 'pro': return <Badge className="bg-purple-600 text-white">Pro</Badge>;
      default: return <Badge variant="outline">{planName || '-'}</Badge>;
    }
  };

  const getStatusBadge = (sub: any) => {
    const status = getStatus(sub);
    switch (status) {
      case 'active': return <Badge className="bg-success/10 text-success">Actif</Badge>;
      case 'trial': return <Badge variant="secondary">Essai</Badge>;
      case 'expired': return <Badge variant="destructive">Expiré</Badge>;
    }
  };

  const viewHistory = async (userId: string) => {
    const { data } = await supabase.from('payment_history').select('*').eq('user_id', userId).order('paid_at', { ascending: false });
    setHistoryModal({ open: true, userId, history: data || [] });
  };

  const extendSubscription = async (subId: string, days: number) => {
    const sub = subscriptions.find(s => s.id === subId);
    if (!sub) return;
    const currentEnd = sub.subscription_end ? new Date(sub.subscription_end) : new Date();
    const newEnd = new Date(currentEnd);
    newEnd.setDate(newEnd.getDate() + days);

    const { error } = await supabase.from('subscribers').update({
      subscription_end: newEnd.toISOString(),
      subscribed: true,
      updated_at: new Date().toISOString(),
    }).eq('id', subId);

    if (error) {
      toast.error('Erreur');
    } else {
      toast.success(`+${days} jours ajoutés`);
      fetchSubscriptions();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestion des Abonnements</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-success" />
            <div><p className="text-2xl font-bold">{stats.active}</p><p className="text-xs text-muted-foreground">Actifs</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-primary" />
            <div><p className="text-2xl font-bold">{stats.trial}</p><p className="text-xs text-muted-foreground">En essai</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <div><p className="text-2xl font-bold">{stats.expired}</p><p className="text-xs text-muted-foreground">Expirés</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-warning" />
            <div><p className="text-2xl font-bold">{stats.revenue.toLocaleString()}</p><p className="text-xs text-muted-foreground">XOF/mois</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Select value={filterPlan} onValueChange={setFilterPlan}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Plan" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les plans</SelectItem>
            <SelectItem value="trial">Essai</SelectItem>
            <SelectItem value="starter">Starter</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="active">Actif</SelectItem>
            <SelectItem value="trial">En essai</SelectItem>
            <SelectItem value="expired">Expiré</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader><CardTitle>Liste des Abonnements ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Jours restants</TableHead>
                <TableHead>Cycle</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">{sub.email}</TableCell>
                  <TableCell>{getPlanBadge(sub.plan_name)}</TableCell>
                  <TableCell>{getStatusBadge(sub)}</TableCell>
                  <TableCell>{getDaysLeft(sub)}j</TableCell>
                  <TableCell className="capitalize">{sub.billing_cycle === 'annual' ? 'Annuel' : 'Mensuel'}</TableCell>
                  <TableCell>{(sub.plan_price || sub.amount || 0).toLocaleString()} {sub.currency}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => viewHistory(sub.user_id)} title="Historique">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => extendSubscription(sub.id, 30)} title="+30 jours">
                        +30j
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingSubscription(sub)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingSubscription && (
        <EditSubscriptionDialog
          open={!!editingSubscription}
          onOpenChange={(o) => !o && setEditingSubscription(null)}
          subscription={editingSubscription}
          onSuccess={fetchSubscriptions}
        />
      )}

      {/* Payment History Modal */}
      <Dialog open={historyModal.open} onOpenChange={(o) => !o && setHistoryModal({ open: false, userId: '', history: [] })}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Historique des paiements</DialogTitle></DialogHeader>
          {historyModal.history.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucun paiement enregistré</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyModal.history.map((h: any) => (
                  <TableRow key={h.id}>
                    <TableCell>{new Date(h.paid_at).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell className="capitalize">{h.plan_name}</TableCell>
                    <TableCell>{h.amount?.toLocaleString()} {h.currency}</TableCell>
                    <TableCell>
                      <Badge variant={h.status === 'success' ? 'default' : 'destructive'}>
                        {h.status === 'success' ? 'Payé' : 'Échoué'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
