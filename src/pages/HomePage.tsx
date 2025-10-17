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
import heroDashboard from '@/assets/3d-dashboard-hero.png';
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
      image: analyticsFeature,
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
    <div className="min-h-screen bg-white relative overflow-hidden">
      
      {/* Navigation */}
      <header className="border-b border-gray-100 bg-white/95 backdrop-blur sticky top-0 z-50 relative shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3">
              <img src={stocknixLogo} alt="Stocknix" className="h-12" />
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <a href="#accueil" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Accueil
              </a>
              <a href="#fonctionnalites" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Fonctionnalités
              </a>
              <a href="#pour-qui" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Pour qui ?
              </a>
              <a href="#tarifs" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Tarifs
              </a>
              <a href="#avis" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Avis
              </a>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/auth')} className="text-gray-700 hover:text-blue-600">
                Se connecter
              </Button>
              <Button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-500/30">
                Essai gratuit
                <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-4">
                <a href="#accueil" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                  Accueil
                </a>
                <a href="#fonctionnalites" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                  Fonctionnalités
                </a>
                <a href="#pour-qui" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                  Pour qui ?
                </a>
                <a href="#tarifs" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                  Tarifs
                </a>
                <a href="#avis" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                  Avis
                </a>
                <div className="flex flex-col space-y-2 pt-4">
                  <Button variant="ghost" onClick={() => navigate('/auth')} className="w-full">
                    Se connecter
                  </Button>
                  <Button onClick={() => navigate('/auth')} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white">
                    Essai gratuit
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Blue Background */}
      <section id="accueil" className="py-20 lg:py-32 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
              <div className="space-y-8">
                <Badge className="bg-white/20 text-white border-0 px-5 py-2.5 text-sm font-semibold backdrop-blur">
                  <Sparkles className="h-4 w-4 mr-2" />
                  1 mois gratuit • Sans engagement
                </Badge>
                
                <h1 className="text-white font-extrabold text-5xl lg:text-7xl leading-tight">
                  Transformez votre business en quelques clics
                </h1>
                
                <p className="text-blue-50 text-xl sm:text-2xl max-w-2xl leading-relaxed">
                  Gérez stocks, ventes et finances intelligemment. La plateforme moderne qui accompagne votre croissance.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/auth')} 
                    className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl text-lg px-10 py-7 rounded-xl font-bold"
                  >
                    Démarrer gratuitement
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={() => navigate('/auth')}
                    className="text-lg border-2 border-white text-white hover:bg-white hover:text-blue-600 px-10 py-7 rounded-xl bg-transparent"
                  >
                    Voir la démo
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-8 pt-8 bg-white/10 backdrop-blur rounded-2xl p-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white">500+</div>
                    <div className="text-sm text-blue-100 font-medium mt-1">Entreprises</div>
                  </div>
                  <div className="text-center border-l border-r border-white/20">
                    <div className="text-4xl font-bold text-white">4.9/5</div>
                    <div className="text-sm text-blue-100 font-medium flex items-center gap-1 justify-center mt-1">
                      <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
                      Satisfaction
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white">24/7</div>
                    <div className="text-sm text-blue-100 font-medium mt-1">Support</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full"></div>
                <img 
                  src={heroDashboard} 
                  alt="Dashboard moderne Stocknix" 
                  className="relative z-10 w-full h-auto rounded-3xl shadow-2xl"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fonctionnalites" className="py-24 bg-white relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-20">
              <Badge className="mb-6 bg-blue-100 text-blue-700 border-0 px-4 py-2 text-sm font-semibold">
                Fonctionnalités
              </Badge>
              <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                Tout ce dont vous avez besoin
              </h2>
              <p className="text-xl max-w-3xl mx-auto text-gray-600">
                Des outils puissants et intuitifs pour gérer votre entreprise avec simplicité
              </p>
            </div>
          </ScrollReveal>

          <div className="space-y-32">
            {features.map((feature, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <div className={`grid lg:grid-cols-2 gap-16 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                    <div className="space-y-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl">
                        <feature.icon className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-4xl font-bold text-gray-900">
                        {feature.title}
                      </h3>
                      <p className="text-xl text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                      <div className="space-y-4 pt-4">
                        {feature.benefits.map((benefit, i) => (
                          <div key={i} className="flex items-center gap-4">
                            <div className="flex-shrink-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-gray-700 text-lg">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                    <div className="relative p-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl">
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
      <section id="pour-qui" className="py-24 bg-gradient-to-b from-gray-900 via-black to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white-pattern opacity-5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-20">
              <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-0 px-4 py-2 text-sm font-semibold">
                Pour qui ?
              </Badge>
              <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
                Conçu pour votre entreprise
              </h2>
              <p className="text-xl max-w-3xl mx-auto text-gray-300">
                Des commerçants aux grossistes, une solution qui grandit avec vous
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {targetAudience.map((target, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <Card className="p-8 text-center bg-white/5 backdrop-blur border-white/10 hover:bg-white/10 transition-all group hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/20">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <target.icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {target.title}
                  </h3>
                  <p className="text-gray-300">
                    {target.description}
                  </p>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section - White Background */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-20">
              <Badge className="mb-6 bg-blue-100 text-blue-700 border-0 px-4 py-2 text-sm font-semibold">
                Bénéfices
              </Badge>
              <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                Pourquoi choisir Stocknix ?
              </h2>
              <p className="text-xl max-w-3xl mx-auto text-gray-600">
                Une plateforme pensée pour simplifier votre quotidien d'entrepreneur
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {benefits.map((benefit, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <div className="text-center space-y-6 p-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl shadow-xl shadow-blue-500/30">
                    <benefit.icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 text-lg">
                    {benefit.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - Light Blue Background */}
      <section id="tarifs" className="py-24 bg-gradient-to-br from-blue-50 via-white to-blue-50 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-20">
              <Badge className="mb-6 bg-amber-100 text-amber-700 border-0 px-4 py-2 text-sm font-semibold">
                Tarifs
              </Badge>
              <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                Un tarif simple et transparent
              </h2>
              <p className="text-xl max-w-3xl mx-auto text-gray-600">
                Commencez gratuitement, continuez pour le prix d'un café par jour
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="max-w-3xl mx-auto">
              <Card className="relative overflow-hidden border-2 border-blue-200 shadow-2xl bg-white">
                <div className="absolute top-0 right-0 bg-gradient-to-br from-blue-600 to-blue-500 text-white px-8 py-3 rounded-bl-3xl">
                  <span className="font-bold text-lg">Recommandé</span>
                </div>
                
                <div className="p-10 lg:p-16">
                  <div className="text-center mb-12">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">Plan Professionnel</h3>
                    <div className="flex items-baseline justify-center gap-3">
                      <span className="text-7xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                        1000
                      </span>
                      <span className="text-3xl text-gray-500 font-semibold">FCFA</span>
                      <span className="text-xl text-gray-500">/mois</span>
                    </div>
                    <Badge className="mt-6 bg-green-100 text-green-700 border-0 px-4 py-2 text-base">
                      <Sparkles className="h-4 w-4 mr-2" />
                      1er mois GRATUIT
                    </Badge>
                  </div>

                  <div className="space-y-5 mb-10">
                    {pricingFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-gray-700 text-lg">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-xl shadow-blue-500/30 text-xl py-8 rounded-xl"
                    onClick={() => navigate('/auth')}
                  >
                    Commencer mon essai gratuit
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>

                  <p className="text-center text-gray-500 mt-6 text-base">
                    Sans engagement • Annulez à tout moment
                  </p>
                </div>
              </Card>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="avis" className="py-24 bg-gradient-to-b from-gray-50 to-white relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-20">
              <Badge className="mb-6 bg-blue-100 text-blue-700 border-0 px-4 py-2 text-sm font-semibold">
                Témoignages
              </Badge>
              <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                Ils nous font confiance
              </h2>
              <p className="text-xl max-w-3xl mx-auto text-gray-600">
                Rejoignez des centaines d'entrepreneurs satisfaits
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <Card className="p-8 hover:shadow-2xl transition-all border-gray-200 h-full bg-white hover:border-blue-300">
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-6 w-6 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-8 text-lg italic leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-lg">{testimonial.name}</div>
                      <div className="text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 rounded-3xl p-16 lg:p-24 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute inset-0 bg-grid-white-pattern opacity-10"></div>
              <div className="relative z-10 space-y-8">
                <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
                  Prêt à transformer votre business ?
                </h2>
                <p className="text-xl lg:text-2xl text-white/95 max-w-3xl mx-auto mb-10 leading-relaxed">
                  Rejoignez des centaines d'entrepreneurs qui font déjà confiance à Stocknix
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/auth')} 
                    className="bg-white text-blue-600 hover:bg-gray-50 px-12 py-8 text-xl rounded-xl shadow-2xl font-semibold"
                  >
                    Créer mon compte gratuitement
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>
                </div>
                <p className="text-white/90 text-lg pt-4">
                  ✨ 1 mois gratuit • Sans carte bancaire • Support 24/7
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer - Black Background */}
      <footer className="bg-black text-gray-300 py-16 relative border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-5">
              <div className="flex items-center space-x-3">
                <img src={stocknixLogo} alt="Stocknix" className="h-12" />
              </div>
              <p className="text-gray-400 leading-relaxed">
                La solution moderne de gestion pour PME/TPE en Afrique
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-5 text-lg">Produit</h4>
              <ul className="space-y-3">
                <li><a href="#fonctionnalites" className="text-gray-400 hover:text-blue-400 transition-colors">Fonctionnalités</a></li>
                <li><a href="#tarifs" className="text-gray-400 hover:text-blue-400 transition-colors">Tarifs</a></li>
                <li><a href="#avis" className="text-gray-400 hover:text-blue-400 transition-colors">Témoignages</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-5 text-lg">Entreprise</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">À propos</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Carrières</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-5 text-lg">Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Contact</a></li>
                <li><a href="/mentions-legales" className="text-gray-400 hover:text-blue-400 transition-colors">Mentions légales</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400">
              © 2025 Stocknix. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Politique de confidentialité</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">CGU</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
