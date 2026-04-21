import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, ChevronLeft, Star, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePaiementPro, type PaiementProPlan } from "@/hooks/usePaiementPro";
import { useSubscriptionPricing } from "@/hooks/useSubscriptionPricing";

const plansBase = [
  {
    id: "starter" as const,
    name: "Starter",
    description: "Parfait pour les petits commerçants solo",
    color: "from-emerald-500 to-emerald-600",
    features: [
      "Jusqu'à 200 produits en stock",
      "Gestion de stock complète",
      "Caisse POS simple",
      "Suivi des ventes",
      "20 factures/mois + 10 devis/mois",
      "1 boutique en ligne",
      "2 membres d'équipe",
      "Rapports basiques",
      "Support email",
    ],
    popular: false,
  },
  {
    id: "business" as const,
    name: "Business",
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
    id: "pro" as const,
    name: "Pro",
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
  const { initPayment, loadingPlan } = usePaiementPro();
  const { prices, isLoading: pricesLoading } = useSubscriptionPricing();
  const isExpired = searchParams.get("expired") === "true";

  const plans = plansBase.map((p) => ({ ...p, monthlyPrice: prices[p.id] }));

  const handleSubscribe = (planId: string, amount: number) => {
    if (!user) {
      navigate("/auth?redirect=/tarifs");
      return;
    }
    initPayment({ plan: planId as PaiementProPlan, amount, billing_cycle: "monthly" });
  };

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
              ⏰ Votre abonnement est terminé. Choisissez un plan pour continuer à utiliser Stocknix.
            </p>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className={`${isExpired ? "pt-40" : "pt-32"} pb-8 px-4 sm:px-6`}>
        <div className="container mx-auto text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold">
            Choisissez votre{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              plan
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Paiement sécurisé via Paiement Pro (Mobile Money & Carte bancaire). Sans engagement, annulez à tout moment.
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
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">
                        {pricesLoading ? "…" : plan.monthlyPrice.toLocaleString("fr-FR").replace(/,/g, " ")}
                      </span>
                      <span className="text-sm text-muted-foreground">XOF / mois</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Facturé mensuellement, sans engagement
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
                    disabled={loadingPlan !== null}
                    onClick={() => handleSubscribe(plan.id, plan.monthlyPrice)}
                  >
                    {loadingPlan === plan.id ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Redirection...</>
                    ) : user ? (
                      "S'abonner maintenant"
                    ) : (
                      "Créer un compte & s'abonner"
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-10">Questions Fréquentes</h2>
          <div className="space-y-4">
            {[
              {
                q: "Quels moyens de paiement sont acceptés ?",
                a: "Mobile Money (MTN, Orange, Wave, Moov) et cartes bancaires Visa / Mastercard via Paiement Pro.",
              },
              {
                q: "Puis-je changer de plan plus tard ?",
                a: "Oui, vous pouvez upgrader ou downgrader à tout moment depuis votre espace abonnement.",
              },
              {
                q: "Que se passe-t-il à la fin de mon abonnement ?",
                a: "Vous recevez une notification 7 jours avant l'expiration. Renouvelez en un clic depuis votre tableau de bord.",
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
