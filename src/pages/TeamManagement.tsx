import { useState, useEffect, useRef } from "react";
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
import { Copy, Eye, EyeOff, Plus, RefreshCw, Users, Building2, MoreVertical, Pencil, Power, Trash2, BarChart3, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const PREDEFINED_ROLES = [
  { name: "Manager", icon: "👔", description: "Accès total sauf paramètres — supervise l'activité, CRM complet", permissions: { all: true, settings: false, subscription: false } },
  { name: "Gestionnaire Stock", icon: "📦", description: "Gère l'inventaire, livraisons, factures, devis et clients", permissions: { stock: true, sales: true, deliveries: true, reports: true, customers: true, performance: true } },
  { name: "Gestionnaire Commandes", icon: "🛒", description: "Traite les commandes boutique, factures, devis et CRM complet", permissions: { boutique: true, boutique_orders: true, sales: true, reports: true, customers: true, performance: true } },
  { name: "Gestionnaire Fusionné", icon: "🔗", description: "Stock + Boutique — inventaire, commandes, factures, devis et CRM", permissions: { stock: true, boutique: true, boutique_orders: true, sales: true, deliveries: true, reports: true, customers: true, performance: true } },
  { name: "Caissier", icon: "🖥️", description: "Point de vente uniquement — création client rapide", permissions: { pos: true, customers_basic: true } },
  { name: "Livreur", icon: "🚚", description: "Gère ses livraisons assignées — infos client minimales", permissions: { deliveries: true, customers_minimal: true } },
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
  const [useCustomPin, setUseCustomPin] = useState(false);
  const [customPin, setCustomPin] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCreate = () => {
    setEditMember(null);
    setFirstName("");
    setLastName("");
    setSelectedRole("");
    setPinCode(generatePin());
    setUseCustomPin(false);
    setCustomPin("");
    setPhotoUrl(null);
    setDialogOpen(true);
  };

  const openEdit = (m: CompanyMember) => {
    setEditMember(m);
    setFirstName(m.first_name);
    setLastName(m.last_name || "");
    setSelectedRole(m.role?.name || "");
    setPinCode("");
    setPhotoUrl(m.photo_url || null);
    setDialogOpen(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo trop volumineuse (max 5MB)");
      return;
    }
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error("Format non supporté (JPG, PNG, WebP uniquement)");
      return;
    }
    setUploadingPhoto(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");
      const ext = file.name.split('.').pop();
      // Path doit commencer par auth.uid() pour respecter la RLS du bucket avatars
      const path = `${user.id}/members/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const cacheBustedUrl = `${data.publicUrl}?t=${Date.now()}`;
      setPhotoUrl(cacheBustedUrl);
      toast.success("Photo téléchargée");
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err?.message || "Erreur lors de l'upload de la photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!firstName.trim() || !selectedRole) return;
    const matchingRole = roles.find(r => r.name === selectedRole);
    
    try {
      if (editMember) {
        const updates: any = {
          id: editMember.id,
          first_name: firstName,
          last_name: lastName || null,
          role_id: matchingRole?.id || null,
          photo_url: photoUrl || null,
        };
        if (pinCode && pinCode.length === 6) {
          updates.pin_code = pinCode;
        }
        await updateMember.mutateAsync(updates);
        toast.success("Membre mis à jour");
      } else {
        const pinToUse = useCustomPin && customPin.length === 6 ? customPin : undefined;
        const result = await createMember.mutateAsync({
          first_name: firstName,
          last_name: lastName,
          role_id: matchingRole?.id || undefined,
          pin_code: pinToUse,
        });
        toast.success(`Membre créé ! PIN : ${(result as any).generatedPin || result.pin_code}`);
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
        {members.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Aucun membre. Ajoutez votre premier employé.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {members.map(m => {
              const roleName = m.role?.name || 'Sans rôle';
              const initials = `${m.first_name[0]}${(m.last_name || '')[0] || ''}`.toUpperCase();

              return (
                <div
                  key={m.id}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Photo en fond ou placeholder dégradé avec initiales */}
                  {m.photo_url ? (
                    <img
                      src={m.photo_url}
                      alt={`${m.first_name} ${m.last_name || ''}`}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/30 via-primary/10 to-muted">
                      <span className="text-4xl sm:text-5xl font-bold text-primary/70">{initials}</span>
                    </div>
                  )}

                  {/* Dégradé sombre en bas pour lisibilité du texte */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

                  {/* Pastille statut */}
                  <span
                    className={`absolute top-2 left-2 h-2.5 w-2.5 rounded-full ring-2 ring-white/90 ${
                      m.is_active ? 'bg-emerald-500' : 'bg-gray-400'
                    }`}
                    title={m.is_active ? 'Actif' : 'Inactif'}
                  />

                  {/* Menu actions en haut-droite */}
                  <div className="absolute top-1.5 right-1.5">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-7 w-7 bg-white/85 hover:bg-white text-gray-700 backdrop-blur-sm"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
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

                  {/* Nom + rôle en bas */}
                  <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                    <p className="text-sm sm:text-base font-semibold leading-tight truncate drop-shadow">
                      {m.first_name} {m.last_name || ''}
                    </p>
                    <p className="text-[11px] sm:text-xs text-white/85 truncate mt-0.5 drop-shadow">
                      {roleName}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editMember ? "Modifier le membre" : "Nouveau membre"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {/* Photo upload */}
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="h-20 w-20 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <AvatarImage src={photoUrl || ''} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">{firstName?.[0]?.toUpperCase() || '?'}{lastName?.[0]?.toUpperCase() || ''}</AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md"
                  disabled={uploadingPhoto}
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </div>
            </div>
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
            {!editMember && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Switch checked={useCustomPin} onCheckedChange={setUseCustomPin} />
                  <Label className="text-sm">Définir le PIN manuellement</Label>
                </div>
                {useCustomPin ? (
                  <div>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="PIN à 6 chiffres"
                      maxLength={6}
                      value={customPin}
                      onChange={e => setCustomPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="font-mono text-lg tracking-widest"
                    />
                    {customPin.length > 0 && customPin.length < 6 && (
                      <p className="text-xs text-destructive mt-1">Le PIN doit avoir 6 chiffres</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Un PIN sera généré automatiquement et affiché après création.</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter><Button onClick={handleSave} disabled={!firstName.trim() || !selectedRole}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset PIN Dialog */}
      <Dialog open={!!showPinDialog} onOpenChange={() => { setShowPinDialog(null); setRevealedPin(false); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Réinitialiser le PIN de {showPinDialog?.first_name}</DialogTitle></DialogHeader>
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              {revealedPin 
                ? "Nouveau PIN généré. Communiquez-le à l'employé, il ne sera plus visible ensuite."
                : "Cliquez pour générer un nouveau PIN pour cet employé."}
            </p>
            {revealedPin && (
              <div className="text-4xl font-mono font-bold tracking-[0.3em] text-primary bg-muted px-4 py-3 rounded-xl">
                {pinCode}
              </div>
            )}
            <div className="flex justify-center gap-3">
              {!revealedPin ? (
                <Button onClick={async () => {
                  if (!showPinDialog) return;
                  const newPin = generatePin();
                  await updateMember.mutateAsync({ id: showPinDialog.id, pin_code: newPin } as any);
                  setPinCode(newPin);
                  setRevealedPin(true);
                  toast.success("Nouveau PIN généré !");
                }} className="gap-2">
                  <RefreshCw className="h-4 w-4" /> Générer un nouveau PIN
                </Button>
              ) : (
                <Button variant="outline" onClick={() => { navigator.clipboard.writeText(pinCode); toast.success("PIN copié !"); }} className="gap-2">
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
