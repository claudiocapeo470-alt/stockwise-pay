import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Building2, Palette, User, Shield, Globe, ChevronRight, ArrowLeft, Crown, Save, Download, LogOut, Moon, Sun, Monitor, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { CompanySettings } from "@/components/settings/CompanySettings";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { useProducts } from "@/hooks/useProducts";
import { useSales } from "@/hooks/useSales";
import { usePayments } from "@/hooks/usePayments";
import * as XLSX from 'xlsx';

type SettingsPage = "main" | "company" | "appearance" | "profile" | "security-data" | "system" | "subscription";

interface SettingsCard {
  id: SettingsPage;
  title: string;
  description: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  roles: string[];
}

const settingsCards: SettingsCard[] = [
  { id: "company", title: "Informations de l'entreprise", description: "Nom, adresse, téléphone, email, SIRET, TVA, logo", icon: Building2, iconBg: "bg-primary/10", iconColor: "text-primary", roles: ["owner"] },
  { id: "appearance", title: "Apparence & Thème", description: "Thème interface, langue, devise, format de date", icon: Palette, iconBg: "bg-secondary/10", iconColor: "text-secondary", roles: ["owner", "manager", "gestionnaire", "caissier", "livreur", "employee"] },
  { id: "security-data", title: "Sécurité & Données", description: "Mot de passe, sessions, export, sauvegarde", icon: Shield, iconBg: "bg-destructive/10", iconColor: "text-destructive", roles: ["owner"] },
  { id: "system", title: "Informations système", description: "Version, statut service, BDD, performance, support", icon: Globe, iconBg: "bg-muted", iconColor: "text-muted-foreground", roles: ["owner", "manager"] },
  { id: "subscription", title: "Mon abonnement", description: "Plan actuel, historique des paiements, changer de plan", icon: Crown, iconBg: "bg-primary/10", iconColor: "text-primary", roles: ["owner"] },
];

