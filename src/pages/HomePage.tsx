import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { ScrollReveal, ParallaxElement, MorphingBlob, InteractiveParticles } from "@/components/ui/scroll-animations";
import { AnimatedElement, StaggerContainer, FloatingElement, MagneticElement } from "@/components/ui/enhanced-animations";
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
        <InteractiveParticles count={30} className="opacity-30" />
        <MorphingBlob 
          size={400} 
          className="absolute top-10 right-10 opacity-20 pointer-events-none" 
          colors={["var(--primary)", "var(--accent)"]}
        />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <ScrollReveal delay={200}>
              <FloatingElement amplitude={15} speed={2}>
                <h1 className="lg:text-6xl text-foreground mb-6 font-bold text-5xl">
                  <AnimatedElement type="slide" direction="up" delay={300}>
                    Gestion complète pour 
                  </AnimatedElement>
                  <AnimatedElement type="scale" delay={600}>
                    <span className="text-primary"> PME/TPE</span>
                  </AnimatedElement>
                </h1>
              </FloatingElement>
            </ScrollReveal>
            
            <ScrollReveal delay={400}>
              <AnimatedElement type="fade" delay={800}>
                <p className="mb-8 max-w-2xl mx-auto text-white/[0.97] text-3xl">
                  Simplifiez la gestion de votre entreprise avec notre solution tout-en-un : 
                  stocks, ventes, paiements et rapports en temps réel.
                </p>
              </AnimatedElement>
            </ScrollReveal>
            
            <ScrollReveal delay={600}>
              <StaggerContainer staggerDelay={150}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <MagneticElement strength={0.2}>
                    <Button size="lg" onClick={() => navigate('/auth')} className="bg-primary hover:bg-primary/90 px-8 hover-lift">
                      Commencer gratuitement
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </MagneticElement>
                  <MagneticElement strength={0.2}>
                    <Button size="lg" variant="outline" onClick={() => navigate('/auth')} className="hover-lift">
                      Se connecter
                    </Button>
                  </MagneticElement>
                </div>
              </StaggerContainer>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fonctionnalites" className="py-20 bg-muted/30 relative z-10">
        <ParallaxElement speed={0.3} className="absolute inset-0 pointer-events-none">
          <MorphingBlob 
            size={300} 
            className="absolute top-20 left-10 opacity-10" 
            colors={["var(--accent)", "var(--primary)"]}
            speed="15s"
          />
        </ParallaxElement>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal delay={100}>
            <div className="text-center mb-16">
              <AnimatedElement type="slide" direction="up" delay={200}>
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                  Fonctionnalités complètes
                </h2>
              </AnimatedElement>
              <AnimatedElement type="fade" delay={400}>
                <p className="text-lg max-w-2xl mx-auto text-white">
                  Toutes les fonctionnalités dont votre PME/TPE a besoin pour prospérer
                </p>
              </AnimatedElement>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => (
              <ScrollReveal key={index} delay={100 + index * 150}>
                <MagneticElement strength={0.15}>
                  <FloatingElement amplitude={8} speed={1.5} delay={index * 0.5}>
                    <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 border border-border bg-card/50 backdrop-blur-sm hover-lift group">
                      <AnimatedElement type="rotate" delay={300 + index * 100}>
                        <feature.icon className="h-12 w-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                      </AnimatedElement>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {feature.description}
                      </p>
                    </Card>
                  </FloatingElement>
                </MagneticElement>
              </ScrollReveal>
            ))}
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollReveal delay={200}>
              <div>
                <AnimatedElement type="slide" direction="left" delay={300}>
                  <h3 className="text-2xl font-bold text-foreground mb-6">
                    Pourquoi choisir GestionPro ?
                  </h3>
                </AnimatedElement>
                <StaggerContainer staggerDelay={100}>
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-white">{benefit}</span>
                    </div>
                  ))}
                </StaggerContainer>
                <AnimatedElement type="scale" delay={800}>
                  <MagneticElement strength={0.2}>
                    <Button className="mt-8 bg-primary hover:bg-primary/90 hover-lift" onClick={() => navigate('/auth')}>
                      Démarrer maintenant
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </MagneticElement>
                </AnimatedElement>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <ParallaxElement speed={0.2}>
                <div className="relative">
                  <FloatingElement amplitude={12} speed={1.8}>
                    <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 border border-border backdrop-blur-sm">
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { icon: Users, label: "Multi-utilisateurs" },
                          { icon: Shield, label: "Sécurisé" },
                          { icon: Smartphone, label: "Mobile" },
                          { icon: BarChart3, label: "Analytics" }
                        ].map((item, index) => (
                          <AnimatedElement key={index} type="rotate" delay={500 + index * 100}>
                            <MagneticElement strength={0.1}>
                              <div className="bg-card/80 p-4 rounded-lg border border-border text-center hover-lift transition-all duration-300 group backdrop-blur-sm">
                                <item.icon className="h-6 w-6 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform duration-300" />
                                <p className="text-xs text-muted-foreground">{item.label}</p>
                              </div>
                            </MagneticElement>
                          </AnimatedElement>
                        ))}
                      </div>
                    </div>
                  </FloatingElement>
                </div>
              </ParallaxElement>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative z-10">
        <ParallaxElement speed={0.4} className="absolute inset-0 pointer-events-none">
          <InteractiveParticles count={25} className="opacity-20" />
        </ParallaxElement>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal delay={200}>
            <FloatingElement amplitude={10} speed={2.5}>
              <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-12 text-center text-primary-foreground relative overflow-hidden">
                <MorphingBlob 
                  size={200} 
                  className="absolute top-4 right-4 opacity-20 pointer-events-none" 
                  colors={["hsl(var(--primary-foreground))", "hsl(var(--accent-foreground))"]}
                  speed="12s"
                />
                
                <AnimatedElement type="scale" delay={300}>
                  <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                    Prêt à transformer votre entreprise ?
                  </h2>
                </AnimatedElement>
                
                <AnimatedElement type="fade" delay={500}>
                  <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
                    Rejoignez des centaines de PME/TPE qui font déjà confiance à GestionPro
                  </p>
                </AnimatedElement>
                
                <AnimatedElement type="slide" direction="up" delay={700}>
                  <MagneticElement strength={0.3}>
                    <Button size="lg" variant="secondary" onClick={() => navigate('/auth')} className="px-8 hover-lift">
                      Créer mon compte gratuitement
                    </Button>
                  </MagneticElement>
                </AnimatedElement>
              </div>
            </FloatingElement>
          </ScrollReveal>
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
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default HomePage;