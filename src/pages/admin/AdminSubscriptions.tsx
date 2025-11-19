import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Edit } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { EditSubscriptionDialog } from "@/components/admin/EditSubscriptionDialog";

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [editingSubscription, setEditingSubscription] = useState<any>(null);

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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestion des Abonnements</h1>
      
      <Card>
        <CardHeader><CardTitle>Liste des Abonnements</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>{sub.email}</TableCell>
                  <TableCell><Badge variant={sub.subscribed ? 'default' : 'secondary'}>{sub.subscribed ? 'Actif' : 'Inactif'}</Badge></TableCell>
                  <TableCell>{sub.amount} {sub.currency}</TableCell>
                  <TableCell>{sub.subscription_end ? new Date(sub.subscription_end).toLocaleDateString('fr-FR') : '-'}</TableCell>
                  <TableCell><Button size="sm" variant="outline" onClick={() => setEditingSubscription(sub)}><Edit className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingSubscription && <EditSubscriptionDialog open={!!editingSubscription} onOpenChange={(o) => !o && setEditingSubscription(null)} subscription={editingSubscription} onSuccess={fetchSubscriptions} />}
    </div>
  );
}
