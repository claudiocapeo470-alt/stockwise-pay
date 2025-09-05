import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Calendar, Shield, Key, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function Profile() {
  const { user, profile, isAdmin } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

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
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

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

  const displayName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : user?.email?.split('@')[0] || 'Utilisateur';

  const initials = profile?.first_name && profile?.last_name
    ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    : (user?.email?.[0] || 'U').toUpperCase();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mon Profil</h1>
        <p className="text-muted-foreground">
          Consultez vos informations personnelles et paramètres de compte
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mb-4">
              {initials}
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

        {/* Account Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations du compte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informations personnelles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={profile?.first_name || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={profile?.last_name || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <Separator />

            {/* Account Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Détails du compte</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Date de création</Label>
                  <Input
                    value={user?.created_at 
                      ? format(new Date(user.created_at), "dd MMMM yyyy", { locale: fr })
                      : "Non disponible"
                    }
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label>Dernière connexion</Label>
                  <Input
                    value={user?.last_sign_in_at 
                      ? format(new Date(user.last_sign_in_at), "dd MMMM yyyy 'à' HH:mm", { locale: fr })
                      : "Non disponible"
                    }
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
              <div>
                <Label>Statut du compte</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="bg-success text-success-foreground">
                    Actif
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Email vérifié le {user?.email_confirmed_at 
                      ? format(new Date(user.email_confirmed_at), "dd/MM/yyyy", { locale: fr })
                      : "Non vérifié"
                    }
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Password Change */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Sécurité
                </h3>
                {!isChangingPassword && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsChangingPassword(true)}
                  >
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
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
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
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                      disabled={isUpdatingPassword}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      disabled={isUpdatingPassword}
                    >
                      {isUpdatingPassword ? "Modification..." : "Modifier"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div>
                  <Label>Mot de passe</Label>
                  <Input
                    value="••••••••••••"
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Votre mot de passe est sécurisé et chiffré
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}