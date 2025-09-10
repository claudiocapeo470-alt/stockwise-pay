import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { BarChart3, Package, CreditCard, TrendingUp, Users, Shield, Smartphone, ArrowRight, CheckCircle, Menu, X } from "lucide-react";
import { useState } from "react";
const HomePage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const features = [{
    icon: Package,
    title: "Gestion des Stocks",
    description: "Suivez vos inventaires en temps réel avec des alertes automatiques"
  }, {
    icon: TrendingUp,
    title: "Ventes & Facturation",
    description: "Gérez vos ventes et factures facilement avec suivi complet"
  }, {
    icon: CreditCard,
    title: "Paiements",
    description: "Suivez tous vos paiements clients et fournisseurs"
  }, {
    icon: BarChart3,
    title: "Rapports Détaillés",
    description: "Analysez votre activité avec des rapports complets"
  }];
  const benefits = ["Interface intuitive et moderne", "Accès depuis mobile et desktop", "Données sécurisées dans le cloud", "Support client dédié"];
  return <div className="min-h-screen bg-background relative overflow-hidden">
      <AnimatedBackground />
      {/* Navigation */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">GestionPro</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#accueil" className="text-muted-foreground hover:text-foreground transition-colors">
                Accueil
              </a>
              <a href="#fonctionnalites" className="text-muted-foreground hover:text-foreground transition-colors">
                Fonctionnalités
              </a>
              <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </nav>

            {/* CTA Buttons - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                Se connecter
              </Button>
              <Button onClick={() => navigate('/auth')} className="bg-primary hover:bg-primary/90">
                S'inscrire
              </Button>
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && <div className="md:hidden py-4 border-t border-border">
              <nav className="flex flex-col space-y-4">
                <a href="#accueil" className="text-muted-foreground hover:text-foreground transition-colors">
                  Accueil
                </a>
                <a href="#fonctionnalites" className="text-muted-foreground hover:text-foreground transition-colors">
                  Fonctionnalités
                </a>
                <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </a>
                <div className="flex flex-col space-y-2 pt-4">
                  <Button variant="ghost" onClick={() => navigate('/auth')} className="w-full">
                    Se connecter
                  </Button>
                  <Button onClick={() => navigate('/auth')} className="w-full bg-primary hover:bg-primary/90">
                    S'inscrire
                  </Button>
                </div>
              </nav>
            </div>}
        </div>
      </header>

      {/* Hero Section */}
      <section id="accueil" className="py-20 lg:py-32 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            
            
            <h1 className="text-foreground mb-6 font-bold text-4xl lg:text-6xl">
              Gestion complète pour 
              <span className="text-primary"> PME/TPE</span>
            </h1>
            
            <p className="mb-8 max-w-2xl text-white/[0.97] text-lg sm:text-xl text-center mx-auto px-4 sm:px-6 lg:px-0">
              Simplifiez la gestion de votre entreprise avec notre solution tout-en-un : 
              stocks, ventes, paiements et rapports en temps réel.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/auth')} className="bg-primary hover:bg-primary/90 px-8">
                Commencer gratuitement
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
                Se connecter
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fonctionnalites" className="py-20 bg-muted/30 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Fonctionnalités complètes
            </h2>
            <p className="text-lg max-w-2xl mx-auto text-white">
              Toutes les fonctionnalités dont votre PME/TPE a besoin pour prospérer
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow border border-border">
                <feature.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </Card>)}
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-6">
                Pourquoi choisir GestionPro ?
              </h3>
              <div className="space-y-4">
                {benefits.map((benefit, index) => <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-white">{benefit}</span>
                  </div>)}
              </div>
              <Button className="mt-8 bg-primary hover:bg-primary/90" onClick={() => navigate('/auth')}>
                Démarrer maintenant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 border border-border">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card p-4 rounded-lg border border-border text-center">
                    <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-xs text-muted-foreground">Multi-utilisateurs</p>
                  </div>
                  <div className="bg-card p-4 rounded-lg border border-border text-center">
                    <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-xs text-muted-foreground">Sécurisé</p>
                  </div>
                  <div className="bg-card p-4 rounded-lg border border-border text-center">
                    <Smartphone className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-xs text-muted-foreground">Mobile</p>
                  </div>
                  <div className="bg-card p-4 rounded-lg border border-border text-center">
                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-xs text-muted-foreground">Analytics</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-12 text-center text-primary-foreground">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Prêt à transformer votre entreprise ?
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Rejoignez des centaines de PME/TPE qui font déjà confiance à GestionPro
            </p>
            <Button size="lg" variant="secondary" onClick={() => navigate('/auth')} className="px-8">
              Créer mon compte gratuitement
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-border bg-muted/30 py-12 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <BarChart3 className="h-6 w-6 text-primary" />
              <span className="font-semibold text-foreground">GestionPro</span>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">
                © 2024 GestionPro. Tous droits réservés.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Solution SaaS pour PME/TPE Africaines
              </p>
              <div className="mt-2">
                <a 
                  href="/mentions-legales" 
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
                >
                  Mentions légales
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default HomePage;