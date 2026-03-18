import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCompany } from "@/hooks/useCompany";
import { useTeam, CompanyMember } from "@/hooks/useTeam";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Copy, Eye, EyeOff, Plus, RefreshCw, Users, Building2, MoreVertical, Pencil, Power, Trash2, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const PREDEFINED_ROLES = [
  { name: "Manager", permissions: { all: true, settings: false } },
  { name: "Gestionnaire Stock", permissions: { stock: true, boutique: true, sales: true } },
  { name: "Gestionnaire Commandes", permissions: { boutique_orders: true, sales: true } },
  { name: "Gestionnaire Fusionné", permissions: { stock: true, boutique: true, boutique_orders: true, sales: true } },
  { name: "Caissier", permissions: { pos: true, sales: ["read"] } },
  { name: "Livreur", permissions: { deliveries: true } },
];

const ROLE_COLORS: Record<string, string> = {
  "Manager": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  "Gestionnaire Stock": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  "Gestionnaire Commandes": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "Gestionnaire Fusionné": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "Caissier": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  "Livreur": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export default function TeamManagement() {
  const { isEmployee } = useAuth();
  const navigate = useNavigate();

  // Employees should never reach this page
  useEffect(() => {
    if (isEmployee) {
      navigate('/app', { replace: true });
    }
  }, [isEmployee, navigate]);

  if (isEmployee) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-7 w-7" /> Mon équipe
        </h1>
        <p className="text-muted-foreground">Gérez votre code entreprise et vos membres</p>
      </div>

      <Tabs defaultValue="code" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="code" className="text-xs sm:text-sm"><Building2 className="h-4 w-4 mr-1 hidden sm:inline" />Code Entreprise</TabsTrigger>
          <TabsTrigger value="members" className="text-xs sm:text-sm"><Users className="h-4 w-4 mr-1 hidden sm:inline" />Membres</TabsTrigger>
        </TabsList>

        <TabsContent value="code"><CompanyCodeTab /></TabsContent>
        <TabsContent value="members"><MembersTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function CompanyCodeTab() {
  const { company, regenerateCode } = useCompany();
  const [regenerating, setRegenerating] = useState(false);

  const handleCopy = () => {
    if (company?.company_code) {
      navigator.clipboard.writeText(company.company_code);
      toast.success("Code copié !");
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      await regenerateCode();
      toast.success("Nouveau code généré !");
    } catch {
      toast.error("Erreur lors de la régénération");
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Code entreprise</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Ce code à 6 chiffres permet à vos employés de se connecter. Communiquez-le à votre équipe.
        </p>
        <div className="flex items-center gap-4 justify-center">
          <div className="text-4xl md:text-6xl font-mono font-bold tracking-[0.3em] text-primary bg-muted px-6 py-4 rounded-xl">
            {company?.company_code || "------"}
          </div>
        </div>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={handleCopy} className="gap-2"><Copy className="h-4 w-4" /> Copier</Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2" disabled={regenerating}>
                <RefreshCw className={`h-4 w-4 ${regenerating ? 'animate-spin' : ''}`} /> Régénérer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Régénérer le code entreprise ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tous les employés devront utiliser le nouveau code pour se connecter.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleRegenerate}>Confirmer</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

function MembersTab() {
  const { members, roles, createMember, updateMember, deleteMember, generatePin } = useTeam();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMember, setEditMember] = useState<CompanyMember | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [showPinDialog, setShowPinDialog] = useState<CompanyMember | null>(null);
  const [revealedPin, setRevealedPin] = useState(false);

  const openCreate = () => {
    setEditMember(null);
    setFirstName("");
    setLastName("");
    setSelectedRole("");
    setPinCode(generatePin());
    setDialogOpen(true);
  };

  const openEdit = (m: CompanyMember) => {
    setEditMember(m);
    setFirstName(m.first_name);
    setLastName(m.last_name || "");
    setSelectedRole(m.role?.name || "");
    setPinCode(m.pin_code);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!firstName.trim() || !selectedRole) return;
    
    // Find role_id from roles list matching the selected predefined role name
    const matchingRole = roles.find(r => r.name === selectedRole);
    
    try {
      if (editMember) {
        await updateMember.mutateAsync({
          id: editMember.id,
          first_name: firstName,
          last_name: lastName || null,
          role_id: matchingRole?.id || null,
          pin_code: pinCode || editMember.pin_code,
        });
        toast.success("Membre mis à jour");
      } else {
        await createMember.mutateAsync({
          first_name: firstName,
          last_name: lastName,
          role_id: matchingRole?.id || undefined,
        });
        toast.success("Membre créé avec succès");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Erreur");
    }
  };

  const getLastLoginText = (date: string | null) => {
    if (!date) return "Jamais";
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
    } catch {
      return "Jamais";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Membres de l'équipe</CardTitle>
        <Button size="sm" onClick={openCreate} className="gap-1"><Plus className="h-4 w-4" /> Ajouter</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.map(m => {
            const roleName = m.role?.name || 'Sans rôle';
            const roleColor = ROLE_COLORS[roleName] || "bg-muted text-muted-foreground";
            const initials = `${m.first_name[0]}${(m.last_name || '')[0] || ''}`.toUpperCase();

            return (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={m.photo_url || ''} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm truncate">{m.first_name} {m.last_name || ''}</p>
                    <Badge className={`text-[10px] px-1.5 py-0 ${roleColor}`}>{roleName}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{m.is_active ? '🟢 Actif' : '🔴 Inactif'}</span>
                    <span>•</span>
                    <span>Dernière connexion : {getLastLoginText(m.last_login_at)}</span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(m)}>
                      <Pencil className="h-4 w-4 mr-2" /> Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateMember.mutateAsync({ id: m.id, is_active: !m.is_active })}>
                      <Power className="h-4 w-4 mr-2" /> {m.is_active ? 'Désactiver' : 'Activer'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setShowPinDialog(m); setRevealedPin(false); }}>
                      <Eye className="h-4 w-4 mr-2" /> Voir PIN
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/app/performance?member=${m.id}`)}>
                      <BarChart3 className="h-4 w-4 mr-2" /> Voir performance
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => deleteMember.mutateAsync(m.id)}>
                      <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
          {members.length === 0 && <p className="text-center text-muted-foreground py-8">Aucun membre. Ajoutez votre premier employé.</p>}
        </div>
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editMember ? "Modifier le membre" : "Nouveau membre"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Prénom *</Label><Input value={firstName} onChange={e => setFirstName(e.target.value)} /></div>
              <div><Label>Nom</Label><Input value={lastName} onChange={e => setLastName(e.target.value)} /></div>
            </div>
            <div>
              <Label>Rôle *</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger><SelectValue placeholder="Choisir un rôle" /></SelectTrigger>
                <SelectContent>
                  {PREDEFINED_ROLES.map(r => (
                    <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {editMember && (
              <div>
                <Label>Code PIN (6 chiffres)</Label>
                <div className="flex gap-2">
                  <Input value={pinCode} onChange={e => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} className="font-mono text-lg tracking-widest" />
                  <Button variant="outline" size="icon" onClick={() => setPinCode(generatePin())}><RefreshCw className="h-4 w-4" /></Button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter><Button onClick={handleSave} disabled={!firstName.trim() || !selectedRole}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View PIN Dialog */}
      <Dialog open={!!showPinDialog} onOpenChange={() => setShowPinDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Code PIN de {showPinDialog?.first_name}</DialogTitle></DialogHeader>
          <div className="text-center space-y-4">
            <div className="text-4xl font-mono font-bold tracking-[0.3em] text-primary bg-muted px-4 py-3 rounded-xl">
              {revealedPin ? showPinDialog?.pin_code : '••••••'}
            </div>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => setRevealedPin(!revealedPin)} className="gap-2">
                {revealedPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {revealedPin ? 'Masquer' : 'Révéler'}
              </Button>
              {revealedPin && showPinDialog && (
                <Button variant="outline" onClick={() => { navigator.clipboard.writeText(showPinDialog.pin_code); toast.success("PIN copié !"); }} className="gap-2">
                  <Copy className="h-4 w-4" /> Copier
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
