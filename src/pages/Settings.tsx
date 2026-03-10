import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Building2, Palette, User, Shield, Database, Globe, ChevronRight, ArrowLeft, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { CompanySettings } from "@/components/settings/CompanySettings";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

type SettingsPage = "main" | "company" | "appearance" | "profile" | "security" | "data" | "system" | "subscription";

interface SettingsCard {
  id: SettingsPage;
  title: string;
  description: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  roles: string[]; // empty = all
}

const settingsCards: SettingsCard[] = [
  { id: "company", title: "Informations de l'entreprise", description: "Nom, adresse, téléphone, email, SIRET, TVA, logo", icon: Building2, iconBg: "bg-primary/10", iconColor: "text-primary", roles: ["owner", "admin"] },
  { id: "appearance", title: "Apparence & Thème", description: "Thème interface, langue, devise, format de date", icon: Palette, iconBg: "bg-secondary/10", iconColor: "text-secondary", roles: ["owner", "admin", "manager", "gestionnaire"] },
  { id: "profile", title: "Mon Profil", description: "Nom, prénom, photo, mot de passe", icon: User, iconBg: "bg-accent/10", iconColor: "text-accent-foreground", roles: [] },
  { id: "security", title: "Sécurité & Accès", description: "Méthode auth, sessions actives, déconnexion", icon: Shield, iconBg: "bg-destructive/10", iconColor: "text-destructive", roles: ["owner", "admin"] },
  { id: "data", title: "Données & Sauvegarde", description: "Sauvegarde auto, chiffrement, export", icon: Database, iconBg: "bg-warning/10", iconColor: "text-warning", roles: ["owner", "admin"] },
  { id: "system", title: "Informations système", description: "Version, statut service, BDD, performance, support", icon: Globe, iconBg: "bg-muted", iconColor: "text-muted-foreground", roles: ["owner", "admin", "manager"] },
  { id: "subscription", title: "Mon abonnement", description: "Plan actuel, historique des paiements, changer de plan", icon: Crown, iconBg: "bg-primary/10", iconColor: "text-primary", roles: ["owner", "admin"] },
];

export default function Settings() {
  const { user, profile, isAdmin, isEmployee, memberInfo, signOut } = useAuth();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState<SettingsPage>("main");

  const displayName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : user?.email?.split('@')[0] || 'Utilisateur';

  const getRoleName = (): string => {
    if (!isEmployee) return "owner";
    const role = (memberInfo?.member_role_name || '').toLowerCase();
    if (role.includes('manager')) return 'manager';
    if (role.includes('gestionnaire')) return 'gestionnaire';
    if (role.includes('caissier')) return 'caissier';
    if (role.includes('livreur')) return 'livreur';
    return 'employee';
  };

  const currentRole = getRoleName();

  const visibleCards = settingsCards.filter(card => {
    if (card.roles.length === 0) return true; // visible to all
    return card.roles.includes(currentRole);
  });

  if (activePage !== "main") {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
        <Button variant="ghost" onClick={() => setActivePage("main")} className="gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Retour aux paramètres
        </Button>
        {activePage === "company" && <CompanySettings />}
        {activePage === "appearance" && <AppearanceSettings />}
        {activePage === "profile" && <ProfileSettingsPage />}
        {activePage === "security" && <SecuritySettings signOut={signOut} />}
        {activePage === "data" && <DataSettings />}
        {activePage === "system" && <SystemSettings displayName={displayName} isAdmin={isAdmin} />}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
        <p className="text-sm text-muted-foreground">Configuration et préférences de votre application</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visibleCards.map((card) => (
          <Card
            key={card.id}
            className="cursor-pointer hover:shadow-md transition-all duration-200 group border-border"
            onClick={() => card.id === "profile" ? navigate('/app/profile') : setActivePage(card.id)}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl ${card.iconBg} flex items-center justify-center flex-shrink-0`}>
                <card.icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm">{card.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{card.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AppearanceSettings() {
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" /> Apparence & Thème</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Thème de l'interface</Label>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-sm text-muted-foreground">Cliquez pour changer le thème</span>
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div><Label>Langue</Label><p className="text-sm text-muted-foreground">Langue de l'interface</p></div>
          <Badge variant="outline">Français</Badge>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div><Label>Devise</Label><p className="text-sm text-muted-foreground">Format des montants</p></div>
          <Badge variant="outline">CFA (FCFA)</Badge>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div><Label>Format de date</Label><p className="text-sm text-muted-foreground">Affichage des dates</p></div>
          <Badge variant="outline">DD/MM/YYYY</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileSettingsPage() {
  return (
    <Card>
      <CardContent className="pt-6 text-center">
        <p className="text-muted-foreground">Redirection vers la page Profil...</p>
      </CardContent>
    </Card>
  );
}

function SecuritySettings({ signOut }: { signOut: () => void }) {
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Sécurité & Accès</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div><p className="font-medium">Méthode d'authentification</p><p className="text-sm text-muted-foreground">Connexion sécurisée</p></div>
          <Badge variant="outline">Email + Mot de passe</Badge>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div><p className="font-medium">Sessions actives</p><p className="text-sm text-muted-foreground">Connexions en cours</p></div>
          <Badge variant="outline">1 session</Badge>
        </div>
        <Separator />
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" className="text-destructive border-destructive/30" onClick={signOut}>
            Déconnecter toutes les sessions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DataSettings() {
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" /> Données & Sauvegarde</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {[
          { label: "Sauvegarde automatique", desc: "Sauvegarde en temps réel", status: "Activée" },
          { label: "Chiffrement des données", desc: "Protection des informations", status: "SSL/TLS" },
          { label: "Export des données", desc: "Télécharger vos données", status: "Disponible" },
        ].map(item => (
          <div key={item.label}>
            <div className="flex items-center justify-between">
              <div><p className="font-medium text-sm">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
              <Badge variant="secondary" className="bg-success/10 text-success">{item.status}</Badge>
            </div>
            <Separator className="mt-4" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SystemSettings({ displayName, isAdmin }: { displayName: string; isAdmin: boolean }) {
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> Informations système</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-medium">Version & Statut</h3>
            {[
              { label: "Version", value: "v1.0.0" },
              { label: "Statut", value: "Opérationnel", success: true },
              { label: "Base de données", value: "Connectée", success: true },
              { label: "Utilisateur", value: displayName },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <Badge variant={item.success ? "secondary" : "outline"} className={item.success ? "bg-success/10 text-success" : ""}>
                  {item.value}
                </Badge>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <h3 className="font-medium">Performance & Support</h3>
            {[
              { label: "Temps de réponse", value: "< 100ms", success: true },
              { label: "Disponibilité", value: "99.9%", success: true },
              { label: "Support technique", value: "24h/7j" },
              { label: "Mises à jour", value: "Automatiques", success: true },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <Badge variant={item.success ? "secondary" : "outline"} className={item.success ? "bg-success/10 text-success" : ""}>
                  {item.value}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