export default function Settings() {
  const { user, profile, isAdmin, isEmployee, memberInfo, signOut } = useAuth();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState<SettingsPage>("main");

  // Guard: employees cannot access company or subscription settings directly
  useEffect(() => {
    if (isEmployee && (activePage === 'company' || activePage === 'subscription' || activePage === 'security-data')) {
      setActivePage('main');
    }
  }, [isEmployee, activePage]);

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
    if (card.roles.length === 0) return true;
    return card.roles.includes(currentRole);
  });

  if (activePage !== "main") {
    const currentCard = settingsCards.find(c => c.id === activePage);
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setActivePage("main")} className="gap-2 text-muted-foreground hover:text-foreground -ml-2">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Button>
          {currentCard && (
            <>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm font-medium">{currentCard.title}</span>
            </>
          )}
        </div>
        {activePage === "company" && <CompanySettings />}
        {activePage === "appearance" && <AppearanceSettings />}
        {activePage === "profile" && <ProfileSettingsPage navigate={navigate} />}
        {activePage === "security-data" && <SecurityDataSettings signOut={signOut} />}
        {activePage === "system" && <SystemSettings displayName={displayName} isAdmin={isAdmin} />}
        {activePage === "subscription" && <SubscriptionSettings navigate={navigate} />}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div>
        <h2 className="text-xl font-bold">Paramètres</h2>
        <p className="text-sm text-muted-foreground">Configuration et préférences</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {visibleCards.map((card) => (
          <Card
            key={card.id}
            className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200 group"
            onClick={() => card.id === "profile" ? navigate('/app/profile') : card.id === "subscription" ? navigate('/app/subscription') : setActivePage(card.id)}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`h-11 w-11 rounded-xl ${card.iconBg} flex items-center justify-center flex-shrink-0`}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm">{card.title}</h3>
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

// ─── Apparence & Thème ───
const ACCENT_COLORS = [
  { name: "Bleu Indigo", value: "#4F46E5" },
  { name: "Violet", value: "#7C3AED" },
  { name: "Vert Émeraude", value: "#059669" },
  { name: "Orange", value: "#EA580C" },
  { name: "Rose", value: "#E11D48" },
  { name: "Cyan", value: "#0891B2" },
];

function hexToHSL(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [currency, setCurrency] = useState(() => localStorage.getItem('stocknix_currency') || localStorage.getItem('app_currency') || 'XOF');
  const [dateFormat, setDateFormat] = useState(() => localStorage.getItem('app_date_format') || 'DD/MM/YYYY');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accent_color') || '#4F46E5');
  const [fontSize, setFontSize] = useState<string>(() => localStorage.getItem('app_font_size') || 'md');
  const [compactMode, setCompactMode] = useState(() => localStorage.getItem('app_compact_mode') === 'true');

  // Apply accent color on mount
  useEffect(() => {
    const saved = localStorage.getItem('accent_color');
    if (saved) {
      document.documentElement.style.setProperty('--primary', hexToHSL(saved));
    }
  }, []);

  const handleAccentChange = (color: string) => {
    setAccentColor(color);
    document.documentElement.style.setProperty('--primary', hexToHSL(color));
  };

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    const sizes: Record<string, string> = { sm: '14px', md: '16px', lg: '18px' };
    document.documentElement.style.fontSize = sizes[size] || '16px';
  };

  const handleSave = () => {
    localStorage.setItem('stocknix_currency', currency);
    localStorage.setItem('app_currency', currency);
    localStorage.setItem('app_date_format', dateFormat);
    localStorage.setItem('accent_color', accentColor);
    localStorage.setItem('app_font_size', fontSize);
    localStorage.setItem('app_compact_mode', compactMode.toString());
    window.dispatchEvent(new Event('currency-changed'));
    // Apply compact mode
    if (compactMode) {
      document.documentElement.classList.add('compact-mode');
    } else {
      document.documentElement.classList.remove('compact-mode');
    }
    toast.success("Préférences d'apparence enregistrées");
  };

  return (
    <Card>
      <CardContent className="p-4 sm:p-6 space-y-6">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Palette className="h-4 w-4 text-muted-foreground" /> Apparence & Thème
        </div>

        <div className="space-y-3">
          <Label>Thème de l'interface</Label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'light', label: 'Clair', icon: Sun },
              { value: 'dark', label: 'Sombre', icon: Moon },
              { value: 'system', label: 'Système', icon: Monitor },
            ].map(t => (
              <Button
                key={t.value}
                variant={theme === t.value ? "default" : "outline"}
                className="flex flex-col items-center gap-2 h-auto py-3"
                onClick={() => setTheme(t.value)}
              >
                <t.icon className="h-4 w-4" />
                <span className="text-xs">{t.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Couleur d'accent</Label>
          <div className="flex flex-wrap gap-2">
            {ACCENT_COLORS.map(c => (
              <button
                key={c.value}
                onClick={() => handleAccentChange(c.value)}
                className={`h-9 w-9 rounded-full border-2 transition-all flex items-center justify-center ${accentColor === c.value ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'}`}
                style={{ background: c.value }}
                title={c.name}
              >
                {accentColor === c.value && <Check className="h-4 w-4 text-white" />}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Devise</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="XOF">CFA (FCFA)</SelectItem>
                <SelectItem value="EUR">Euro (€)</SelectItem>
                <SelectItem value="USD">Dollar ($)</SelectItem>
                <SelectItem value="GBP">Livre (£)</SelectItem>
                <SelectItem value="MAD">Dirham (MAD)</SelectItem>
                <SelectItem value="GHS">Cedi (GHS)</SelectItem>
                <SelectItem value="NGN">Naira (₦)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Format de date</Label>
            <Select value={dateFormat} onValueChange={setDateFormat}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Taille de police</Label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'sm', label: 'Petit' },
              { value: 'md', label: 'Normal' },
              { value: 'lg', label: 'Grand' },
            ].map(s => (
              <Button
                key={s.value}
                variant={fontSize === s.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleFontSizeChange(s.value)}
              >
                {s.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
          <div>
            <p className="text-sm font-medium">Mode compact</p>
            <p className="text-xs text-muted-foreground">Réduit les espaces</p>
          </div>
          <Switch checked={compactMode} onCheckedChange={setCompactMode} />
        </div>

        <Button onClick={handleSave} className="w-full sm:w-auto h-11">
          <Save className="h-4 w-4 mr-2" /> Enregistrer
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Profile redirect ───
function ProfileSettingsPage({ navigate }: { navigate: (path: string) => void }) {
  navigate('/app/profile');
  return null;
}

// ─── Sécurité & Données (combined) ───
function SecurityDataSettings({ signOut }: { signOut: () => void }) {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { products = [] } = useProducts();
  const { sales = [] } = useSales();
  const { payments = [] } = usePayments();
  const [isExporting, setIsExporting] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error("Le mot de passe doit contenir au moins 6 caractères"); return; }
    if (newPassword !== confirmPassword) { toast.error("Les mots de passe ne correspondent pas"); return; }
    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Mot de passe modifié avec succès");
      setIsChangingPassword(false); setNewPassword(""); setConfirmPassword("");
    } catch {
      toast.error("Erreur lors de la modification");
    } finally { setIsUpdating(false); }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const wb = XLSX.utils.book_new();
      if (products.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(products.map(p => ({ Nom: p.name, Catégorie: p.category || '', Prix: p.price, Quantité: p.quantity, SKU: p.sku || '' }))), 'Produits');
      if (sales.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sales.map(s => ({ Date: new Date(s.created_at).toLocaleDateString('fr-FR'), Client: s.customer_name || '', Quantité: s.quantity, Total: s.total_amount }))), 'Ventes');
      if (payments.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(payments.map(p => ({ Date: new Date(p.created_at).toLocaleDateString('fr-FR'), Client: `${p.customer_first_name || ''} ${p.customer_last_name || ''}`.trim(), Montant: p.total_amount, Statut: p.status }))), 'Paiements');
      XLSX.writeFile(wb, `export_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("Export téléchargé");
    } catch { toast.error("Erreur lors de l'export"); }
    finally { setIsExporting(false); }
  };

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Sécurité & Données</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between">
          <div><p className="font-medium text-sm">Authentification</p><p className="text-xs text-muted-foreground">Connexion sécurisée</p></div>
          <Badge variant="outline">Email + Mot de passe</Badge>
        </div>
        <Separator />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div><p className="font-medium text-sm">Mot de passe</p><p className="text-xs text-muted-foreground">Modifier votre mot de passe</p></div>
            {!isChangingPassword && <Button variant="outline" size="sm" onClick={() => setIsChangingPassword(true)}>Modifier</Button>}
          </div>
          {isChangingPassword && (
            <form onSubmit={handlePasswordChange} className="space-y-3 p-4 rounded-lg bg-muted/50">
              <div><Label htmlFor="new_password">Nouveau mot de passe</Label><Input id="new_password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 6 caractères" required /></div>
              <div><Label htmlFor="confirm_password">Confirmer</Label><Input id="confirm_password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required /></div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={isUpdating}>{isUpdating ? "Modification..." : "Confirmer"}</Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => { setIsChangingPassword(false); setNewPassword(""); setConfirmPassword(""); }}>Annuler</Button>
              </div>
            </form>
          )}
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div><p className="font-medium text-sm">Sessions actives</p></div>
          <Badge variant="outline">1 session</Badge>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div><p className="font-medium text-sm">Sauvegarde & Chiffrement</p><p className="text-xs text-muted-foreground">Temps réel · SSL/TLS</p></div>
          <Badge variant="secondary" className="bg-success/10 text-success">Activé</Badge>
        </div>
        <Separator />
        <div className="space-y-3">
          <div><p className="font-medium text-sm">Export des données</p><p className="text-xs text-muted-foreground">{products.length} produits · {sales.length} ventes · {payments.length} paiements</p></div>
          <Button onClick={handleExport} disabled={isExporting} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" /> {isExporting ? "Export..." : "Exporter (Excel)"}
          </Button>
        </div>
        <Separator />
        <Button variant="outline" size="sm" className="text-destructive border-destructive/30" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" /> Déconnecter toutes les sessions
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Informations système ───
function SystemSettings({ displayName, isAdmin }: { displayName: string; isAdmin: boolean }) {
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  
  useEffect(() => {
    supabase.from('profiles').select('id').limit(1).then(({ error }) => {
      setDbStatus(error ? 'error' : 'connected');
    });
  }, []);

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
              { label: "Base de données", value: dbStatus === 'connected' ? "Connectée" : dbStatus === 'error' ? "Erreur" : "Vérification...", success: dbStatus === 'connected' },
              { label: "Utilisateur", value: displayName },
              { label: "Rôle", value: isAdmin ? "Administrateur" : "Propriétaire" },
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
              { label: "Hébergement", value: "Supabase Cloud", success: true },
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

// ─── Mon abonnement (redirect) ───
function SubscriptionSettings({ navigate }: { navigate: (path: string) => void }) {
  navigate('/app/subscription');
  return null;
}
