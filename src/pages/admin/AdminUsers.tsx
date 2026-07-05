import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, UserX, Edit } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { EditUserDialog } from "@/components/admin/EditUserDialog";
import { useAdminUsers, useToggleUserStatus } from "@/hooks/useAdmin";

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);

  const { data: users = [], isLoading } = useAdminUsers();
  const toggleMutation = useToggleUserStatus();

  const handleToggle = () => {
    if (!selectedUser) return;
    const newStatus = selectedUser.account_status === 'active' ? 'inactive' : 'active';
    toggleMutation.mutate(
      { userId: selectedUser.user_id, status: newStatus },
      { onSettled: () => setSelectedUser(null) }
    );
  };

  const filtered = users.filter((u: any) =>
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
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Chargement...</TableCell></TableRow>
              ) : filtered.map((user: any) => (
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

      {editingUser && <EditUserDialog open={!!editingUser} onOpenChange={(o) => !o && setEditingUser(null)} user={{ id: editingUser.user_id, email: editingUser.email, first_name: editingUser.first_name, last_name: editingUser.last_name, company_name: editingUser.company_name }} />}

      <AlertDialog open={!!selectedUser} onOpenChange={(o) => !o && setSelectedUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer</AlertDialogTitle>
            <AlertDialogDescription>Changer le statut de {selectedUser?.email} ?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggle} disabled={toggleMutation.isPending}>Confirmer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
