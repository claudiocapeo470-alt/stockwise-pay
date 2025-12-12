import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { BarChart3, Package, CreditCard, TrendingUp, Users, Shield, Smartphone, ArrowRight, CheckCircle, Menu, X, Star, Zap, Clock, Store, ShoppingBag, Building2, Check, Sparkles, ChevronDown, Bell, FileText, Scan, Download, Upload, AlertTriangle, DollarSign, ChevronLeft, ChevronRight, Globe, Heart, Rocket, Quote } from "lucide-react";
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

  const testimonials = [
    {
      name: "Aminata K.",
      role: "Gérante de Supermarché",
      location: "Abidjan, Cocody",
      content: "Stocknix a transformé notre gestion. Avant, je perdais des heures à compter le stock. Maintenant tout est automatique !",
      rating: 5,
      avatar: "AK"
    },
    {
      name: "Kouassi B.",
      role: "Propriétaire de Boutique",
      location: "Bouaké",
      content: "Le module caisse est incroyable. Mes employés l'ont adopté en moins d'une heure. Les ventes sont maintenant bien suivies.",
      rating: 5,
      avatar: "KB"
    },
    {
      name: "Marie-Claire D.",
      role: "Directrice PME",
      location: "Abidjan, Plateau",
      content: "Les rapports et analytics m'aident à prendre de meilleures décisions. Mon chiffre d'affaires a augmenté de 30% en 6 mois.",
      rating: 5,
      avatar: "MD"
    }
  ];

  const mainFeatures = [{
    icon: Package,
    title: "Gestion des Stocks",
    description: "Suivi en temps réel, alertes de stock bas, import/export Excel/PDF/CSV, gestion code-barres, contrôle complet des produits",
    items: ["Suivi en temps réel", "Alertes de stock bas", "Import/Export Excel, PDF, CSV", "Scanner Code-barres", "Contrôle total produits"],
    gradient: "from-blue-500 to-cyan-400"
  }, {
    icon: ShoppingBag,
    title: "Caisse & POS",
    description: "Encaissement rapide, gestion quantités/remises, paiements multiples (Mobile Money, espèces, cartes), tickets automatiques",
    items: ["Caisse tactile rapide", "Gestion remises", "Multi-paiements", "Impression tickets", "Interface intuitive"],
    gradient: "from-violet-500 to-purple-400"
  }, {
    icon: FileText,
    title: "Ventes & Facturation",
    description: "Création de devis et factures professionnels, suivi complet des transactions, export PDF automatique",
    items: ["Devis personnalisés", "Factures pro", "Suivi transactions", "Export PDF", "Historique complet"],
    gradient: "from-emerald-500 to-teal-400"
  }, {
    icon: DollarSign,
    title: "Gestion des Paiements",
    description: "Historique complet, multi-méthodes de paiement, statuts en temps réel, rappels automatiques",
    items: ["Historique détaillé", "Multi-méthodes", "Statuts temps réel", "Rappels auto", "Rapprochement bancaire"],
    gradient: "from-orange-500 to-amber-400"
  }, {
    icon: BarChart3,
    title: "Rapports & Analytics",
    description: "Rapports détaillés, graphiques interactifs, prévisions intelligentes, analyse activité commerciale",
    items: ["Graphiques temps réel", "Rapports détaillés", "Prévisions IA", "Analytics avancés", "Exports personnalisés"],
    gradient: "from-pink-500 to-rose-400"
  }, {
    icon: Bell,
    title: "Alertes Temps Réel",
    description: "Notifications automatiques pour stock bas, ruptures, activité caisse, mouvements produits",
    items: ["Alertes stock bas", "Notifications rupture", "Activité caisse", "Mouvements stock", "Alertes personnalisées"],
    gradient: "from-indigo-500 to-blue-400"
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

      {/* Hero Section with 3D Dashboard */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-[hsl(222,47%,8%)] via-[hsl(222,47%,11%)] to-[hsl(200,50%,12%)]">
        {/* Animated Gradient Orbs */}
        <div className="absolute top-20 right-[20%] w-[500px] h-[500px] bg-primary/30 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-20 left-[10%] w-[400px] h-[400px] bg-accent/25 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-[10%] w-[300px] h-[300px] bg-[hsl(280,60%,50%)]/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-12 sm:py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 sm:space-y-8">
              <ScrollReveal>
                <Badge className="bg-white/10 text-white border-white/20 px-4 py-2 text-sm font-semibold inline-flex backdrop-blur-sm">
                  <Sparkles className="h-4 w-4 mr-2 text-accent" />
                  Essai Gratuit • Sans Engagement
                </Badge>
              </ScrollReveal>
              
              <ScrollReveal delay={100}>
                <h1 className="font-extrabold text-white text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-tight">
                  Stocknix
                </h1>
              </ScrollReveal>
              
              <ScrollReveal delay={200}>
                <h2 className="font-bold text-white/90 text-2xl sm:text-3xl lg:text-4xl leading-tight">
                  Gérez vos stocks, vos ventes et votre caisse en toute simplicité
                </h2>
              </ScrollReveal>
              
              <ScrollReveal delay={300}>
                <p className="text-lg sm:text-xl text-white/70 leading-relaxed max-w-xl">
                  Le logiciel SaaS complet pour boutiques, supermarchés, magasins, PME et TPE. 
                  Stock en temps réel, factures, devis, paiements, analytics et alertes automatiques.
                </p>
              </ScrollReveal>
              
              <ScrollReveal delay={400}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" onClick={() => navigate('/auth')} className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8 py-6 shadow-2xl shadow-primary/30 transition-all duration-300 hover:shadow-primary/50 hover:scale-105">
                    Essayer Stocknix Maintenant
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate('/fonctionnalites')} className="text-lg px-8 py-6 border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 hover:border-white/50">
                    Découvrir les Fonctionnalités
                  </Button>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={500}>
                <div className="flex items-center gap-6 pt-4">
                  <div className="flex -space-x-3">
                    {['AK', 'BM', 'CL', 'DT', 'EK'].map((initials, i) => (
                      <div key={i} className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-[hsl(222,47%,11%)] flex items-center justify-center text-xs font-bold text-white shadow-lg">
                        {initials}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm text-white/60 font-medium">500+ entreprises satisfaites</p>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Right - 3D Dashboard Image */}
            <ScrollReveal delay={300}>
              <div className="relative lg:block hidden">
                <div className="relative">
                  {/* Floating Glow Behind */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-accent/40 rounded-3xl blur-3xl scale-90" />
                  
                  {/* Main 3D Image */}
                  <img 
                    src={dashboardHero} 
                    alt="Stocknix Dashboard 3D" 
                    className="relative z-10 w-full h-auto rounded-2xl shadow-2xl transform hover:scale-[1.02] transition-transform duration-500"
                  />
                  
                  {/* Floating Stats Cards */}
                  <div className="absolute -top-4 -left-4 bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-xl animate-float">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-white/60">Ventes du jour</p>
                        <p className="text-lg font-bold text-white">+32%</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute -bottom-4 -right-4 bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-xl animate-float" style={{ animationDelay: '0.5s' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-500 rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-white/60">Produits actifs</p>
                        <p className="text-lg font-bold text-white">1,247</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex flex-col items-center gap-2 text-white/50">
            <span className="text-xs uppercase tracking-widest">Découvrir</span>
            <ChevronDown className="h-6 w-6 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Fonctionnalités Principales - Modern Cards with Animations */}
      <section id="fonctionnalites" className="relative py-16 sm:py-24 bg-[hsl(222,47%,6%)] overflow-hidden">
        {/* Subtle Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08),transparent_70%)]" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 px-4 py-2 backdrop-blur-sm">
                <Zap className="h-4 w-4 mr-2" />
                Fonctionnalités
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                Tout ce dont vous avez besoin
              </h2>
              <p className="text-lg text-white/60">
                Une plateforme complète pour gérer votre entreprise efficacement
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {mainFeatures.map((feature, index) => <ScrollReveal key={index} delay={index * 80}>
                <Card className="group relative p-6 sm:p-8 bg-white/[0.03] backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all duration-500 h-full overflow-hidden hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2">
                  {/* Gradient Glow on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  <div className="relative z-10 space-y-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/80 group-hover:bg-clip-text transition-all duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-white/60 leading-relaxed group-hover:text-white/70 transition-colors duration-300">
                      {feature.description}
                    </p>
                    <div className="space-y-2 pt-2">
                      {feature.items.map((item, i) => <div key={i} className="flex items-center gap-2 group/item">
                          <Check className="h-4 w-4 text-accent flex-shrink-0 group-hover/item:scale-110 transition-transform" />
                          <span className="text-sm text-white/70 group-hover:text-white/80 transition-colors">{item}</span>
                        </div>)}
                    </div>
                  </div>
                </Card>
              </ScrollReveal>)}
          </div>
        </div>
      </section>

      {/* Pour Qui? - Gradient Mesh Style */}
      <section id="pour-qui" className="relative py-16 sm:py-24 bg-gradient-to-br from-[hsl(180,60%,95%)] via-background to-[hsl(220,60%,95%)] dark:from-[hsl(180,40%,10%)] dark:via-background dark:to-[hsl(220,40%,10%)] overflow-hidden">
        {/* Decorative Blobs */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-accent/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
              <Badge className="mb-4 bg-accent/20 text-accent border-accent/30 px-4 py-2">
                <Users className="h-4 w-4 mr-2" />
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
                <Card className="group p-6 bg-background/80 backdrop-blur-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 text-center border border-border/50 hover:border-accent/50 h-full">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center mx-auto group-hover:rotate-6 group-hover:scale-110 transition-all duration-500 shadow-lg">
                      <audience.icon className="h-8 w-8 text-white" />
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
                    <Card className={`p-8 sm:p-12 bg-gradient-to-br ${slide.color} border-2 border-border/50 hover:border-primary/30 transition-all duration-300`}>
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
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 w-10 h-10 bg-background border-2 border-border rounded-full flex items-center justify-center hover:bg-muted transition-all duration-300 hover:scale-110"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 w-10 h-10 bg-background border-2 border-border rounded-full flex items-center justify-center hover:bg-muted transition-all duration-300 hover:scale-110"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-[hsl(220,50%,6%)] to-[hsl(200,50%,8%)] overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
              <Badge className="mb-4 bg-accent/20 text-accent border-accent/30 px-4 py-2 backdrop-blur-sm">
                <Star className="h-4 w-4 mr-2" />
                Témoignages
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                Ils nous font confiance
              </h2>
              <p className="text-lg text-white/60">
                Découvrez ce que nos clients disent de Stocknix
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <Card className="group p-6 sm:p-8 bg-white/[0.03] backdrop-blur-sm border border-white/10 hover:border-accent/50 transition-all duration-500 h-full hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent/10">
                  <div className="space-y-6">
                    {/* Quote Icon */}
                    <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center">
                      <Quote className="h-6 w-6 text-white" />
                    </div>
                    
                    {/* Rating */}
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    
                    {/* Content */}
                    <p className="text-white/80 leading-relaxed italic">
                      "{testimonial.content}"
                    </p>
                    
                    {/* Author */}
                    <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{testimonial.name}</p>
                        <p className="text-sm text-white/60">{testimonial.role}</p>
                        <p className="text-xs text-accent">{testimonial.location}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Essai Gratuit - Glassmorphism Style */}
      <section className="relative py-12 sm:py-20 bg-gradient-to-r from-primary via-[hsl(200,80%,50%)] to-accent overflow-hidden">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-xl" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-md rounded-full px-6 py-3 border border-white/30 mb-6">
              <Sparkles className="h-5 w-5 text-white" />
              <span className="font-semibold text-white">Essai 100% Gratuit</span>
              <span className="text-white/60">•</span>
              <span className="text-white/80">Sans carte bancaire</span>
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Prêt à simplifier votre gestion ?
            </h3>
            <p className="text-white/80 text-lg mb-8">
              Rejoignez les 500+ entreprises ivoiriennes qui nous font confiance
            </p>
            <Button size="lg" onClick={() => navigate('/auth')} className="bg-white text-primary hover:bg-white/90 shadow-xl px-8 py-6 text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              Commencer Maintenant
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits - Professional Dark Theme */}
      <section className="relative py-16 sm:py-24 bg-[hsl(230,25%,8%)] overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[120px]" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                Pourquoi choisir Stocknix ?
              </h2>
              <p className="text-lg text-white/60">
                Des avantages concrets pour votre entreprise
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {benefits.map((benefit, index) => <ScrollReveal key={index} delay={index * 100}>
                <Card className="group relative p-6 bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 hover:border-primary/50 transition-all duration-500 text-center overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20">
                  {/* Hover Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10 space-y-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                      <benefit.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-white/60 leading-relaxed group-hover:text-white/70 transition-colors">
                      {benefit.description}
                    </p>
                  </div>
                </Card>
              </ScrollReveal>)}
          </div>
        </div>
      </section>

      {/* CTA Final - Cyberpunk Gradient */}
      <section className="relative py-16 sm:py-24 bg-gradient-to-br from-[hsl(260,70%,30%)] via-primary to-[hsl(200,80%,40%)] overflow-hidden">
        {/* Geometric Shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white/20 rotate-45" />
          <div className="absolute bottom-10 right-10 w-32 h-32 border-2 border-white/20 rotate-12" />
          <div className="absolute top-1/2 right-1/4 w-16 h-16 border-2 border-white/10 rounded-full" />
          <div className="absolute bottom-1/4 left-1/4 w-24 h-24 border border-white/10 rounded-full" />
        </div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto space-y-8">
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 backdrop-blur-sm">
                <Rocket className="h-4 w-4 mr-2" />
                Lancez-vous maintenant
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                Prêt à transformer votre gestion ?
              </h2>
              <p className="text-xl text-white/90">
                Rejoignez les 500+ entreprises qui ont choisi Stocknix
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => navigate('/auth')} className="bg-white text-primary hover:bg-white/90 text-lg px-10 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  Commencer Gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/tarifs')} className="text-lg px-10 py-6 border-2 border-white text-white hover:bg-white hover:text-primary backdrop-blur-sm transition-all duration-300">
                  Voir les Tarifs
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer - Modern Dark */}
      <footer className="relative py-12 px-4 sm:px-6 bg-[hsl(222,47%,6%)] border-t border-white/10">
        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center">
                <img src={stocknixLogo} alt="Stocknix" className="h-10" />
              </div>
              <p className="text-sm text-white/60">
                Logiciel de gestion complet pour PME et TPE en Côte d'Ivoire
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-white">Produit</h3>
              <div className="space-y-2 text-sm">
                <a href="/fonctionnalites" className="block text-white/60 hover:text-accent transition-colors">Fonctionnalités</a>
                <a href="/tarifs" className="block text-white/60 hover:text-accent transition-colors">Tarifs</a>
                <a href="/faq" className="block text-white/60 hover:text-accent transition-colors">FAQ</a>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-white">Entreprise</h3>
              <div className="space-y-2 text-sm">
                <a href="/legal" className="block text-white/60 hover:text-accent transition-colors">Mentions Légales</a>
                <p className="text-white/60">Par DESCHNIX</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-white">Contact</h3>
              <div className="space-y-2 text-sm text-white/60">
                <p>support@stocknix.space</p>
                <p>Côte d'Ivoire</p>
              </div>
            </div>
          </div>
          
          <div className="text-center text-sm text-white/40 border-t border-white/10 pt-8">
            <p>© 2025 Stocknix par DESCHNIX. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      {/* Custom Animation Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>;
};
export default HomePage;
