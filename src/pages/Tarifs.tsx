import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, ChevronLeft, Star, Rocket, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const plans = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 9900,
    description: "Parfait pour les petits commerçants solo",
    color: "from-emerald-500 to-emerald-600",
    features: [
      "Jusqu'à 200 produits en stock",
      "Gestion de stock complète",
      "Caisse POS simple",
      "Suivi des ventes",
      "20 factures/mois + 10 devis/mois",
      "1 boutique en ligne (.stocknix.app)",
      "2 membres d'équipe",
      "Rapports basiques",
      "Support email",
    ],
    popular: false,
  },
  {
    id: "business",
    name: "Business",
    monthlyPrice: 24900,
    description: "Pour les PME en croissance",
    color: "from-primary to-blue-600",
    features: [
      "Produits illimités",
      "Gestion de stock avancée",
      "Caisse POS complète",
      "Suivi des ventes avancé",
      "Factures & Devis illimités",
      "1 boutique complète (thèmes + perso)",
      "Jusqu'à 10 membres d'équipe",
      "Performance & Rapports complets",
      "Export PDF/Excel",
      "Support prioritaire (email + WhatsApp)",
      "Notifications de stock",
    ],
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 49900,
    description: "Pour les grandes structures et franchises",
    color: "from-purple-600 to-purple-700",
    features: [
      "Tout du plan Business",
      "Membres d'équipe illimités",
      "Multi-magasins (jusqu'à 3 boutiques)",
      "Analytics avancés + Prévisions",
      "API accès complet",
      "Personnalisation avancée",
      "Gestionnaire de compte dédié",
      "Support 24h/7j",
      "Formation personnalisée (1h/mois)",
      "SLA 99,9% uptime",
    ],
    popular: false,
  },
];

export default function Tarifs() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const isExpired = searchParams.get("expired") === "true";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <nav className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ChevronLeft className="h-5 w-5 mr-2" /> Retour
            </Button>
            <Button onClick={() => navigate(user ? "/app" : "/auth")}>
              {user ? "Mon dashboard" : "Connexion"}
            </Button>
          </div>
        </nav>
      </header>

      {/* Expired banner */}
      {isExpired && (
        <div className="fixed top-[65px] left-0 right-0 z-40 bg-destructive/10 border-b border-destructive/20 px-4 py-3">
          <div className="container mx-auto flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">
              ⏰ Votre période d'essai est terminée. Choisissez un plan pour continuer à utiliser Stocknix.
            </p>
          </div>
        </div>
      )}

      {/* Launch banner */}
      <section className={`${isExpired ? "pt-40" : "pt-32"} pb-4 px-4 sm:px-6`}>
        <div className="container mx-auto">
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Rocket className="h-5 w-5 text-emerald-500" />
              <Badge className="bg-emerald-500 text-white text-sm px-3 py-1">GRATUIT PENDANT LE LANCEMENT</Badge>
              <Rocket className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="text-foreground font-medium">
              Stocknix est gratuit pendant sa période de lancement.
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Profitez de toutes les fonctionnalités Premium sans frais, sans carte bancaire.
            </p>
          </div>
        </div>
      </section>

      {/* Hero */}
      <section className="pb-8 px-4 sm:px-6">
        <div className="container mx-auto text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold">
            Nos futurs{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Tarifs
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Toutes les fonctionnalités incluses gratuitement pendant le lancement. Voici les prix qui s'appliqueront ensuite.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-8 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-start">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`p-6 sm:p-8 relative ${
                  plan.popular
                    ? "border-2 border-primary shadow-2xl md:scale-105"
                    : "border-2 border-border"
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-primary-foreground">
                    <Star className="h-3 w-3 mr-1" /> Plus Populaire
                  </Badge>
                )}

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl text-muted-foreground line-through">
                        {plan.monthlyPrice.toLocaleString()} XOF
                      </span>
                      <Badge className="bg-emerald-500 text-white">GRATUIT</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Pendant la période de lancement
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className={`w-full ${plan.popular ? "bg-gradient-to-r from-primary to-accent" : ""}`}
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                    onClick={() => navigate(user ? "/app" : "/auth")}
                  >
                    {user ? "Accéder au dashboard" : "Commencer gratuitement"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bientôt disponible */}
      <section className="py-12 px-4 sm:px-6 bg-card/30">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold mb-3">🔜 Bientôt disponible</h2>
          <p className="text-muted-foreground mb-6">
            Les plans payants seront activés prochainement. Inscrivez-vous maintenant pour être notifié.
          </p>
          <Button variant="outline" size="lg" onClick={() => navigate("/auth")}>
            Être notifié du lancement payant
          </Button>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-10">Questions Fréquentes</h2>
          <div className="space-y-4">
            {[
              {
                q: "C'est vraiment gratuit ?",
                a: "Oui ! Pendant le lancement, toutes les fonctionnalités sont gratuites. Aucune carte bancaire requise.",
              },
              {
                q: "Que se passe-t-il quand le lancement se termine ?",
                a: "Vous serez notifié avant la fin de la période gratuite. Vous pourrez alors choisir un plan adapté à vos besoins.",
              },
              {
                q: "Quels moyens de paiement accepterez-vous ?",
                a: "Mobile Money (MTN, Orange, Wave, Moov) et cartes bancaires via notre partenaire Moneroo.",
              },
            ].map((faq, i) => (
              <Card key={i} className="p-6">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-muted-foreground text-sm">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-border">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2025 Stocknix par DESCHNIX. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
