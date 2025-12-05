import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { BarChart3, Package, CreditCard, TrendingUp, Users, Shield, Smartphone, ArrowRight, CheckCircle, Menu, X, Star, Zap, Clock, Store, ShoppingBag, Building2, Check, Sparkles, ChevronDown, Bell, FileText, Scan, Download, Upload, AlertTriangle, DollarSign, ChevronLeft, ChevronRight, Globe, Heart, Rocket } from "lucide-react";
import { useState, useCallback } from "react";
import useEmblaCarousel from 'embla-carousel-react';
import stocknixLogo from '@/assets/stocknix-logo.png';
import dashboardHero from '@/assets/3d-dashboard-hero.png';
import inventoryFeature from '@/assets/3d-inventory-feature.png';
import analyticsFeature from '@/assets/3d-analytics-feature.png';
import paymentFeature from '@/assets/3d-payment-feature.png';

const HomePage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);
  
  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const carouselSlides = [
    {
      icon: Globe,
      title: "Solution 100% Cloud",
      subtitle: "Accessible partout",
      description: "Gérez votre entreprise depuis n'importe où : smartphone, tablette ou ordinateur. Vos données sont synchronisées en temps réel.",
      highlights: ["Multi-devises (FCFA)", "Mobile Money intégré", "Support en français"],
      color: "from-primary/20 to-primary/5"
    },
    {
      icon: Rocket,
      title: "Simple & Rapide",
      subtitle: "Conçu pour vous",
      description: "Interface intuitive pensée pour les entrepreneurs. Pas besoin d'être expert en informatique pour gérer votre stock et vos ventes.",
      highlights: ["Prise en main immédiate", "500+ entreprises", "Support local"],
      color: "from-accent/20 to-accent/5"
    },
    {
      icon: Heart,
      title: "Made in Côte d'Ivoire",
      subtitle: "Par DESCHNIX",
      description: "Développé par Ulrich Deschamp KOSSONOU pour répondre aux besoins réels des commerçants ivoiriens. Expertise locale, standards internationaux.",
      highlights: ["Adapté au marché local", "Expertise reconnue", "Évolution continue"],
      color: "from-primary/15 to-accent/10"
    }
  ];

  const mainFeatures = [{
    icon: Package,
    title: "Gestion des Stocks",
    description: "Suivi en temps réel, alertes de stock bas, import/export Excel/PDF/CSV, gestion code-barres, contrôle complet des produits",
    items: ["Suivi en temps réel", "Alertes de stock bas", "Import/Export Excel, PDF, CSV", "Scanner Code-barres", "Contrôle total produits"]
  }, {
    icon: ShoppingBag,
    title: "Caisse & POS",
    description: "Encaissement rapide, gestion quantités/remises, paiements multiples (Mobile Money, espèces, cartes), tickets automatiques",
    items: ["Caisse tactile rapide", "Gestion remises", "Multi-paiements", "Impression tickets", "Interface intuitive"]
  }, {
    icon: FileText,
    title: "Ventes & Facturation",
    description: "Création de devis et factures professionnels, suivi complet des transactions, export PDF automatique",
    items: ["Devis personnalisés", "Factures pro", "Suivi transactions", "Export PDF", "Historique complet"]
  }, {
    icon: DollarSign,
    title: "Gestion des Paiements",
    description: "Historique complet, multi-méthodes de paiement, statuts en temps réel, rappels automatiques",
    items: ["Historique détaillé", "Multi-méthodes", "Statuts temps réel", "Rappels auto", "Rapprochement bancaire"]
  }, {
    icon: BarChart3,
    title: "Rapports & Analytics",
    description: "Rapports détaillés, graphiques interactifs, prévisions intelligentes, analyse activité commerciale",
    items: ["Graphiques temps réel", "Rapports détaillés", "Prévisions IA", "Analytics avancés", "Exports personnalisés"]
  }, {
    icon: Bell,
    title: "Alertes Temps Réel",
    description: "Notifications automatiques pour stock bas, ruptures, activité caisse, mouvements produits",
    items: ["Alertes stock bas", "Notifications rupture", "Activité caisse", "Mouvements stock", "Alertes personnalisées"]
  }];
  const targetAudience = [{
    icon: Store,
    title: "Supermarchés & Boutiques",
    description: "Gérez votre supermarché ou boutique avec efficacité. Stock temps réel, caisse rapide, facturation automatique."
  }, {
    icon: ShoppingBag,
    title: "Magasins & Commerce",
    description: "Solution complète pour magasins de détail. Suivez vos ventes, gérez vos stocks, fidélisez vos clients."
  }, {
    icon: Building2,
    title: "PME & TPE",
    description: "Plateforme adaptée aux PME/TPE. Gestion complète de votre activité commerciale avec analytics avancés."
  }, {
    icon: Users,
    title: "Grossistes & Distributeurs",
    description: "Gérez vos commandes en gros, suivez vos fournisseurs, optimisez votre inventaire et vos marges."
  }];
  const benefits = [{
    icon: Zap,
    title: "Rapide & Efficace",
    description: "Interface ultra-rapide, caisse tactile, scanner code-barres intégré"
  }, {
    icon: Clock,
    title: "Gain de Temps",
    description: "Automatisez vos tâches, alertes intelligentes, import/export massif"
  }, {
    icon: Shield,
    title: "100% Sécurisé",
    description: "Données chiffrées, sauvegardes automatiques, conformité RGPD"
  }, {
    icon: Smartphone,
    title: "Multi-plateforme",
    description: "PC, Mac, tablettes, smartphones - accessible partout"
  }];
  return <div className="min-h-screen bg-background">
      
      {/* Navigation */}
      <header className="border-b border-border bg-background/95 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center">
              <img src={stocknixLogo} alt="Stocknix Logo" className="h-10 sm:h-12 w-auto object-contain" />
            </div>

            <nav className="hidden lg:flex items-center space-x-8">
              <a href="#fonctionnalites" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Fonctionnalités
              </a>
              <a href="#pour-qui" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Pour qui ?
              </a>
              <a href="/tarifs" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Tarifs
              </a>
              <a href="/faq" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                FAQ
              </a>
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                Connexion
              </Button>
              <Button onClick={() => navigate('/auth')} className="bg-primary hover:bg-primary/90">
                Essai Gratuit
                <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {mobileMenuOpen && <div className="lg:hidden py-4 border-t border-border">
              <nav className="flex flex-col space-y-3">
                <a href="#fonctionnalites" className="text-muted-foreground hover:text-primary transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Fonctionnalités
                </a>
                <a href="#pour-qui" className="text-muted-foreground hover:text-primary transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Pour qui ?
                </a>
                <a href="/tarifs" className="text-muted-foreground hover:text-primary transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Tarifs
                </a>
                <a href="/faq" className="text-muted-foreground hover:text-primary transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>
                  FAQ
                </a>
                <div className="flex flex-col gap-2 pt-3">
                  <Button variant="outline" onClick={() => navigate('/auth')} className="w-full">
                    Connexion
                  </Button>
                  <Button onClick={() => navigate('/auth')} className="w-full">
                    Essai Gratuit
                  </Button>
                </div>
              </nav>
            </div>}
        </div>
      </header>

      {/* Hero Section */}
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-12 sm:py-20">
          <div className="max-w-4xl">
            <ScrollReveal>
              <div className="space-y-6 sm:space-y-8">
                <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm font-semibold inline-flex">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Essai Gratuit • Sans Engagement
                </Badge>
                
                <h1 className="font-extrabold text-foreground text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-tight">
                  Stocknix
                </h1>
                
                <h2 className="font-bold text-foreground text-2xl sm:text-3xl lg:text-4xl leading-tight">
                  Gérez vos stocks, vos ventes et votre caisse en toute simplicité
                </h2>
                
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                  Le logiciel SaaS complet pour boutiques, supermarchés, magasins, PME et TPE. 
                  Stock en temps réel, factures, devis, paiements, analytics et alertes automatiques.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" onClick={() => navigate('/auth')} className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 shadow-lg">
                    Essayer Stocknix Maintenant
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate('/fonctionnalites')} className="text-lg px-8 py-6 border-2">
                    Découvrir les Fonctionnalités
                  </Button>
                </div>

                <div className="flex items-center gap-6 pt-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-sm font-bold">
                        {i}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">500+ entreprises satisfaites</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-8 w-8 text-muted-foreground" />
        </div>
      </section>

      {/* Fonctionnalités Principales */}
      <section id="fonctionnalites" className="py-16 sm:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-2">
                Fonctionnalités
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Tout ce dont vous avez besoin
              </h2>
              <p className="text-lg text-muted-foreground">
                Une plateforme complète pour gérer votre entreprise efficacement
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {mainFeatures.map((feature, index) => <ScrollReveal key={index} delay={index * 100}>
                <Card className="p-6 sm:p-8 hover:shadow-xl transition-all border-2 h-full">
                  <div className="space-y-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                      <feature.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="space-y-2 pt-2">
                      {feature.items.map((item, i) => <div key={i} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{item}</span>
                        </div>)}
                    </div>
                  </div>
                </Card>
              </ScrollReveal>)}
          </div>
        </div>
      </section>

      {/* Pour Qui? */}
      <section id="pour-qui" className="py-16 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-2">
                Pour Qui ?
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Conçu pour les professionnels
              </h2>
              <p className="text-lg text-muted-foreground">
                Stocknix s'adapte à tous les types d'entreprises en Côte d'Ivoire
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {targetAudience.map((audience, index) => <ScrollReveal key={index} delay={index * 100}>
                <Card className="p-6 hover:shadow-xl transition-all text-center border-2 h-full">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <audience.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      {audience.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {audience.description}
                    </p>
                  </div>
                </Card>
              </ScrollReveal>)}
          </div>
        </div>
      </section>

      {/* Section 1: Pourquoi Stocknix - Carousel */}
      <section className="py-16 sm:py-24 bg-background overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-10 max-w-2xl mx-auto">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-2">
                Découvrir
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                Pourquoi Stocknix ?
              </h2>
              <p className="text-muted-foreground">
                Une solution pensée pour les entrepreneurs africains
              </p>
            </div>
          </ScrollReveal>

          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {carouselSlides.map((slide, index) => (
                  <div key={index} className="flex-[0_0_100%] min-w-0 px-4">
                    <Card className={`p-8 sm:p-12 bg-gradient-to-br ${slide.color} border-2 border-border/50`}>
                      <div className="flex flex-col lg:flex-row items-center gap-8">
                        <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                          <slide.icon className="h-12 w-12 text-primary" />
                        </div>
                        <div className="text-center lg:text-left flex-1">
                          <p className="text-sm font-medium text-primary mb-1">{slide.subtitle}</p>
                          <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                            {slide.title}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed mb-4">
                            {slide.description}
                          </p>
                          <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                            {slide.highlights.map((highlight, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                <Check className="h-3 w-3 mr-1" />
                                {highlight}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation Arrows */}
            <button
              onClick={scrollPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 w-10 h-10 bg-background border-2 border-border rounded-full flex items-center justify-center hover:bg-muted"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 w-10 h-10 bg-background border-2 border-border rounded-full flex items-center justify-center hover:bg-muted"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Section 2: Essai Gratuit Simple */}
      <section className="py-12 sm:py-16 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 bg-background rounded-full px-6 py-3 border-2 border-border mb-6">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Essai 100% Gratuit</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">Sans carte bancaire</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
              Prêt à simplifier votre gestion ?
            </h3>
            <p className="text-muted-foreground mb-6">
              Rejoignez les 500+ entreprises ivoiriennes qui nous font confiance
            </p>
            <Button size="lg" onClick={() => navigate('/auth')} className="bg-primary hover:bg-primary/90">
              Commencer Maintenant
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Pourquoi choisir Stocknix ?
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {benefits.map((benefit, index) => <ScrollReveal key={index} delay={index * 100}>
                <Card className="p-6 hover:shadow-xl transition-all text-center border-2">
                  <div className="space-y-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                      <benefit.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </Card>
              </ScrollReveal>)}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-primary to-primary/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                Prêt à transformer votre gestion ?
              </h2>
              <p className="text-xl text-white/90">
                Rejoignez les 500+ entreprises qui ont choisi Stocknix
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => navigate('/auth')} className="bg-white text-primary hover:bg-white/90 text-lg px-10 py-6 shadow-xl">
                  Commencer Gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/tarifs')} className="text-lg px-10 py-6 border-2 border-white text-white hover:bg-white hover:text-primary">
                  Voir les Tarifs
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 border-t border-border bg-muted/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src={stocknixLogo} alt="Stocknix" className="h-8" />
                <span className="text-xl font-black">STOCKNIX</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Logiciel de gestion complet pour PME et TPE en Côte d'Ivoire
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Produit</h3>
              <div className="space-y-2 text-sm">
                <a href="/fonctionnalites" className="block text-muted-foreground hover:text-primary">Fonctionnalités</a>
                <a href="/tarifs" className="block text-muted-foreground hover:text-primary">Tarifs</a>
                <a href="/faq" className="block text-muted-foreground hover:text-primary">FAQ</a>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Entreprise</h3>
              <div className="space-y-2 text-sm">
                <a href="/legal" className="block text-muted-foreground hover:text-primary">Mentions Légales</a>
                <p className="text-muted-foreground">Par DESCHNIX</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Contact</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>support@stocknix.space</p>
                <p>Côte d'Ivoire</p>
              </div>
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground border-t border-border pt-8">
            <p>© 2025 Stocknix par DESCHNIX. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>;
};
export default HomePage;