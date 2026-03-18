import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Calendar, Shield, Key, Eye, EyeOff, Edit2, Save, X } from "lucide-react";
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
  
  // Profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    company_name: "",
    avatar_url: ""
  });

  // Initialize profile data
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
    if (newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Mot de passe modifié avec succès");
      setIsChangingPassword(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error("Erreur lors de la modification du mot de passe");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.first_name.trim()) {
      toast.error("Le prénom est obligatoire");
      return;
    }
    if (!isEmployee && !profileData.company_name.trim()) {
      toast.error("Le nom de l'entreprise est obligatoire");
      return;
    }
    setIsUpdatingProfile(true);
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.first_name.trim(),
          last_name: profileData.last_name.trim(),
          company_name: profileData.company_name.trim(),
          avatar_url: profileData.avatar_url
        })
        .eq('user_id', user?.id);
      if (profileError) throw profileError;
      if (profileData.email !== user?.email) {
        const { error: authError } = await supabase.auth.updateUser({ email: profileData.email });
        if (authError) throw authError;
      }
      toast.success("Profil mis à jour avec succès");
      setIsEditingProfile(false);
      await refreshProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleImageUpload = (url: string) => {
    setProfileData(prev => ({ ...prev, avatar_url: url }));
  };

  const cancelProfileEdit = () => {
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

  // ─── Employee Profile View ───
  if (isEmployee && memberInfo) {
    const empInitials = `${(memberInfo.member_first_name || 'E')[0]}${(memberInfo.member_last_name || '')[0] || ''}`.toUpperCase();

    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mon Profil</h1>
          <p className="text-muted-foreground">Vos informations personnelles</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mb-4 overflow-hidden">
                {memberInfo.member_photo_url ? (
                  <img src={memberInfo.member_photo_url} alt="Photo" className="w-full h-full object-cover" />
                ) : (
                  empInitials
                )}
              </div>
              <CardTitle className="text-xl">
                {memberInfo.member_first_name} {memberInfo.member_last_name || ''}
              </CardTitle>
              <Badge variant="secondary" className="mt-2 w-fit mx-auto">
                {memberInfo.member_role_name}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">{memberInfo.company_name}</p>
            </CardHeader>
          </Card>

          {/* Info Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Prénom</Label>
                  <Input value={memberInfo.member_first_name} disabled className="bg-muted" />
                </div>
                <div>
                  <Label>Nom</Label>
                  <Input value={memberInfo.member_last_name || '-'} disabled className="bg-muted" />
                </div>
              </div>
              <div>
                <Label>Rôle</Label>
                <Input value={memberInfo.member_role_name} disabled className="bg-muted" />
              </div>
              <div>
                <Label>Entreprise</Label>
                <Input value={memberInfo.company_name} disabled className="bg-muted" />
              </div>

              <Separator />

              <p className="text-sm text-muted-foreground">
                Pour modifier vos informations, contactez votre responsable.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ─── Owner/Admin Profile View ───
  const displayName = profile?.company_name || 
    (profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : user?.email?.split('@')[0] || 'Utilisateur');

  const initials = profile?.company_name 
    ? profile.company_name.substring(0, 2).toUpperCase()
    : (profile?.first_name && profile?.last_name
        ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
        : (user?.email?.[0] || 'U').toUpperCase());

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mon Profil</h1>
        <p className="text-muted-foreground">
          Consultez vos informations personnelles et paramètres de compte
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mb-4 overflow-hidden">
              {profileData.avatar_url ? (
                <img src={profileData.avatar_url} alt="Photo de profil" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <CardTitle className="text-xl">{displayName}</CardTitle>
            <div className="flex items-center justify-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{user?.email}</span>
            </div>
            {isAdmin && (
              <Badge variant="secondary" className="mt-2 w-fit mx-auto">
                <Shield className="mr-1 h-3 w-3" />
                Administrateur
              </Badge>
            )}
          </CardHeader>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations du compte
              </div>
              {!isEditingProfile && (
                <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Informations personnelles</h3>
                {isEditingProfile && (
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={cancelProfileEdit} disabled={isUpdatingProfile}>
                      <X className="h-4 w-4 mr-1" /> Annuler
                    </Button>
                    <Button type="submit" size="sm" disabled={isUpdatingProfile}>
                      <Save className="h-4 w-4 mr-1" />
                      {isUpdatingProfile ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="companyName">Nom de l'entreprise *</Label>
                <Input
                  id="companyName"
                  value={profileData.company_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, company_name: e.target.value }))}
                  disabled={!isEditingProfile || isUpdatingProfile}
                  className={!isEditingProfile ? "bg-muted" : ""}
                  placeholder="Nom de votre entreprise"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    value={profileData.first_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                    disabled={!isEditingProfile || isUpdatingProfile}
                    className={!isEditingProfile ? "bg-muted" : ""}
                    placeholder="Votre prénom"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={profileData.last_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                    disabled={!isEditingProfile || isUpdatingProfile}
                    className={!isEditingProfile ? "bg-muted" : ""}
                    placeholder="Votre nom de famille"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!isEditingProfile || isUpdatingProfile}
                  className={!isEditingProfile ? "bg-muted" : ""}
                  placeholder="votre@email.com"
                />
              </div>

              {isEditingProfile && (
                <ImageUpload
                  currentImageUrl={profileData.avatar_url}
                  onImageUpload={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              )}
            </form>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Détails du compte</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Date de création</Label>
                  <Input
                    value={user?.created_at ? format(new Date(user.created_at), "dd MMMM yyyy", { locale: fr }) : "Non disponible"}
                    disabled className="bg-muted"
                  />
                </div>
                <div>
                  <Label>Dernière connexion</Label>
                  <Input
                    value={user?.last_sign_in_at ? format(new Date(user.last_sign_in_at), "dd MMMM yyyy 'à' HH:mm", { locale: fr }) : "Non disponible"}
                    disabled className="bg-muted"
                  />
                </div>
              </div>
              <div>
                <Label>Statut du compte</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="bg-success text-success-foreground">Actif</Badge>
                  <span className="text-sm text-muted-foreground">
                    Email vérifié le {user?.email_confirmed_at ? format(new Date(user.email_confirmed_at), "dd/MM/yyyy", { locale: fr }) : "Non vérifié"}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Key className="h-4 w-4" /> Sécurité
                </h3>
                {!isChangingPassword && !isEditingProfile && (
                  <Button variant="outline" size="sm" onClick={() => setIsChangingPassword(true)}>
                    Modifier le mot de passe
                  </Button>
                )}
              </div>

              {isChangingPassword ? (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 6 caractères"
                        required
                      />
                      <Button
                        type="button" variant="ghost" size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmer le nouveau mot de passe"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => { setIsChangingPassword(false); setNewPassword(""); setConfirmPassword(""); }} disabled={isUpdatingPassword}>
                      Annuler
                    </Button>
                    <Button type="submit" disabled={isUpdatingPassword}>
                      {isUpdatingPassword ? "Modification..." : "Modifier"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div>
                  <Label>Mot de passe</Label>
                  <Input value="••••••••••••" disabled className="bg-muted" />
                  <p className="text-sm text-muted-foreground mt-1">Votre mot de passe est sécurisé et chiffré</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}