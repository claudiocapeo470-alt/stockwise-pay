import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { 
  BarChart3, Package, CreditCard, TrendingUp, Users, Shield, 
  Smartphone, ArrowRight, CheckCircle, Menu, X, Star, 
  Zap, Clock, Target, Store, ShoppingBag, Building2,
  Check, Sparkles, ChevronDown
} from "lucide-react";
import { useState } from "react";
import stocknixLogo from '@/assets/stocknix-logo.png';
import teamWorkingInventory from '@/assets/team-working-inventory.jpg';
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
      description: "Suivez vos inventaires en temps réel avec des alertes automatiques de réapprovisionnement et un contrôle total sur vos produits",
      image: inventoryFeature,
      benefits: ["Alertes de stock bas", "Suivi en temps réel", "Import/Export Excel", "Code-barres"]
    },
    {
      icon: TrendingUp,
      title: "Ventes & Facturation",
      description: "Créez des devis et factures professionnels en quelques clics avec un suivi complet de vos transactions",
      image: analyticsFeature,
      benefits: ["Devis & Factures", "Historique complet", "Exports PDF", "Multi-devises"]
    },
    {
      icon: CreditCard,
      title: "Gestion des Paiements",
      description: "Suivez tous vos paiements clients et fournisseurs avec un tableau de bord centralisé et des rappels automatiques",
      image: paymentFeature,
      benefits: ["Suivi en temps réel", "Rappels automatiques", "Multiple devises", "Rapprochement bancaire"]
    },
    {
      icon: BarChart3,
      title: "Rapports & Analytics",
      description: "Analysez votre activité avec des rapports détaillés, des graphiques interactifs et des prévisions intelligentes",
      image: analyticsFeature,
      benefits: ["Graphiques en temps réel", "Exports personnalisés", "Métriques clés", "Prévisions IA"]
    }
  ];

  const targetAudience = [
    {
      icon: Store,
      title: "Boutiques & Magasins",
      description: "Gérez votre commerce de détail avec efficacité et professionnalisme"
    },
    {
      icon: ShoppingBag,
      title: "E-commerce",
      description: "Suivez vos ventes en ligne et synchronisez vos stocks automatiquement"
    },
    {
      icon: Building2,
      title: "PME/TPE",
      description: "Solution complète adaptée aux besoins des petites et moyennes entreprises"
    },
    {
      icon: Users,
      title: "Grossistes",
      description: "Gérez vos commandes en gros et vos relations fournisseurs"
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Simplicité d'utilisation",
      description: "Interface intuitive et moderne, aucune formation nécessaire"
    },
    {
      icon: Clock,
      title: "Gain de temps massif",
      description: "Automatisez vos tâches répétitives et gagnez jusqu'à 15h par semaine"
    },
    {
      icon: Shield,
      title: "Sécurité maximale",
      description: "Vos données sont cryptées et sauvegardées automatiquement dans le cloud"
    },
    {
      icon: Smartphone,
      title: "Accessible partout",
      description: "Application 100% responsive - mobile, tablette et ordinateur"
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
    "1 mois d'essai gratuit complet",
    "Gestion illimitée des produits",
    "Ventes et factures illimitées",
    "Rapports et analytics en temps réel",
    "Support client prioritaire 24/7",
    "Sauvegardes automatiques quotidiennes",
    "Mises à jour gratuites à vie",
    "Accès mobile, tablette et desktop"
  ];

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      
      {/* Navigation - Fixed Header */}
      <header className="border-b border-gray-100 bg-white/95 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
              <img src={stocknixLogo} alt="Stocknix" className="h-10 sm:h-12" />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <a href="#accueil" className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm">
                Accueil
              </a>
              <a href="#fonctionnalites" className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm">
                Fonctionnalités
              </a>
              <a href="#pour-qui" className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm">
                Pour qui ?
              </a>
              <a href="#tarifs" className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm">
                Tarifs
              </a>
              <a href="#avis" className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm">
                Avis
              </a>
            </nav>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/auth')} 
                className="text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              >
                Se connecter
              </Button>
              <Button 
                onClick={() => navigate('/auth')} 
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30"
              >
                Essai gratuit
                <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 text-gray-700" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-6 border-t border-gray-100">
              <nav className="flex flex-col space-y-4">
                <a href="#accueil" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  Accueil
                </a>
                <a href="#fonctionnalites" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  Fonctionnalités
                </a>
                <a href="#pour-qui" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  Pour qui ?
                </a>
                <a href="#tarifs" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  Tarifs
                </a>
                <a href="#avis" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  Avis
                </a>
                <div className="flex flex-col gap-3 pt-4">
                  <Button variant="outline" onClick={() => navigate('/auth')} className="w-full">
                    Se connecter
                  </Button>
                  <Button onClick={() => navigate('/auth')} className="w-full bg-blue-600 text-white">
                    Essai gratuit
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Background Image */}
      <section id="accueil" className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={teamWorkingInventory} 
            alt="Équipe PME utilisant Stocknix" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 via-blue-800/90 to-blue-900/70"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-blue-900/40"></div>
        </div>
        
        <div className="container mx-auto px-6 lg:px-8 relative z-10 py-20">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal>
              <div className="max-w-2xl">
                {/* Badge */}
                <Badge className="bg-white/20 text-white border-0 px-6 py-3 text-sm font-semibold backdrop-blur-md inline-flex items-center gap-2 mb-8">
                  <Sparkles className="h-4 w-4" />
                  1 mois gratuit • Sans engagement
                </Badge>
                
                {/* Title */}
                <h1 className="font-extrabold text-white text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-tight mb-8">
                  Transformez votre business en quelques clics
                </h1>
                
                {/* Description */}
                <p className="text-white/95 text-lg sm:text-xl lg:text-2xl leading-relaxed mb-10">
                  Gérez stocks, ventes et finances intelligemment. La plateforme moderne qui accompagne votre croissance.
                </p>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-16">
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/auth')} 
                    className="bg-white text-blue-600 hover:bg-blue-50 shadow-2xl text-lg px-10 py-7 rounded-xl font-bold transition-all hover:scale-105"
                  >
                    Démarrer gratuitement
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={() => navigate('/auth')}
                    className="text-lg border-2 border-white text-white hover:bg-white hover:text-blue-600 px-10 py-7 rounded-xl bg-white/10 backdrop-blur-sm transition-all hover:scale-105"
                  >
                    Voir la démo
                  </Button>
                </div>
              </div>
            </ScrollReveal>

            {/* Stats Section - Bottom */}
            <ScrollReveal delay={200}>
              <div className="grid grid-cols-3 gap-8 max-w-4xl bg-white/10 backdrop-blur-lg rounded-2xl p-8 lg:p-10 border border-white/20">
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-3">500+</div>
                  <div className="text-sm sm:text-base text-white/90 font-medium">Entreprises</div>
                </div>
                <div className="text-center border-l border-r border-white/30">
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-3">4.9/5</div>
                  <div className="text-sm sm:text-base text-white/90 font-medium flex items-center gap-2 justify-center">
                    <Star className="h-5 w-5 fill-amber-300 text-amber-300" />
                    Satisfaction
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-3">24/7</div>
                  <div className="text-sm sm:text-base text-white/90 font-medium">Support</div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce z-20">
          <span className="text-white/90 text-sm font-medium">Découvrir</span>
          <ChevronDown className="h-6 w-6 text-white/90" />
        </div>
      </section>

      {/* Features Section - White Background */}
      <section id="fonctionnalites" className="py-24 lg:py-32 bg-white relative">
        <div className="container mx-auto px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-20 max-w-3xl mx-auto">
              <Badge className="mb-6 bg-blue-100 text-blue-700 border-0 px-5 py-2.5 text-sm font-semibold">
                Fonctionnalités
              </Badge>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Tout ce dont vous avez besoin
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Des outils puissants et intuitifs pour gérer votre entreprise avec simplicité et efficacité
              </p>
            </div>
          </ScrollReveal>

          <div className="space-y-32 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}>
                  {/* Content */}
                  <div className={`flex flex-col justify-center ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                    <div className="space-y-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl">
                        <feature.icon className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-3xl sm:text-4xl font-bold text-gray-900">
                        {feature.title}
                      </h3>
                      <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                      <div className="space-y-4 pt-4">
                        {feature.benefits.map((benefit, i) => (
                          <div key={i} className="flex items-center gap-4">
                            <div className="flex-shrink-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-gray-700 text-base sm:text-lg font-medium">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Image */}
                  <div className={`flex items-center justify-center ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <div className="relative w-full max-w-xl p-8 bg-gradient-to-br from-gray-50 to-blue-50/50 rounded-3xl">
                      <img 
                        src={feature.image} 
                        alt={feature.title} 
                        className="relative z-10 w-full h-auto rounded-2xl shadow-2xl"
                      />
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience Section - Black Background */}
      <section id="pour-qui" className="py-24 lg:py-32 bg-gradient-to-b from-gray-900 via-black to-gray-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_70%)]"></div>
        
        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-20 max-w-3xl mx-auto">
              <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-0 px-5 py-2.5 text-sm font-semibold">
                Pour qui ?
              </Badge>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
                Conçu pour votre entreprise
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                Des commerçants aux grossistes, une solution qui grandit avec vous
              </p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {targetAudience.map((target, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <Card className="p-8 text-center bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all group hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/20 h-full flex flex-col items-center justify-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <target.icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                    {target.title}
                  </h3>
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                    {target.description}
                  </p>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section - White Background */}
      <section className="py-24 lg:py-32 bg-white relative">
        <div className="container mx-auto px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-20 max-w-3xl mx-auto">
              <Badge className="mb-6 bg-blue-100 text-blue-700 border-0 px-5 py-2.5 text-sm font-semibold">
                Bénéfices
              </Badge>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Pourquoi choisir Stocknix ?
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Une plateforme pensée pour simplifier votre quotidien d'entrepreneur
              </p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 max-w-7xl mx-auto">
            {benefits.map((benefit, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <div className="text-center space-y-6 p-6 rounded-2xl hover:bg-gray-50 transition-all group">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl shadow-xl shadow-blue-500/30 group-hover:scale-110 transition-transform">
                    <benefit.icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - Blue Background */}
      <section id="tarifs" className="py-24 lg:py-32 bg-gradient-to-br from-blue-50 via-blue-100/50 to-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.15),transparent_50%)]"></div>
        
        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-20 max-w-3xl mx-auto">
              <Badge className="mb-6 bg-blue-600 text-white border-0 px-5 py-2.5 text-sm font-semibold">
                Tarification
              </Badge>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Un prix simple et transparent
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed">
                Essayez gratuitement pendant 1 mois, sans engagement
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <Card className="max-w-4xl mx-auto p-8 lg:p-12 bg-white border-2 border-blue-100 shadow-2xl">
              <div className="text-center mb-10">
                <Badge className="mb-6 bg-green-100 text-green-700 border-0 px-4 py-2 text-sm font-semibold">
                  Le plus populaire
                </Badge>
                <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  Plan Professionnel
                </h3>
                <div className="flex items-baseline justify-center gap-2 mb-6">
                  <span className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-blue-600">
                    15€
                  </span>
                  <span className="text-2xl text-gray-600">/mois</span>
                </div>
                <p className="text-lg text-gray-600">
                  Tout ce dont vous avez besoin pour réussir
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                {pricingFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-base font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/auth')} 
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-xl text-lg px-12 py-7 rounded-xl font-bold transition-transform hover:scale-105"
                >
                  Commencer gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => navigate('/auth')}
                  className="text-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-12 py-7 rounded-xl font-bold"
                >
                  Voir la démo
                </Button>
              </div>

              <p className="text-center text-sm text-gray-500 mt-8">
                Sans engagement • Annulez à tout moment • Support inclus
              </p>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* Testimonials Section - White Background */}
      <section id="avis" className="py-24 lg:py-32 bg-white relative">
        <div className="container mx-auto px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-20 max-w-3xl mx-auto">
              <Badge className="mb-6 bg-blue-100 text-blue-700 border-0 px-5 py-2.5 text-sm font-semibold">
                Témoignages
              </Badge>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Ils nous font confiance
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Découvrez les retours de nos utilisateurs satisfaits
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <Card className="p-8 bg-white border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all h-full flex flex-col">
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 text-base leading-relaxed mb-8 flex-grow">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-14 h-14 bg-blue-600 rounded-full text-white text-lg font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section - Blue Background */}
      <section className="py-24 lg:py-32 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        
        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8">
                Prêt à transformer votre entreprise ?
              </h2>
              <p className="text-xl sm:text-2xl text-blue-50 mb-12 leading-relaxed">
                Rejoignez plus de 500 entreprises qui font confiance à Stocknix
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/auth')} 
                  className="bg-white text-blue-600 hover:bg-blue-50 shadow-2xl text-lg px-12 py-7 rounded-xl font-bold transition-transform hover:scale-105"
                >
                  Démarrer gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => navigate('/auth')}
                  className="text-lg border-2 border-white text-white hover:bg-white hover:text-blue-600 px-12 py-7 rounded-xl bg-transparent"
                >
                  Contacter l'équipe
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer - Black Background */}
      <footer className="bg-black text-white py-16 lg:py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
            <div className="col-span-2 md:col-span-1">
              <img src={stocknixLogo} alt="Stocknix" className="h-10 mb-6" />
              <p className="text-gray-400 text-sm leading-relaxed">
                La solution de gestion d'entreprise pensée pour les entrepreneurs africains
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4 text-sm">Produit</h4>
              <ul className="space-y-3">
                <li><a href="#fonctionnalites" className="text-gray-400 hover:text-white transition-colors text-sm">Fonctionnalités</a></li>
                <li><a href="#tarifs" className="text-gray-400 hover:text-white transition-colors text-sm">Tarifs</a></li>
                <li><a href="#avis" className="text-gray-400 hover:text-white transition-colors text-sm">Témoignages</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4 text-sm">Entreprise</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">À propos</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4 text-sm">Légal</h4>
              <ul className="space-y-3">
                <li><a href="/mentions-legales" className="text-gray-400 hover:text-white transition-colors text-sm">Mentions légales</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Confidentialité</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">CGU</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm text-center md:text-left">
                © 2025 Stocknix. Tous droits réservés.
              </p>
              <div className="flex gap-6">
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Twitter
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  LinkedIn
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Facebook
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
