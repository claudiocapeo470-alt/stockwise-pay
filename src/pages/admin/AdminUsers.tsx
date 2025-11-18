import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Search, UserCheck, UserX, Mail, Calendar, Shield } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfile {
  id: string;
  user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  created_at: string;
}

interface UserWithRole extends UserProfile {
  role: 'admin' | 'user' | null;
  subscribed: boolean;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [actionType, setActionType] = useState<'activate' | 'deactivate' | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter((user) =>
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      // Récupérer tous les profils
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Récupérer les rôles
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role');

      // Récupérer les abonnements
      const { data: subsData } = await supabase
        .from('subscribers')
        .select('user_id, subscribed')
        .eq('subscribed', true);

      const usersWithData: UserWithRole[] = (profilesData || []).map((profile) => {
        const userRole = rolesData?.find((r) => r.user_id === profile.user_id);
        const subscription = subsData?.find((s) => s.user_id === profile.user_id);
        
        return {
          ...profile,
          role: userRole?.role || 'user',
          subscribed: !!subscription,
        };
      });

      setUsers(usersWithData);
      setFilteredUsers(usersWithData);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedUser) return;

    try {
      // Cette fonctionnalité nécessite des edge functions pour désactiver/activer des comptes
      // Pour l'instant, on affiche juste un message
      toast.info("Fonctionnalité en cours de développement", {
        description: "La gestion de l'activation/désactivation nécessite des edge functions supplémentaires"
      });
      
      setSelectedUser(null);
      setActionType(null);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Une erreur s'est produite");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground mt-2">Gérez tous les utilisateurs de votre plateforme</p>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
        <p className="text-muted-foreground mt-2">
          {users.length} utilisateur{users.length > 1 ? 's' : ''} inscrit{users.length > 1 ? 's' : ''}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Utilisateurs</CardTitle>
          <CardDescription>Recherchez et gérez les comptes utilisateurs</CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par email, nom ou entreprise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Abonnement</TableHead>
                  <TableHead>Inscription</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {user.first_name} {user.last_name}
                          </p>
                          {user.company_name && (
                            <p className="text-sm text-muted-foreground">{user.company_name}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.role === 'admin' ? (
                          <Badge variant="destructive" className="gap-1">
                            <Shield className="h-3 w-3" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Utilisateur</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.subscribed ? (
                          <Badge variant="default" className="bg-green-600">Actif</Badge>
                        ) : (
                          <Badge variant="outline">Inactif</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(user.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              setActionType('activate');
                            }}
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              setActionType('deactivate');
                            }}
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'activate' ? 'Activer' : 'Désactiver'} l'utilisateur
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir {actionType === 'activate' ? 'activer' : 'désactiver'} le compte de {selectedUser?.first_name} {selectedUser?.last_name} ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction}>
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
