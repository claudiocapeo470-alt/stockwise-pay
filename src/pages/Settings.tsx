import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Palette, Shield, Database, Globe, Bell, Smartphone, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { CompanySettings } from "@/components/settings/CompanySettings";

export default function Settings() {
  const { user, profile, isAdmin, isEmployee } = useAuth();
  const navigate = useNavigate();

  const displayName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : user?.email?.split('@')[0] || 'Utilisateur';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Paramètres</h1>
        <p className="text-muted-foreground">
          Configuration et préférences de votre application Stocknix
        </p>
      </div>

      {/* Team Management Link - Admin only */}
      {!isEmployee && (
        <Card className="border-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigate('/app/team')}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Mon équipe</h3>
              <p className="text-sm text-muted-foreground">Gérer les services, rôles, membres et le code entreprise</p>
            </div>
            <Button variant="outline" size="sm">Accéder</Button>
          </CardContent>
        </Card>
      )}

      {/* Company Settings */}
      <CompanySettings />

      {/* Application Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Informations de l'application
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Version et statut</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Version de l'application</span>
                  <Badge variant="outline">v1.0.0</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Statut du service</span>
                  <Badge variant="secondary" className="bg-success text-success-foreground">
                    Opérationnel
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Base de données</span>
                  <Badge variant="secondary" className="bg-success text-success-foreground">
                    Connectée
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Utilisateur connecté</span>
                  <Badge variant="outline">{displayName}</Badge>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Rôle et permissions</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rôle</span>
                  <Badge variant={isAdmin ? "default" : "secondary"}>
                    <Shield className="mr-1 h-3 w-3" />
                    {isAdmin ? "Administrateur" : "Utilisateur"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Gestion des produits</span>
                  <Badge variant="secondary" className="bg-success text-success-foreground">
                    Autorisée
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Gestion des ventes</span>
                  <Badge variant="secondary" className="bg-success text-success-foreground">
                    Autorisée
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Gestion des paiements</span>
                  <Badge variant="secondary" className="bg-success text-success-foreground">
                    Autorisée
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rapports et analyses</span>
                  <Badge variant="secondary" className="bg-success text-success-foreground">
                    Autorisée
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interface Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Interface et affichage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Thème</h4>
                <p className="text-sm text-muted-foreground">Apparence de l'interface utilisateur</p>
              </div>
              <Badge variant="outline">Système</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Langue</h4>
                <p className="text-sm text-muted-foreground">Langue de l'interface</p>
              </div>
              <Badge variant="outline">Français</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Format de devise</h4>
                <p className="text-sm text-muted-foreground">Affichage des montants</p>
              </div>
              <Badge variant="outline">CFA (FCFA)</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Format de date</h4>
                <p className="text-sm text-muted-foreground">Affichage des dates</p>
              </div>
              <Badge variant="outline">DD/MM/YYYY</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data and Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Données et sécurité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Sauvegarde automatique</h4>
                <p className="text-sm text-muted-foreground">Sauvegarde en temps réel de vos données</p>
              </div>
              <Badge variant="secondary" className="bg-success text-success-foreground">
                Activée
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Chiffrement des données</h4>
                <p className="text-sm text-muted-foreground">Protection de vos informations sensibles</p>
              </div>
              <Badge variant="secondary" className="bg-success text-success-foreground">
                SSL/TLS
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Authentification</h4>
                <p className="text-sm text-muted-foreground">Méthode de connexion sécurisée</p>
              </div>
              <Badge variant="outline">Email + Mot de passe</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Sessions actives</h4>
                <p className="text-sm text-muted-foreground">Nombre de connexions en cours</p>
              </div>
              <Badge variant="outline">1 session</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Informations système
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Performance</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Temps de réponse</span>
                   <Badge variant="secondary" className="bg-success text-success-foreground">
                     &lt; 100ms
                   </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Disponibilité</span>
                  <Badge variant="secondary" className="bg-success text-success-foreground">
                    99.9%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Dernière maintenance</span>
                  <Badge variant="outline">24/12/2024</Badge>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Support</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Documentation</span>
                  <Badge variant="outline">Disponible</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Support technique</span>
                  <Badge variant="outline">24h/7j</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Mises à jour</span>
                  <Badge variant="secondary" className="bg-success text-success-foreground">
                    Automatiques
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Information */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Stocknix</strong> - Solution complète de gestion commerciale
            </p>
            <p>
              Développé avec passion pour les entreprises africaines
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Badge variant="outline" className="text-xs">
                <Smartphone className="mr-1 h-3 w-3" />
                Version Web
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Shield className="mr-1 h-3 w-3" />
                Sécurisé
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Database className="mr-1 h-3 w-3" />
                Cloud
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}