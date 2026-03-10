import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, ChevronLeft, Star, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const { status } = useSubscription();
  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const isExpired = searchParams.get("expired") === "true";

  const getPrice = (monthlyPrice: number) => {
    if (isAnnual) return Math.round(monthlyPrice * 12 * 0.8);
    return monthlyPrice;
  };

  const getMonthlyEquivalent = (monthlyPrice: number) => {
    if (isAnnual) return Math.round(monthlyPrice * 0.8);
    return monthlyPrice;
  };

  const handleChoosePlan = async (planId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setLoadingPlan(planId);
    try {
      const { data, error } = await supabase.functions.invoke("moneroo-init-payment", {
        body: {
          plan: planId,
          billing: isAnnual ? "annual" : "monthly",
          user_id: user.id,
        },
      });

      if (error || !data?.checkout_url) {
        toast.error("Erreur lors de l'initialisation du paiement");
        return;
      }

      window.location.href = data.checkout_url;
    } catch {
      toast.error("Erreur de connexion au service de paiement");
    } finally {
      setLoadingPlan(null);
    }
  };

  const getButtonProps = (planId: string) => {
    if (!user) return { text: "Commencer l'essai gratuit", disabled: false };
    if (status.planName === planId && status.isActive) return { text: "Mon plan actuel", disabled: true };
    if (status.isTrial) return { text: "Choisir ce plan", disabled: false };
    return { text: "Passer à ce plan", disabled: false };
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
              ⏰ Votre période d'essai est terminée. Choisissez un plan pour continuer à utiliser Stocknix.
            </p>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className={`${isExpired ? "pt-40" : "pt-32"} pb-8 px-4 sm:px-6`}>
        <div className="container mx-auto text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold">
            Tarifs{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Transparents
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            15 jours d'essai gratuit sur tous les plans. Sans carte bancaire.
          </p>

          {/* Annual toggle */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <span className={`text-sm font-medium ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
              Mensuel
            </span>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
            <span className={`text-sm font-medium ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
              Annuel
            </span>
            {isAnnual && (
              <Badge variant="secondary" className="bg-success/10 text-success text-xs">
                -20%
              </Badge>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-8 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-start">
            {plans.map((plan) => {
              const btnProps = getButtonProps(plan.id);
              const price = getPrice(plan.monthlyPrice);
              const monthlyEq = getMonthlyEquivalent(plan.monthlyPrice);

              return (
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
                      {isAnnual && (
                        <p className="text-sm text-muted-foreground line-through">
                          {(plan.monthlyPrice * 12).toLocaleString()} XOF/an
                        </p>
                      )}
                      <div className="text-3xl sm:text-4xl font-bold">
                        {price.toLocaleString()}
                        <span className="text-base text-muted-foreground ml-1">XOF</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {isAnnual
                          ? `soit ${monthlyEq.toLocaleString()} XOF/mois`
                          : "par mois"}
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
                      disabled={btnProps.disabled || loadingPlan === plan.id}
                      onClick={() => handleChoosePlan(plan.id)}
                    >
                      {loadingPlan === plan.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {btnProps.text}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 sm:px-6 bg-card/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-10">Questions Fréquentes</h2>
          <div className="space-y-4">
            {[
              {
                q: "Puis-je changer de plan ?",
                a: "Oui, vous pouvez upgrader ou rétrograder votre plan à tout moment depuis vos paramètres d'abonnement.",
              },
              {
                q: "Comment annuler mon abonnement ?",
                a: "Vous pouvez annuler à tout moment. Votre accès reste actif jusqu'à la fin de la période payée.",
              },
              {
                q: "Quels moyens de paiement acceptez-vous ?",
                a: "Mobile Money (MTN, Orange, Wave, Moov) et cartes bancaires via notre partenaire Moneroo. Tous les paiements sont en XOF.",
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
