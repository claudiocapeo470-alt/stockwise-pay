import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Monitor, Smartphone, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GlowOrb, GridPattern } from "./FloatingElements";
import { 
  ParallaxContainer, 
  AnimatedEntry,
  Floating3D 
} from "./ImmersiveAnimations";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
      <ParallaxContainer depth="background" className="absolute inset-0 pointer-events-none">
        <GridPattern className="opacity-30" />
        <GlowOrb color="primary" size="xl" className="absolute -left-20 top-1/4" />
        <GlowOrb color="secondary" size="xl" className="absolute -right-20 bottom-1/4" />
      </ParallaxContainer>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Devices Illustration */}
          <AnimatedEntry type="fade-zoom">
            <div className="relative mb-12">
              <div className="flex items-end justify-center gap-4">
                {/* Desktop */}
                <Floating3D amplitude={12} duration={5}>
                  <div className="relative">
                    <div className="w-48 h-32 bg-card/80 rounded-xl border-2 border-primary/30 shadow-glow flex items-center justify-center backdrop-blur-xl">
                      <Monitor size={48} className="text-primary" />
                    </div>
                  </div>
                </Floating3D>

                {/* Mobile */}
                <Floating3D amplitude={12} duration={5} delay={0.5}>
                  <div className="relative -ml-8">
                    <div className="w-20 h-36 bg-card/80 rounded-2xl border-2 border-secondary/30 shadow-glow flex items-center justify-center backdrop-blur-xl">
                      <Smartphone size={32} className="text-secondary" />
                    </div>
                  </div>
                </Floating3D>
              </div>

              {/* Sparkles */}
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-0 right-1/3"
              >
                <Sparkles className="text-primary h-6 w-6" />
              </motion.div>
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="absolute bottom-4 left-1/3"
              >
                <Sparkles className="text-secondary h-4 w-4" />
              </motion.div>
            </div>
          </AnimatedEntry>

          {/* Content */}
          <AnimatedEntry type="fade-zoom" delay={0.2}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6">
              <span className="text-foreground">Prêt à transformer</span>
              <br />
              <span className="text-gradient">votre commerce ?</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Rejoignez plus de 500 entreprises qui utilisent Stocknix pour gérer 
              leur activité plus efficacement. Essai gratuit, sans engagement.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => navigate('/auth')}
                className="text-lg px-10 py-7 bg-gradient-to-r from-primary to-secondary shadow-xl shadow-primary/25 font-bold group"
              >
                Démarrer avec Stocknix
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate('/tarifs')}
                className="text-lg px-10 py-7 border-2 border-border/60 font-semibold"
              >
                Voir les tarifs
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 mt-10 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                Essai gratuit
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                Sans carte bancaire
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                Support 24/7
              </div>
            </div>
          </AnimatedEntry>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
