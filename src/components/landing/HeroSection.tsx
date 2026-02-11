import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GlowOrb, GridPattern } from "./FloatingElements";
import { 
  ParallaxContainer, 
  AnimatedEntry
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

          {/* Right Content - Clean Stats */}
          <div className="relative hidden lg:block">
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              {[
                { label: "Entreprises actives", value: "500+", sub: "en Côte d'Ivoire" },
                { label: "Transactions/jour", value: "12K+", sub: "traitées en temps réel" },
                { label: "Taux de satisfaction", value: "98%", sub: "clients satisfaits" },
                { label: "Disponibilité", value: "99.9%", sub: "uptime garanti" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                  className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-5"
                >
                  <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm font-medium text-foreground">{stat.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.sub}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
