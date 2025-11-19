import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Search, UserCheck, UserX, Edit } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { EditUserDialog } from "@/components/admin/EditUserDialog";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: profilesData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      const { data: rolesData } = await supabase.from('user_roles').select('user_id, role');
      const { data: subsData } = await supabase.from('subscribers').select('user_id, subscribed').eq('subscribed', true);

      const usersWithData = (profilesData || []).map((profile) => ({
        ...profile,
        account_status: profile.account_status || 'active',
        role: rolesData?.find((r) => r.user_id === profile.user_id)?.role || 'user',
        subscribed: !!subsData?.find((s) => s.user_id === profile.user_id),
      }));

      setUsers(usersWithData);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    if (!selectedUser) return;
    const newStatus = selectedUser.account_status === 'active' ? 'inactive' : 'active';
    
    try {
      await supabase.functions.invoke('admin-toggle-user-status', {
        body: { userId: selectedUser.user_id, status: newStatus }
      });
      toast.success('Statut mis à jour');
      fetchUsers();
      setSelectedUser(null);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filtered = users.filter((u) =>
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.first_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
      
      <Card>
        <CardHeader>
          <Input placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.first_name} {user.last_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell><Badge>{user.role}</Badge></TableCell>
                  <TableCell><Badge variant={user.account_status === 'active' ? 'default' : 'secondary'}>{user.account_status}</Badge></TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => setEditingUser(user)}><Edit className="h-4 w-4" /></Button>
                    <Button size="sm" variant={user.account_status === 'active' ? 'destructive' : 'default'} onClick={() => setSelectedUser(user)}>
                      {user.account_status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingUser && <EditUserDialog open={!!editingUser} onOpenChange={(o) => !o && setEditingUser(null)} user={{ id: editingUser.user_id, email: editingUser.email, first_name: editingUser.first_name, last_name: editingUser.last_name, company_name: editingUser.company_name }} onSuccess={fetchUsers} />}
      
      <AlertDialog open={!!selectedUser} onOpenChange={(o) => !o && setSelectedUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer</AlertDialogTitle>
            <AlertDialogDescription>Changer le statut de {selectedUser?.email} ?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggle}>Confirmer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
