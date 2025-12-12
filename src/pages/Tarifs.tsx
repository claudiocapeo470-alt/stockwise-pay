import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Check, ChevronLeft, Star } from "lucide-react";

export default function Tarifs() {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Starter",
      price: "Gratuit",
      period: "",
      description: "Parfait pour démarrer votre activité",
      features: [
        "Jusqu'à 50 produits",
        "Gestion de stock basique",
        "Caisse simple",
        "5 factures/mois",
        "1 utilisateur",
        "Support email"
      ],
      cta: "Commencer",
      popular: false
    },
    {
      name: "Business",
      price: "25.000",
      period: "/ mois",
      description: "Pour les PME en croissance",
      features: [
        "Produits illimités",
        "Gestion de stock avancée",
        "Caisse POS complète",
        "Factures illimitées",
        "Jusqu'à 5 utilisateurs",
        "Analytics basiques",
        "Support prioritaire",
        "Import/Export Excel"
      ],
      cta: "Essayer 14 jours",
      popular: true
    },
    {
      name: "PRO",
      price: "50.000",
      period: "/ mois",
      description: "Solution complète pour grandes structures",
      features: [
        "Tout du plan Business",
        "Utilisateurs illimités",
        "Analytics avancés",
        "Prévisions IA",
        "Multi-magasins",
        "API accès complet",
        "Support 24/7",
        "Formation personnalisée",
        "Personnalisation"
      ],
      cta: "Contacter",
      popular: false
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
              Connexion
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-12 px-4 sm:px-6">
        <div className="container mx-auto text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold">
            Tarifs <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Transparents</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choisissez le plan qui correspond à vos besoins. Changez à tout moment.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`p-8 relative ${plan.popular ? 'border-2 border-primary shadow-2xl scale-105' : 'border-2'}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent">
                    <Star className="h-3 w-3 mr-1" />
                    Plus Populaire
                  </Badge>
                )}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="text-4xl font-bold">
                      {plan.price}
                      {plan.period && <span className="text-base text-muted-foreground ml-1">XOF</span>}
                    </div>
                    {plan.period && <div className="text-sm text-muted-foreground">{plan.period}</div>}
                  </div>
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-gradient-to-r from-primary to-accent' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => navigate('/auth')}
                  >
                    {plan.cta}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 bg-card/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">Questions Fréquentes</h2>
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Puis-je changer de plan à tout moment ?</h3>
              <p className="text-muted-foreground">Oui, vous pouvez upgrader ou downgrader votre plan à tout moment depuis vos paramètres.</p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Y a-t-il des frais cachés ?</h3>
              <p className="text-muted-foreground">Non, tous nos tarifs sont transparents. Vous ne payez que ce qui est affiché.</p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Quelle méthode de paiement acceptez-vous ?</h3>
              <p className="text-muted-foreground">Mobile Money, cartes bancaires et virements bancaires en XOF.</p>
            </Card>
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
