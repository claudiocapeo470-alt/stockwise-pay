import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, Package, ShoppingCart, FileText, DollarSign, 
  BarChart3, Bell, Download, Upload, Barcode, Smartphone,
  TrendingUp, Users, CheckCircle2, AlertTriangle,
  Store, ShoppingBag, ClipboardList, Star, Truck, Link2
} from "lucide-react";

export default function Fonctionnalites() {
  const navigate = useNavigate();

  const features = [
    {
      category: "Gestion de Stock",
      icon: <Package className="h-10 w-10" />,
      items: [
        { icon: <CheckCircle2 />, text: "Suivi en temps réel de tous vos produits" },
        { icon: <AlertTriangle />, text: "Alertes automatiques de stock bas et ruptures" },
        { icon: <Barcode />, text: "Scanner code-barres intégré" },
        { icon: <Upload />, text: "Import Excel, CSV, PDF" },
        { icon: <Download />, text: "Export complet de vos données" },
        { icon: <TrendingUp />, text: "Historique des mouvements de stock" }
      ]
    },
    {
      category: "Caisse & POS",
      icon: <ShoppingCart className="h-10 w-10" />,
      items: [
        { icon: <CheckCircle2 />, text: "Interface rapide et tactile" },
        { icon: <Barcode />, text: "Scanner produits instantané" },
        { icon: <Users />, text: "Gestion des remises et promotions" },
        { icon: <Smartphone />, text: "Paiements Mobile Money intégrés" },
        { icon: <FileText />, text: "Impression tickets de caisse" },
        { icon: <DollarSign />, text: "Multi-méthodes de paiement" }
      ]
    },
    {
      category: "Facturation & Devis",
      icon: <FileText className="h-10 w-10" />,
      items: [
        { icon: <CheckCircle2 />, text: "Création de factures professionnelles" },
        { icon: <CheckCircle2 />, text: "Génération de devis personnalisés" },
        { icon: <Download />, text: "Export PDF automatique" },
        { icon: <Users />, text: "Gestion clients complète" },
        { icon: <FileText />, text: "Templates personnalisables" },
        { icon: <TrendingUp />, text: "Suivi des paiements" }
      ]
    },
    {
      category: "Paiements",
      icon: <DollarSign className="h-10 w-10" />,
      items: [
        { icon: <CheckCircle2 />, text: "Historique complet des transactions" },
        { icon: <Smartphone />, text: "Mobile Money (Orange, MTN, Moov)" },
        { icon: <DollarSign />, text: "Espèces et cartes bancaires" },
        { icon: <TrendingUp />, text: "Suivi des échéances" },
        { icon: <AlertTriangle />, text: "Alertes de paiements en retard" },
        { icon: <FileText />, text: "Rapprochement bancaire" }
      ]
    },
    {
      category: "Rapports & Analytics",
      icon: <BarChart3 className="h-10 w-10" />,
      items: [
        { icon: <BarChart3 />, text: "Tableaux de bord interactifs" },
        { icon: <TrendingUp />, text: "Graphiques de performance" },
        { icon: <CheckCircle2 />, text: "Prévisions intelligentes avec IA" },
        { icon: <Download />, text: "Export rapports personnalisés" },
        { icon: <Users />, text: "Analyse par client et produit" },
        { icon: <DollarSign />, text: "Suivi de rentabilité" }
      ]
    },
    {
      category: "Boutique En Ligne",
      icon: <Store className="h-10 w-10" />,
      items: [
        { icon: <CheckCircle2 />, text: "Boutique en ligne personnalisée avec URL unique" },
        { icon: <ShoppingBag />, text: "Publication de produits avec photos et prix" },
        { icon: <ClipboardList />, text: "Réception et gestion des commandes en ligne" },
        { icon: <Star />, text: "Système d'avis et évaluations clients" },
        { icon: <Truck />, text: "Gestion des frais de livraison et suivi" },
        { icon: <Link2 />, text: "Partage par lien, WhatsApp, réseaux sociaux" }
      ]
    },
    {
      category: "Alertes & Notifications",
      icon: <Bell className="h-10 w-10" />,
      items: [
        { icon: <AlertTriangle />, text: "Stock bas et ruptures" },
        { icon: <CheckCircle2 />, text: "Nouvelles ventes" },
        { icon: <DollarSign />, text: "Paiements reçus" },
        { icon: <TrendingUp />, text: "Objectifs atteints" },
        { icon: <Users />, text: "Activité utilisateurs" },
        { icon: <Bell />, text: "Notifications temps réel" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <nav className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ChevronLeft className="h-5 w-5 mr-2" />
              Retour
            </Button>
            <Button onClick={() => navigate('/auth')}>
              Essayer Gratuitement
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-12 px-4 sm:px-6">
        <div className="container mx-auto text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold">
            Fonctionnalités <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Complètes</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez toutes les fonctionnalités qui feront de Stocknix votre meilleur allié
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 hover:shadow-xl transition-all border-2">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary to-accent text-white">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{feature.category}</h3>
                  </div>
                </div>
                <div className="space-y-3">
                  {feature.items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      {React.cloneElement(item.icon, { className: "h-5 w-5 text-success flex-shrink-0 mt-0.5" })}
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">
            Prêt à découvrir toutes ces fonctionnalités ?
          </h2>
          <Button 
            size="lg"
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white px-12 h-14"
          >
            Commencer Maintenant
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-border">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2026 Stocknix par DESCHNIX. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
