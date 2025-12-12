import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Check, ChevronLeft, Star, Sparkles, Zap, Shield, ArrowRight, Quote, Crown, Rocket, Building2 } from "lucide-react";
import stocknixLogo from '@/assets/stocknix-logo.png';

export default function Tarifs() {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Starter",
      price: "Gratuit",
      period: "",
      description: "Parfait pour démarrer votre activité",
      icon: Rocket,
      features: [
        "Jusqu'à 50 produits",
        "Gestion de stock basique",
        "Caisse simple",
        "5 factures/mois",
        "1 utilisateur",
        "Support email"
      ],
      cta: "Commencer",
      popular: false,
      gradient: "from-slate-500 to-slate-600"
    },
    {
      name: "Business",
      price: "25.000",
      period: "/ mois",
      description: "Pour les PME en croissance",
      icon: Crown,
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
      popular: true,
      gradient: "from-primary to-accent"
    },
    {
      name: "PRO",
      price: "50.000",
      period: "/ mois",
      description: "Solution complète pour grandes structures",
      icon: Building2,
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
      popular: false,
      gradient: "from-violet-500 to-purple-600"
    }
  ];

  const testimonials = [
    {
      name: "Ibrahim S.",
      role: "Gérant Supermarché",
      location: "Abidjan",
      content: "Le plan Business a transformé notre gestion. ROI positif dès le premier mois !",
      rating: 5,
      avatar: "IS"
    },
    {
      name: "Fatou M.",
      role: "Directrice Boutique",
      location: "Yamoussoukro",
      content: "L'essai gratuit m'a convaincue. Maintenant je ne peux plus m'en passer.",
      rating: 5,
      avatar: "FM"
    },
    {
      name: "Jean-Paul K.",
      role: "CEO PME",
      location: "Bouaké",
      content: "Le plan PRO nous offre tout ce dont nous avons besoin pour 3 magasins.",
      rating: 5,
      avatar: "JK"
    }
  ];

  const faqs = [
    {
      question: "Puis-je changer de plan à tout moment ?",
      answer: "Oui, vous pouvez upgrader ou downgrader votre plan à tout moment depuis vos paramètres. Les changements prennent effet immédiatement."
    },
    {
      question: "Y a-t-il des frais cachés ?",
      answer: "Non, tous nos tarifs sont transparents. Vous ne payez que ce qui est affiché, sans surprises."
    },
    {
      question: "Quelle méthode de paiement acceptez-vous ?",
      answer: "Mobile Money (Orange Money, MTN, Wave), cartes bancaires et virements bancaires en XOF/FCFA."
    },
    {
      question: "L'essai gratuit est-il vraiment gratuit ?",
      answer: "Oui, 100% gratuit. Aucune carte bancaire requise. Vous pouvez tester toutes les fonctionnalités pendant 14 jours."
    }
  ];

  return (
    <div className="min-h-screen bg-[hsl(222,47%,6%)]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[hsl(222,47%,6%)]/90 backdrop-blur-xl border-b border-white/10">
        <nav className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/')} className="text-white hover:bg-white/10">
              <ChevronLeft className="h-5 w-5 mr-2" />
              Retour
            </Button>
            <img src={stocknixLogo} alt="Stocknix" className="h-8" />
            <Button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
              Connexion
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-accent/20 rounded-full blur-[120px]" />
        
        <div className="container mx-auto text-center relative z-10 space-y-6">
          <ScrollReveal>
            <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 mr-2" />
              Tarification Simple
            </Badge>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
              Tarifs <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Transparents</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto">
              Choisissez le plan qui correspond à vos besoins. Changez à tout moment. Sans engagement.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-4 sm:px-6 relative">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <Card 
                  className={`group relative p-8 bg-white/[0.03] backdrop-blur-sm border transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl overflow-hidden ${
                    plan.popular 
                      ? 'border-primary/50 shadow-xl shadow-primary/20 scale-105 md:scale-110' 
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  {/* Gradient Glow for Popular */}
                  {plan.popular && (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
                  )}
                  
                  {plan.popular && (
                    <Badge className="absolute -top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-accent text-white border-0 px-4 py-1 shadow-lg">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Plus Populaire
                    </Badge>
                  )}
                  
                  <div className="relative z-10 space-y-6">
                    {/* Icon & Name */}
                    <div className="space-y-4">
                      <div className={`w-14 h-14 bg-gradient-to-br ${plan.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                        <plan.icon className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                        <p className="text-sm text-white/60">{plan.description}</p>
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white">{plan.price}</span>
                        {plan.period && <span className="text-lg text-white/60">XOF</span>}
                      </div>
                      {plan.period && <div className="text-sm text-white/50">{plan.period}</div>}
                    </div>
                    
                    {/* Features */}
                    <div className="space-y-3 py-4 border-y border-white/10">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3 group/item">
                          <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <Check className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm text-white/70 group-hover/item:text-white/90 transition-colors">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* CTA */}
                    <Button 
                      className={`w-full py-6 text-lg font-semibold transition-all duration-300 hover:scale-105 ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/30' 
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                      }`}
                      onClick={() => navigate('/auth')}
                    >
                      {plan.cta}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-center gap-8 max-w-4xl mx-auto">
            {[
              { icon: Shield, text: "Paiement 100% Sécurisé" },
              { icon: Zap, text: "Activation Instantanée" },
              { icon: Star, text: "Satisfait ou Remboursé" }
            ].map((item, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <div className="flex items-center gap-3 bg-white/5 rounded-full px-6 py-3 border border-white/10">
                  <item.icon className="h-5 w-5 text-accent" />
                  <span className="text-sm font-medium text-white/80">{item.text}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <ScrollReveal>
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-accent/20 text-accent border-accent/30 px-4 py-2">
                <Star className="h-4 w-4 mr-2" />
                Témoignages
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">Ce que disent nos clients</h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <Card className="p-6 bg-white/[0.03] border border-white/10 hover:border-accent/50 transition-all duration-500 hover:-translate-y-2">
                  <div className="space-y-4">
                    <Quote className="h-8 w-8 text-accent/50" />
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-white/80 italic">"{testimonial.content}"</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{testimonial.name}</p>
                        <p className="text-xs text-white/60">{testimonial.role}, {testimonial.location}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 bg-white/[0.02]">
        <div className="container mx-auto max-w-3xl">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-center text-white mb-12">Questions Fréquentes</h2>
          </ScrollReveal>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <ScrollReveal key={index} delay={index * 50}>
                <Card className="p-6 bg-white/[0.03] border border-white/10 hover:border-primary/50 transition-all duration-300">
                  <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
                  <p className="text-white/60">{faq.answer}</p>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px]" />
        
        <div className="container mx-auto text-center relative z-10">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Prêt à transformer votre gestion ?
            </h2>
            <p className="text-lg text-white/60 mb-8 max-w-xl mx-auto">
              Essayez Stocknix gratuitement pendant 14 jours. Aucune carte bancaire requise.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')} 
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-10 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              Commencer Gratuitement
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-white/10">
        <div className="container mx-auto text-center text-sm text-white/40">
          <p>© 2025 Stocknix par DESCHNIX. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
