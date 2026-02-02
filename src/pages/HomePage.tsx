import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { BarChart3, Package, CreditCard, TrendingUp, Users, Shield, Smartphone, ArrowRight, CheckCircle, Menu, X, Star, Zap, Clock, Store, ShoppingBag, Building2, Check, Sparkles, ChevronDown, Bell, FileText, Scan, Download, Upload, AlertTriangle, DollarSign, ChevronLeft, ChevronRight, Globe, Heart, Rocket, Play, MousePointer } from "lucide-react";
import { useState, useCallback } from "react";
import useEmblaCarousel from 'embla-carousel-react';
import stocknixLogo from '@/assets/stocknix-logo.png';

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

  const mainFeatures = [
    {
      icon: Package,
      title: "Gestion des Stocks",
      description: "Suivi en temps réel de votre inventaire avec alertes automatiques",
      items: ["Suivi en temps réel", "Alertes stock bas", "Import/Export", "Scanner Code-barres"]
    },
    {
      icon: ShoppingBag,
      title: "Caisse & POS",
      description: "Encaissement rapide et professionnel pour vos clients",
      items: ["Caisse tactile", "Multi-paiements", "Mobile Money", "Tickets automatiques"]
    },
    {
      icon: FileText,
      title: "Facturation",
      description: "Devis et factures professionnels en quelques clics",
      items: ["Devis personnalisés", "Factures pro", "Export PDF", "Suivi paiements"]
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Rapports détaillés pour piloter votre activité",
      items: ["Graphiques temps réel", "Rapports détaillés", "Prévisions", "Exports"]
    }
  ];

  const testimonials = [
    {
      name: "Kouamé A.",
      role: "Gérant de supermarché",
      image: "K",
      content: "Stocknix a transformé ma gestion. Je gagne 2h par jour sur l'inventaire !",
      rating: 5
    },
    {
      name: "Fatou D.",
      role: "Boutique mode",
      image: "F",
      content: "Simple, efficace, adapté à nos réalités. Le support est excellent.",
      rating: 5
    },
    {
      name: "Ibrahim K.",
      role: "Grossiste",
      image: "I",
      content: "Mes ventes ont augmenté de 30% grâce au suivi précis des stocks.",
      rating: 5
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Créez votre compte",
      description: "Inscription gratuite en 2 minutes, sans carte bancaire"
    },
    {
      number: "2",
      title: "Ajoutez vos produits",
      description: "Importez votre catalogue ou scannez vos articles"
    },
    {
      number: "3",
      title: "Gérez votre business",
      description: "Vendez, facturez, analysez - tout en un seul endroit"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b border-border/60 bg-background/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            <img src={stocknixLogo} alt="Stocknix" className="h-10 sm:h-11 w-auto" />

            <nav className="hidden lg:flex items-center space-x-8">
              {["Fonctionnalités", "Pour qui ?", "Tarifs", "FAQ"].map((item) => (
                <a
                  key={item}
                  href={item === "Tarifs" ? "/tarifs" : item === "FAQ" ? "/faq" : `#${item.toLowerCase().replace(/\s|\?/g, '')}`}
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
                >
                  {item}
                </a>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/auth')} className="font-medium">
                Connexion
              </Button>
              <Button onClick={() => navigate('/auth')} className="bg-primary hover:bg-primary/90 font-semibold shadow-lg shadow-primary/20">
                Essai Gratuit
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-border/60">
              <nav className="flex flex-col space-y-3">
                {["Fonctionnalités", "Pour qui ?", "Tarifs", "FAQ"].map((item) => (
                  <a
                    key={item}
                    href={item === "Tarifs" ? "/tarifs" : item === "FAQ" ? "/faq" : `#${item.toLowerCase()}`}
                    className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item}
                  </a>
                ))}
                <div className="flex flex-col gap-2 pt-3">
                  <Button variant="outline" onClick={() => navigate('/auth')} className="w-full">
                    Connexion
                  </Button>
                  <Button onClick={() => navigate('/auth')} className="w-full">
                    Essai Gratuit
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Inspiré Chariow */}
      <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
        {/* Background subtil */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.08),transparent)]" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <ScrollReveal>
              {/* Badge */}
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 mr-2" />
                Essai Gratuit • Sans Engagement
              </Badge>
              
              {/* Titre principal */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-foreground leading-tight mb-6">
                La plateforme tout-en-un pour{" "}
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  gérer votre commerce
                </span>
              </h1>
              
              {/* Sous-titre */}
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                Stocks, ventes, factures, paiements et analytics - tout ce dont vous avez besoin pour développer votre business en Côte d'Ivoire.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/auth')} 
                  className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/25 font-semibold"
                >
                  Créer mon compte gratuit
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => navigate('/fonctionnalites')}
                  className="text-lg px-8 py-6 border-2 font-semibold"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Voir la démo
                </Button>
              </div>
              
              {/* Social Proof */}
              <div className="flex items-center justify-center gap-6">
                <div className="flex -space-x-3">
                  {["K", "F", "I", "M", "A"].map((initial, i) => (
                    <div 
                      key={i} 
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold border-2 border-background"
                    >
                      {initial}
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1 mb-0.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">
                    500+ entreprises satisfaites
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Fonctionnalités - Grid moderne */}
      <section id="fonctionnalités" className="py-20 sm:py-28 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <Badge className="mb-4 bg-accent/10 text-accent border-accent/20 px-4 py-2">
                Fonctionnalités
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Tout ce dont vous avez besoin
              </h2>
              <p className="text-lg text-muted-foreground">
                Une solution complète pour gérer votre commerce efficacement
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {mainFeatures.map((feature, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <Card className="group p-6 bg-card border-2 border-border/60 hover:border-primary/30 hover:shadow-xl transition-all duration-300 h-full">
                  <div className="mb-5">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche - Style Chariow */}
      <section className="py-20 sm:py-28 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <Badge className="mb-4 bg-success/10 text-success border-success/20 px-4 py-2">
                Comment ça marche ?
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Démarrez en 3 étapes simples
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <ScrollReveal key={index} delay={index * 150}>
                <div className="relative text-center">
                  {/* Ligne de connexion */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                  )}
                  
                  {/* Numéro */}
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20">
                    <span className="text-4xl font-black text-white">{step.number}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-20 sm:py-28 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-2">
                Témoignages
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Ils réussissent avec Stocknix
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <Card className="p-6 bg-card border-2 border-border/60 h-full">
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-foreground mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.image}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-primary via-accent to-primary relative overflow-hidden">
        {/* Effets décoratifs */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
        <div className="absolute top-10 right-10 w-32 h-32 border-2 border-white/20 rounded-full" />
        <div className="absolute bottom-10 left-10 w-24 h-24 border-2 border-white/10 rotate-45" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Commencez à vendre des produits<br />dès aujourd'hui !
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Rejoignez les 500+ entreprises qui ont choisi Stocknix
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-white text-primary hover:bg-white/90 text-lg px-10 py-7 font-bold shadow-2xl"
            >
              Créer votre boutique
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <img src={stocknixLogo} alt="Stocknix" className="h-10 mb-4" />
              <p className="text-sm text-muted-foreground">
                Logiciel de gestion complet pour PME et TPE en Côte d'Ivoire
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-foreground">Produit</h3>
              <div className="space-y-2 text-sm">
                <a href="/fonctionnalites" className="block text-muted-foreground hover:text-primary transition-colors">Fonctionnalités</a>
                <a href="/tarifs" className="block text-muted-foreground hover:text-primary transition-colors">Tarifs</a>
                <a href="/faq" className="block text-muted-foreground hover:text-primary transition-colors">FAQ</a>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-foreground">Entreprise</h3>
              <div className="space-y-2 text-sm">
                <a href="/legal" className="block text-muted-foreground hover:text-primary transition-colors">Mentions Légales</a>
                <p className="text-muted-foreground">Par DESCHNIX</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-foreground">Contact</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>support@stocknix.space</p>
                <p>Côte d'Ivoire</p>
              </div>
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground border-t border-border/60 pt-8">
            <p>© 2025 Stocknix par DESCHNIX. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
