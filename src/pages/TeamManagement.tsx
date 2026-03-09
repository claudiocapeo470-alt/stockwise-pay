import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCompany } from "@/hooks/useCompany";
import { useTeam, CompanyRole, CompanyMember } from "@/hooks/useTeam";
import { toast } from "sonner";
import { Copy, Eye, EyeOff, Plus, Trash2, RefreshCw, Users, Building2, Shield, Layers } from "lucide-react";

const PERMISSION_MODULES = [
  { key: "stock", label: "Gestion Stock" },
  { key: "purchases", label: "Achats" },
  { key: "sales", label: "Ventes" },
  { key: "boutique", label: "Boutique" },
  { key: "pos", label: "Caisse POS" },
  { key: "deliveries", label: "Livraison" },
  { key: "reports", label: "Rapports" },
  { key: "settings", label: "Paramètres" },
];

const PERMISSION_ACTIONS = ["read", "create", "update", "delete"];

export default function TeamManagement() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-7 w-7" /> Mon équipe
        </h1>
        <p className="text-muted-foreground">Gérez vos services, rôles et membres</p>
      </div>

      <Tabs defaultValue="code" className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="code" className="text-xs sm:text-sm"><Building2 className="h-4 w-4 mr-1 hidden sm:inline" />Code</TabsTrigger>
          <TabsTrigger value="services" className="text-xs sm:text-sm"><Layers className="h-4 w-4 mr-1 hidden sm:inline" />Services</TabsTrigger>
          <TabsTrigger value="roles" className="text-xs sm:text-sm"><Shield className="h-4 w-4 mr-1 hidden sm:inline" />Rôles</TabsTrigger>
          <TabsTrigger value="members" className="text-xs sm:text-sm"><Users className="h-4 w-4 mr-1 hidden sm:inline" />Membres</TabsTrigger>
        </TabsList>

        <TabsContent value="code"><CompanyCodeTab /></TabsContent>
        <TabsContent value="services"><ServicesTab /></TabsContent>
        <TabsContent value="roles"><RolesTab /></TabsContent>
        <TabsContent value="members"><MembersTab /></TabsContent>
      </Tabs>
    </div>
  );
}

