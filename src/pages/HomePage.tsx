import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { 
  BarChart3, Package, CreditCard, TrendingUp, Users, Shield, 
  Smartphone, ArrowRight, CheckCircle, Menu, X, Star, 
  Zap, Clock, Target, Store, ShoppingBag, Building2,
  Check, Sparkles
} from "lucide-react";
import { useState } from "react";
import stocknixLogo from '@/assets/stocknix-logo.png';
import dashboardHero from '@/assets/3d-dashboard-hero.png';
import inventoryFeature from '@/assets/3d-inventory-feature.png';
import analyticsFeature from '@/assets/3d-analytics-feature.png';
import paymentFeature from '@/assets/3d-payment-feature.png';

const HomePage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Package,
      title: "Gestion des Stocks",
      description: "Suivez vos inventaires en temps réel avec des alertes automatiques de réapprovisionnement",
      image: inventoryFeature,
      benefits: ["Alertes de stock bas", "Suivi en temps réel", "Import/Export Excel"]
    },
    {
      icon: TrendingUp,
      title: "Ventes & Facturation",
      description: "Gérez vos ventes et générez des factures professionnelles en quelques clics",
      image: analyticsFeature,
      benefits: ["Devis & Factures", "Historique complet", "Exports PDF"]
    },
    {
      icon: CreditCard,
      title: "Gestion des Paiements",
      description: "Suivez tous vos paiements clients et fournisseurs avec un tableau de bord centralisé",
      image: paymentFeature,
      benefits: ["Suivi en temps réel", "Rappels automatiques", "Multiple devises"]
    },
    {
      icon: BarChart3,
      title: "Rapports & Analytics",
      description: "Analysez votre activité avec des rapports détaillés et des graphiques interactifs",
      image: dashboardHero,
      benefits: ["Graphiques en temps réel", "Exports personnalisés", "Métriques clés"]
    }
  ];

  const targetAudience = [
    {
      icon: Store,
      title: "Boutiques & Magasins",
      description: "Gérez votre commerce de détail efficacement"
    },
    {
      icon: ShoppingBag,
      title: "E-commerce",
      description: "Suivez vos ventes en ligne et vos stocks"
    },
    {
      icon: Building2,
      title: "PME/TPE",
      description: "Solution adaptée aux petites entreprises"
    },
    {
      icon: Users,
      title: "Grossistes",
      description: "Gérez vos commandes en gros"
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Simplicité d'utilisation",
      description: "Interface intuitive conçue pour les entrepreneurs africains"
    },
    {
      icon: Clock,
      title: "Gain de temps",
      description: "Automatisez vos tâches répétitives et focalisez sur votre croissance"
    },
    {
      icon: Shield,
      title: "Sécurité garantie",
      description: "Vos données sont protégées et sauvegardées dans le cloud"
    },
    {
      icon: Smartphone,
      title: "Accessible partout",
      description: "Gérez votre entreprise depuis mobile, tablette ou ordinateur"
    }
  ];

  const testimonials = [
    {
      name: "Aminata Diallo",
      role: "Gérante de boutique, Dakar",
      content: "Stocknix a transformé ma gestion quotidienne. Je sais exactement où j'en suis avec mes stocks et mes ventes. Un gain de temps incroyable !",
      rating: 5,
      avatar: "AD"
    },
    {
      name: "Kouassi Jean",
      role: "Propriétaire de magasin, Abidjan",
      content: "Depuis que j'utilise Stocknix, je n'ai plus de problèmes de rupture de stock. Les alertes automatiques sont parfaites !",
      rating: 5,
      avatar: "KJ"
    },
    {
      name: "Fatou Mbaye",
      role: "Entrepreneur, Bamako",
      content: "Interface simple et efficace. Même sans compétences techniques, j'ai pu démarrer en quelques minutes. Je recommande !",
      rating: 5,
      avatar: "FM"
    }
  ];

  const pricingFeatures = [
    "1 mois d'essai gratuit",
    "Gestion illimitée des produits",
    "Ventes et factures illimitées",
    "Rapports et analytics en temps réel",
    "Support client prioritaire",
    "Sauvegardes automatiques",
    "Mises à jour gratuites",
    "Accès mobile et desktop"
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Navigation */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <img src={stocknixLogo} alt="Stocknix" className="h-8 w-8" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Stocknix
              </span>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <a href="#accueil" className="text-muted-foreground hover:text-foreground transition-colors">
                Accueil
              </a>
              <a href="#fonctionnalites" className="text-muted-foreground hover:text-foreground transition-colors">
                Fonctionnalités
              </a>
              <a href="#pour-qui" className="text-muted-foreground hover:text-foreground transition-colors">
                Pour qui ?
              </a>
              <a href="#tarifs" className="text-muted-foreground hover:text-foreground transition-colors">
                Tarifs
              </a>
              <a href="#avis" className="text-muted-foreground hover:text-foreground transition-colors">
                Avis
              </a>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                Se connecter
              </Button>
              <Button onClick={() => navigate('/auth')} className="bg-primary hover:bg-primary/90 shadow-glow">
                Essai gratuit
                <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border">
              <nav className="flex flex-col space-y-4">
                <a href="#accueil" className="text-muted-foreground hover:text-foreground transition-colors">
                  Accueil
                </a>
                <a href="#fonctionnalites" className="text-muted-foreground hover:text-foreground transition-colors">
                  Fonctionnalités
                </a>
                <a href="#pour-qui" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pour qui ?
                </a>
                <a href="#tarifs" className="text-muted-foreground hover:text-foreground transition-colors">
                  Tarifs
                </a>
                <a href="#avis" className="text-muted-foreground hover:text-foreground transition-colors">
                  Avis
                </a>
                <div className="flex flex-col space-y-2 pt-4">
                  <Button variant="ghost" onClick={() => navigate('/auth')} className="w-full">
                    Se connecter
                  </Button>
                  <Button onClick={() => navigate('/auth')} className="w-full bg-primary hover:bg-primary/90">
                    Essai gratuit
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="accueil" className="py-20 lg:py-32 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <div className="space-y-8">
                <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                  <Sparkles className="h-3 w-3 mr-1" />
                  1 mois gratuit · Sans engagement
                </Badge>
                
                <h1 className="text-foreground font-bold text-4xl lg:text-6xl leading-tight">
                  Pilotez votre 
                  <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"> PME/TPE </span>
                  avec confiance
                </h1>
                
                <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl">
                  La solution tout-en-un pour gérer vos stocks, ventes, paiements et rapports en temps réel. 
                  Conçue spécialement pour les entrepreneurs africains.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/auth')} 
                    className="bg-primary hover:bg-primary/90 shadow-glow text-lg px-8"
                  >
                    Commencer gratuitement
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={() => navigate('/auth')}
                    className="text-lg border-border hover:bg-muted"
                  >
                    Voir la démo
                  </Button>
                </div>

                <div className="flex items-center gap-8 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">500+</div>
                    <div className="text-sm text-muted-foreground">Entreprises</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">4.9/5</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Star className="h-3 w-3 fill-warning text-warning" />
                      Satisfaction
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">24/7</div>
                    <div className="text-sm text-muted-foreground">Support</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl rounded-full"></div>
                <img 
                  src={dashboardHero} 
                  alt="Dashboard Stocknix" 
                  className="relative z-10 w-full h-auto rounded-2xl shadow-2xl"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fonctionnalites" className="py-20 bg-muted/30 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                Fonctionnalités
              </Badge>
              <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
                Tout ce dont vous avez besoin
              </h2>
              <p className="text-lg max-w-2xl mx-auto text-muted-foreground">
                Une suite complète d'outils professionnels pour gérer votre entreprise efficacement
              </p>
            </div>
          </ScrollReveal>

          <div className="space-y-32">
            {features.map((feature, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <div className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                    <div className="space-y-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl">
                        <feature.icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-3xl font-bold text-foreground">
                        {feature.title}
                      </h3>
                      <p className="text-lg text-muted-foreground">
                        {feature.description}
                      </p>
                      <div className="space-y-3">
                        {feature.benefits.map((benefit, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-success/10 rounded-full flex items-center justify-center">
                              <Check className="h-4 w-4 text-success" />
                            </div>
                            <span className="text-foreground">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 blur-2xl rounded-full"></div>
                      <img 
                        src={feature.image} 
                        alt={feature.title} 
                        className="relative z-10 w-full h-auto rounded-2xl shadow-xl"
                      />
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section id="pour-qui" className="py-20 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
                Pour qui ?
              </Badge>
              <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
                Conçu pour votre entreprise
              </h2>
              <p className="text-lg max-w-2xl mx-auto text-muted-foreground">
                Que vous soyez commerçant, e-commerçant ou grossiste, Stocknix s'adapte à vos besoins
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {targetAudience.map((target, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <Card className="p-6 text-center hover:shadow-glow transition-all border-border group hover:border-primary/50">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <target.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {target.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {target.description}
                  </p>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-success/10 text-success border-success/20">
                Bénéfices
              </Badge>
              <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
                Pourquoi choisir Stocknix ?
              </h2>
              <p className="text-lg max-w-2xl mx-auto text-muted-foreground">
                Rejoignez des centaines d'entrepreneurs qui ont déjà transformé leur gestion
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary via-accent to-primary rounded-full shadow-neon">
                    <benefit.icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="tarifs" className="py-20 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-warning/10 text-warning border-warning/20">
                Tarifs
              </Badge>
              <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
                Un tarif simple et transparent
              </h2>
              <p className="text-lg max-w-2xl mx-auto text-muted-foreground">
                Commencez gratuitement, continuez pour moins qu'un café par jour
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="max-w-2xl mx-auto">
              <Card className="relative overflow-hidden border-2 border-primary shadow-neon">
                <div className="absolute top-0 right-0 bg-gradient-to-br from-primary to-accent text-white px-6 py-2 rounded-bl-2xl">
                  <span className="font-bold">Recommandé</span>
                </div>
                
                <div className="p-8 lg:p-12">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-foreground mb-2">Plan Professionnel</h3>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        1000
                      </span>
                      <span className="text-2xl text-muted-foreground">FCFA</span>
                      <span className="text-muted-foreground">/mois</span>
                    </div>
                    <Badge className="mt-4 bg-success/10 text-success border-success/20">
                      <Sparkles className="h-3 w-3 mr-1" />
                      1er mois GRATUIT
                    </Badge>
                  </div>

                  <div className="space-y-4 mb-8">
                    {pricingFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-neon text-lg"
                    onClick={() => navigate('/auth')}
                  >
                    Commencer mon essai gratuit
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>

                  <p className="text-center text-sm text-muted-foreground mt-4">
                    Sans engagement · Annulez à tout moment
                  </p>
                </div>
              </Card>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="avis" className="py-20 bg-muted/30 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
                Témoignages
              </Badge>
              <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
                Ils nous font confiance
              </h2>
              <p className="text-lg max-w-2xl mx-auto text-muted-foreground">
                Découvrez ce que nos clients disent de Stocknix
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <Card className="p-6 hover:shadow-glow transition-all border-border h-full">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="bg-gradient-to-r from-primary via-accent to-primary rounded-3xl p-12 lg:p-20 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10 space-y-6">
                <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
                  Prêt à transformer votre entreprise ?
                </h2>
                <p className="text-lg lg:text-xl text-white/90 max-w-2xl mx-auto mb-8">
                  Rejoignez des centaines de PME/TPE qui font déjà confiance à Stocknix pour gérer leur activité
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    variant="secondary"
                    onClick={() => navigate('/auth')} 
                    className="px-8 text-lg shadow-2xl"
                  >
                    Créer mon compte gratuitement
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
                <p className="text-white/80 text-sm">
                  ✨ 1 mois gratuit · Sans carte bancaire · Support 24/7
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <img src={stocknixLogo} alt="Stocknix" className="h-8 w-8" />
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Stocknix
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                La solution SaaS de gestion pour PME/TPE en Afrique
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Produit</h4>
              <ul className="space-y-2">
                <li><a href="#fonctionnalites" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Fonctionnalités</a></li>
                <li><a href="#tarifs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Tarifs</a></li>
                <li><a href="#avis" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Témoignages</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Entreprise</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">À propos</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Carrières</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="/mentions-legales" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Mentions légales</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-muted-foreground">
              © 2024 Stocknix. Tous droits réservés.
            </p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Politique de confidentialité</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">CGU</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
