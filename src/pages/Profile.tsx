import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Shield, Key, Eye, EyeOff, Edit2, Save, X, Calendar, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ImageUpload } from "@/components/profile/ImageUpload";

export default function Profile() {
  const { user, profile, isAdmin, isEmployee, memberInfo, refreshProfile } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ first_name: "", last_name: "", email: "", company_name: "", avatar_url: "" });

  useEffect(() => {
    if (profile && user) {
      setProfileData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: user.email || "",
        company_name: profile.company_name || "",
        avatar_url: profile.avatar_url || ""
      });
    }
  }, [profile, user]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error("Min. 6 caractères");
    if (newPassword !== confirmPassword) return toast.error("Les mots de passe ne correspondent pas");
    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Mot de passe modifié");
      setIsChangingPassword(false); setNewPassword(""); setConfirmPassword("");
    } catch { toast.error("Erreur"); } finally { setIsUpdatingPassword(false); }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.first_name.trim()) return toast.error("Prénom requis");
    if (!isEmployee && !profileData.company_name.trim()) return toast.error("Nom de l'entreprise requis");
    setIsUpdatingProfile(true);
    try {
      const { error } = await supabase.from('profiles').update({
        first_name: profileData.first_name.trim(),
        last_name: profileData.last_name.trim(),
        company_name: profileData.company_name.trim(),
        avatar_url: profileData.avatar_url
      }).eq('user_id', user?.id);
      if (error) throw error;
      if (profileData.email !== user?.email) {
        const { error: ae } = await supabase.auth.updateUser({ email: profileData.email });
        if (ae) throw ae;
      }
      toast.success("Profil mis à jour");
      setIsEditingProfile(false);
      await refreshProfile();
    } catch { toast.error("Erreur"); } finally { setIsUpdatingProfile(false); }
  };

  const cancelEdit = () => {
    setIsEditingProfile(false);
    if (profile && user) {
      setProfileData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: user.email || "",
        company_name: profile.company_name || "",
        avatar_url: profile.avatar_url || ""
      });
    }
  };

  // ─── EMPLOYEE VIEW ───
  if (isEmployee && memberInfo) {
    const initials = `${(memberInfo.member_first_name || 'E')[0]}${(memberInfo.member_last_name || '')[0] || ''}`.toUpperCase();
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground">Mon Profil</h1>
        <Card className="border-border/60">
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={memberInfo.member_photo_url || ''} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl font-bold text-foreground">{memberInfo.member_first_name} {memberInfo.member_last_name || ''}</h2>
                <Badge variant="secondary" className="mt-1">{memberInfo.member_role_name}</Badge>
                <p className="text-sm text-muted-foreground mt-2 flex items-center justify-center sm:justify-start gap-1.5">
                  <Building2 className="h-3.5 w-3.5" /> {memberInfo.company_name}
                </p>
              </div>
            </div>
            <Separator />
            <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
              Pour modifier vos informations, contactez votre responsable.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── OWNER VIEW (simplified) ───
  const displayName = profileData.first_name ? `${profileData.first_name} ${profileData.last_name}`.trim() : (user?.email?.split('@')[0] || 'Utilisateur');
  const initials = profileData.first_name ? `${profileData.first_name[0]}${profileData.last_name?.[0] || ''}`.toUpperCase() : (user?.email?.[0] || 'U').toUpperCase();

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mon Profil</h1>
        <p className="text-sm text-muted-foreground">Gérez vos informations personnelles</p>
      </div>

      {/* Identity Card */}
      <Card className="border-border/60 overflow-hidden">
        <div className="h-20 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20" />
        <CardContent className="p-6 -mt-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
            <Avatar className="h-24 w-24 ring-4 ring-background">
              <AvatarImage src={profileData.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left pb-1">
              <h2 className="text-xl font-bold text-foreground">{profileData.company_name || displayName}</h2>
              <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                <Mail className="h-3.5 w-3.5" /> {user?.email}
              </p>
              {isAdmin && <Badge variant="secondary" className="mt-2"><Shield className="mr-1 h-3 w-3" /> Administrateur</Badge>}
            </div>
            {!isEditingProfile && !isChangingPassword && (
              <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>
                <Edit2 className="h-4 w-4 mr-2" /> Modifier
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card className="border-border/60">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2"><User className="h-4 w-4" /> Informations</h3>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            {isEditingProfile && (
              <ImageUpload currentImageUrl={profileData.avatar_url} onImageUpload={(url) => setProfileData(p => ({ ...p, avatar_url: url }))} disabled={isUpdatingProfile} />
            )}

            <div>
              <Label htmlFor="company">Entreprise</Label>
              <Input id="company" value={profileData.company_name} onChange={e => setProfileData(p => ({ ...p, company_name: e.target.value }))} disabled={!isEditingProfile} className={!isEditingProfile ? "bg-muted" : ""} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="fn">Prénom</Label>
                <Input id="fn" value={profileData.first_name} onChange={e => setProfileData(p => ({ ...p, first_name: e.target.value }))} disabled={!isEditingProfile} className={!isEditingProfile ? "bg-muted" : ""} />
              </div>
              <div>
                <Label htmlFor="ln">Nom</Label>
                <Input id="ln" value={profileData.last_name} onChange={e => setProfileData(p => ({ ...p, last_name: e.target.value }))} disabled={!isEditingProfile} className={!isEditingProfile ? "bg-muted" : ""} />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={profileData.email} onChange={e => setProfileData(p => ({ ...p, email: e.target.value }))} disabled={!isEditingProfile} className={!isEditingProfile ? "bg-muted" : ""} />
            </div>

            {isEditingProfile && (
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={isUpdatingProfile} className="flex-1">
                  <Save className="h-4 w-4 mr-2" /> {isUpdatingProfile ? "Enregistrement..." : "Enregistrer"}
                </Button>
                <Button type="button" variant="outline" onClick={cancelEdit} disabled={isUpdatingProfile}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="border-border/60">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2"><Key className="h-4 w-4" /> Sécurité</h3>
            {!isChangingPassword && (
              <Button variant="outline" size="sm" onClick={() => setIsChangingPassword(true)}>Modifier mot de passe</Button>
            )}
          </div>

          {isChangingPassword ? (
            <form onSubmit={handlePasswordChange} className="space-y-3">
              <div>
                <Label>Nouveau mot de passe</Label>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 6 caractères" required />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label>Confirmer</Label>
                <Input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={isUpdatingPassword} size="sm">{isUpdatingPassword ? "Modification..." : "Confirmer"}</Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => { setIsChangingPassword(false); setNewPassword(""); setConfirmPassword(""); }}>Annuler</Button>
              </div>
            </form>
          ) : (
            <div className="text-sm text-muted-foreground">
              <p>Mot de passe sécurisé · Email vérifié</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="border-border/60">
        <CardContent className="p-6 space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2"><Calendar className="h-4 w-4" /> Compte</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Créé le</p>
              <p className="font-medium text-foreground">{user?.created_at ? format(new Date(user.created_at), "dd MMM yyyy", { locale: fr }) : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dernière connexion</p>
              <p className="font-medium text-foreground">{user?.last_sign_in_at ? format(new Date(user.last_sign_in_at), "dd MMM yyyy", { locale: fr }) : "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
