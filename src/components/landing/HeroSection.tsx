import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package, CreditCard, TrendingUp, Bell, Sparkles, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FloatingCard, StatsCard, DeviceMockup, GlowOrb, GridPattern } from "./FloatingElements";
import { 
  ParallaxContainer, 
  AnimatedEntry, 
  MouseParallax, 
  Floating3D,
  PerspectiveWrapper 
} from "./ImmersiveAnimations";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-20">
      {/* Background Elements with Parallax */}
      <ParallaxContainer depth="background" className="absolute inset-0 pointer-events-none">
        <GridPattern className="opacity-50" />
      </ParallaxContainer>
      
      {/* Animated Orbs with different depths */}
      <ParallaxContainer depth="background" className="absolute inset-0 pointer-events-none">
        <GlowOrb 
          color="primary" 
          size="xl" 
          className="absolute -top-20 -left-20" 
        />
        <GlowOrb 
          color="secondary" 
          size="lg" 
          className="absolute top-1/3 -right-20" 
        />
        <GlowOrb 
          color="accent" 
          size="md" 
          className="absolute -bottom-10 left-1/3" 
        />
      </ParallaxContainer>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Content */}
          <AnimatedEntry type="fade-zoom" className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                La solution #1 en Côte d'Ivoire
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight mb-6">
              <span className="text-foreground">Gérez votre</span>
              <br />
              <span className="text-gradient">commerce</span>
              <br />
              <span className="text-foreground">en toute</span>
              <span className="text-gradient-accent"> simplicité</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-8">
              Stocks, ventes, factures et analytics réunis dans une plateforme 
              intuitive et puissante. Conçu pour les entrepreneurs africains.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg"
                onClick={() => navigate('/auth')}
                className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary shadow-xl shadow-primary/25 font-semibold group"
              >
                Démarrer gratuitement
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate('/fonctionnalites')}
                className="text-lg px-8 py-6 border-2 border-border/60 font-semibold group"
              >
                <Play className="mr-2 h-5 w-5 text-primary" />
                Voir la démo
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4 mt-10 justify-center lg:justify-start">
              <div className="flex -space-x-3">
                {["K", "F", "I", "M", "A"].map((initial, i) => (
                  <div 
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-sm font-bold border-2 border-background"
                  >
                    {initial}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">500+ entreprises</p>
                <p className="text-xs text-muted-foreground">nous font confiance</p>
              </div>
            </div>
          </AnimatedEntry>

          {/* Right Content - 3D Scene */}
          <MouseParallax intensity={15} className="relative hidden lg:block">
            <PerspectiveWrapper>
              {/* Main Desktop Mockup */}
              <Floating3D amplitude={8} duration={6}>
                <DeviceMockup type="desktop" className="w-full max-w-[500px] mx-auto">
                  <div className="p-4 space-y-3 min-h-[280px]">
                    {/* Mini Dashboard */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-3 w-24 bg-primary/30 rounded" />
                      <div className="flex gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/20" />
                        <div className="h-6 w-6 rounded-full bg-muted" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Ventes", value: "2.4M", color: "bg-primary/20" },
                        { label: "Produits", value: "1,247", color: "bg-secondary/20" },
                        { label: "Clients", value: "892", color: "bg-success/20" }
                      ].map((stat, i) => (
                        <div key={i} className={`p-3 rounded-xl ${stat.color}`}>
                          <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                          <div className="text-sm font-bold text-foreground">{stat.value}</div>
                        </div>
                      ))}
                    </div>
                    <div className="h-24 bg-muted/30 rounded-xl flex items-end gap-1 p-3">
                      {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                        <motion.div 
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: 1 + i * 0.05, duration: 0.5 }}
                          className="flex-1 bg-gradient-to-t from-primary to-secondary rounded-t"
                        />
                      ))}
                    </div>
                  </div>
                </DeviceMockup>
              </Floating3D>

              {/* Mobile Mockup - Floating */}
              <div className="absolute -bottom-10 -left-10">
                <Floating3D amplitude={12} duration={5} delay={0.5}>
                  <DeviceMockup type="mobile" className="scale-75 origin-bottom-left">
                    <div className="p-3 space-y-2 min-h-[300px]">
                      <div className="h-2 w-16 bg-primary/30 rounded mx-auto" />
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 rounded-lg bg-primary/20">
                          <CreditCard size={16} className="text-primary mb-1" />
                          <div className="text-[8px] text-muted-foreground">Caisse</div>
                        </div>
                        <div className="p-2 rounded-lg bg-secondary/20">
                          <Package size={16} className="text-secondary mb-1" />
                          <div className="text-[8px] text-muted-foreground">Stocks</div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="flex gap-2 p-2 bg-muted/30 rounded-lg">
                            <div className="w-8 h-8 bg-muted rounded" />
                            <div className="flex-1 space-y-1">
                              <div className="h-2 w-full bg-muted rounded" />
                              <div className="h-2 w-2/3 bg-muted/60 rounded" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DeviceMockup>
                </Floating3D>
              </div>

              {/* Floating Stats Cards */}
              <div className="absolute -top-4 -right-4">
                <Floating3D amplitude={10} duration={4.5} delay={0.2}>
                  <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-4 shadow-xl min-w-[140px]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-primary/20">
                        <TrendingUp size={14} className="text-primary" />
                      </div>
                      <span className="text-xs text-muted-foreground">Croissance</span>
                    </div>
                    <div className="text-xl font-bold text-foreground">↑ 23%</div>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp size={12} className="text-success" />
                      <span className="text-xs text-success">+12% ce mois</span>
                    </div>
                  </div>
                </Floating3D>
              </div>
              
              <div className="absolute top-1/2 -right-16">
                <Floating3D amplitude={10} duration={5} delay={0.8}>
                  <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-4 shadow-xl min-w-[140px]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-primary/20">
                        <Package size={14} className="text-primary" />
                      </div>
                      <span className="text-xs text-muted-foreground">Produits</span>
                    </div>
                    <div className="text-xl font-bold text-foreground">1,247</div>
                  </div>
                </Floating3D>
              </div>

              <div className="absolute -bottom-4 right-20">
                <Floating3D amplitude={8} duration={4} delay={1.2}>
                  <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-3 shadow-xl flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-warning/20">
                      <Bell size={18} className="text-warning" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">Alerte Stock</p>
                      <p className="text-[10px] text-muted-foreground">Riz 5kg - Stock bas</p>
                    </div>
                  </div>
                </Floating3D>
              </div>
            </PerspectiveWrapper>
          </MouseParallax>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