// ===== TAB 1: Company Code =====
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
      toast.success("Nouveau code généré ! Tous les employés devront utiliser le nouveau code.");
    } catch {
      toast.error("Erreur lors de la régénération");
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Code entreprise</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Ce code à 6 chiffres permet à vos employés de se connecter à l'application. Communiquez-le à votre équipe.
        </p>
        <div className="flex items-center gap-4 justify-center">
          <div className="text-4xl md:text-6xl font-mono font-bold tracking-[0.3em] text-primary bg-muted px-6 py-4 rounded-xl">
            {company?.company_code || "------"}
          </div>
        </div>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={handleCopy} className="gap-2">
            <Copy className="h-4 w-4" /> Copier
          </Button>
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
                  Tous les employés devront utiliser le nouveau code pour se connecter. Les sessions actives ne seront pas affectées.
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

// ===== TAB 2: Services =====
function ServicesTab() {
  const { services, createService, updateService, deleteService } = useTeam();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [icon, setIcon] = useState("📦");

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await createService.mutateAsync({ name, color, icon });
      toast.success("Service créé");
      setDialogOpen(false);
      setName(""); setColor("#3B82F6"); setIcon("📦");
    } catch { toast.error("Erreur"); }
  };

  const toggleActive = async (s: any) => {
    await updateService.mutateAsync({ id: s.id, is_active: !s.is_active });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Services / Départements</CardTitle>
        <Button size="sm" onClick={() => setDialogOpen(true)} className="gap-1"><Plus className="h-4 w-4" /> Ajouter</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {services.map(s => (
            <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg border">
              <span className="text-2xl">{s.icon}</span>
              <div className="h-4 w-4 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
              <span className="flex-1 font-medium">{s.name}</span>
              <Switch checked={s.is_active} onCheckedChange={() => toggleActive(s)} />
              <Button variant="ghost" size="icon" onClick={() => deleteService.mutateAsync(s.id)} className="text-destructive h-8 w-8">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {services.length === 0 && <p className="text-center text-muted-foreground py-8">Aucun service</p>}
        </div>
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouveau service</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nom</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Caisse, Stock..." /></div>
            <div className="flex gap-4">
              <div className="flex-1"><Label>Couleur</Label><Input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-10" /></div>
              <div className="flex-1"><Label>Icône (emoji)</Label><Input value={icon} onChange={e => setIcon(e.target.value)} maxLength={4} className="text-2xl text-center" /></div>
            </div>
          </div>
          <DialogFooter><Button onClick={handleCreate} disabled={!name.trim()}>Créer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ===== TAB 3: Roles =====
function RolesTab() {
  const { roles, services, createRole, updateRole, deleteRole } = useTeam();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRole, setEditRole] = useState<CompanyRole | null>(null);
  const [name, setName] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [perms, setPerms] = useState<Record<string, string[]>>({});

  const openCreate = () => {
    setEditRole(null); setName(""); setServiceId(""); setPerms({});
    setDialogOpen(true);
  };

  const openEdit = (r: CompanyRole) => {
    setEditRole(r);
    setName(r.name);
    setServiceId(r.service_id || "");
    setPerms(typeof r.permissions === 'object' && !Array.isArray(r.permissions) ? r.permissions as Record<string, string[]> : {});
    setDialogOpen(true);
  };

  const togglePerm = (mod: string, action: string) => {
    setPerms(prev => {
      const current = prev[mod] || [];
      const next = current.includes(action) ? current.filter(a => a !== action) : [...current, action];
      return { ...prev, [mod]: next };
    });
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      if (editRole) {
        await updateRole.mutateAsync({ id: editRole.id, name: editRole.is_system ? editRole.name : name, service_id: serviceId || null, permissions: perms });
      } else {
        await createRole.mutateAsync({ name, service_id: serviceId || undefined, permissions: perms });
      }
      toast.success(editRole ? "Rôle mis à jour" : "Rôle créé");
      setDialogOpen(false);
    } catch { toast.error("Erreur"); }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Rôles</CardTitle>
        <Button size="sm" onClick={openCreate} className="gap-1"><Plus className="h-4 w-4" /> Ajouter</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {roles.map(r => (
            <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50" onClick={() => openEdit(r)}>
              <Shield className="h-5 w-5 text-primary" />
              <span className="flex-1 font-medium">{r.name}</span>
              {r.is_system && <Badge variant="secondary">Système</Badge>}
              {!r.is_system && (
                <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); deleteRole.mutateAsync(r.id); }} className="text-destructive h-8 w-8">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editRole ? `Modifier: ${editRole.name}` : "Nouveau rôle"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nom du rôle</Label>
              <Input value={name} onChange={e => setName(e.target.value)} disabled={editRole?.is_system} placeholder="Ex: Manager..." />
            </div>
            <div>
              <Label>Service associé</Label>
              <Select value={serviceId} onValueChange={setServiceId}>
                <SelectTrigger><SelectValue placeholder="Aucun" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  {services.map(s => <SelectItem key={s.id} value={s.id}>{s.icon} {s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block">Permissions par module</Label>
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-5 gap-0 bg-muted p-2 text-xs font-medium">
                  <span>Module</span>
                  {PERMISSION_ACTIONS.map(a => <span key={a} className="text-center capitalize">{a === 'read' ? 'Voir' : a === 'create' ? 'Créer' : a === 'update' ? 'Modifier' : 'Suppr.'}</span>)}
                </div>
                {PERMISSION_MODULES.map(mod => (
                  <div key={mod.key} className="grid grid-cols-5 gap-0 p-2 border-t items-center">
                    <span className="text-sm">{mod.label}</span>
                    {PERMISSION_ACTIONS.map(action => (
                      <div key={action} className="flex justify-center">
                        <Checkbox
                          checked={(perms[mod.key] || []).includes(action)}
                          onCheckedChange={() => togglePerm(mod.key, action)}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter><Button onClick={handleSave} disabled={!name.trim()}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ===== TAB 4: Members =====
function MembersTab() {
  const { members, roles, services, createMember, updateMember, deleteMember } = useTeam();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMember, setEditMember] = useState<CompanyMember | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [roleId, setRoleId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [revealedPins, setRevealedPins] = useState<Record<string, boolean>>({});

  const openCreate = () => {
    setEditMember(null); setFirstName(""); setLastName(""); setRoleId(""); setServiceId(""); setPinCode("");
    setDialogOpen(true);
  };

  const openEdit = (m: CompanyMember) => {
    setEditMember(m);
    setFirstName(m.first_name);
    setLastName(m.last_name || "");
    setRoleId(m.role_id || "");
    setServiceId(m.service_id || "");
    setPinCode(m.pin_code);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!firstName.trim()) return;
    try {
      if (editMember) {
        await updateMember.mutateAsync({
          id: editMember.id,
          first_name: firstName,
          last_name: lastName || null,
          role_id: roleId || null,
          service_id: serviceId || null,
          pin_code: pinCode || editMember.pin_code,
        });
        toast.success("Membre mis à jour");
      } else {
        await createMember.mutateAsync({ first_name: firstName, last_name: lastName, role_id: roleId, service_id: serviceId });
        toast.success("Membre créé avec un code PIN");
      }
      setDialogOpen(false);
    } catch { toast.error("Erreur"); }
  };

  const toggleReveal = (id: string) => setRevealedPins(prev => ({ ...prev, [id]: !prev[id] }));
  const copyPin = (pin: string) => { navigator.clipboard.writeText(pin); toast.success("PIN copié !"); };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Membres</CardTitle>
        <Button size="sm" onClick={openCreate} className="gap-1"><Plus className="h-4 w-4" /> Ajouter</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.map(m => (
            <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg border">
              <Avatar className="h-10 w-10">
                <AvatarImage src={m.photo_url || ''} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {m.first_name[0]}{(m.last_name || '')[0] || ''}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{m.first_name} {m.last_name || ''}</p>
                <div className="flex gap-2 flex-wrap">
                  {m.role && <Badge variant="secondary" className="text-xs">{m.role.name}</Badge>}
                  {m.service && <Badge variant="outline" className="text-xs">{m.service.icon} {m.service.name}</Badge>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-mono text-sm">{revealedPins[m.id] ? m.pin_code : '••••••'}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleReveal(m.id)}>
                  {revealedPins[m.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyPin(m.pin_code)}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Switch checked={m.is_active} onCheckedChange={() => updateMember.mutateAsync({ id: m.id, is_active: !m.is_active })} />
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(m)}>
                <Shield className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {members.length === 0 && <p className="text-center text-muted-foreground py-8">Aucun membre. Ajoutez votre premier employé.</p>}
        </div>
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editMember ? "Modifier le membre" : "Nouveau membre"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Prénom *</Label><Input value={firstName} onChange={e => setFirstName(e.target.value)} /></div>
              <div><Label>Nom</Label><Input value={lastName} onChange={e => setLastName(e.target.value)} /></div>
            </div>
            <div>
              <Label>Rôle</Label>
              <Select value={roleId} onValueChange={setRoleId}>
                <SelectTrigger><SelectValue placeholder="Choisir un rôle" /></SelectTrigger>
                <SelectContent>
                  {roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Service</Label>
              <Select value={serviceId} onValueChange={setServiceId}>
                <SelectTrigger><SelectValue placeholder="Choisir un service" /></SelectTrigger>
                <SelectContent>
                  {services.map(s => <SelectItem key={s.id} value={s.id}>{s.icon} {s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {editMember && (
              <div>
                <Label>Code PIN (6 chiffres)</Label>
                <Input value={pinCode} onChange={e => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} className="font-mono text-lg tracking-widest" />
              </div>
            )}
          </div>
          <DialogFooter><Button onClick={handleSave} disabled={!firstName.trim()}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
