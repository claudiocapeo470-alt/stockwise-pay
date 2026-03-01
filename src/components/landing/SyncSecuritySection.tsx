import { motion } from "framer-motion";
import { Monitor, Smartphone, Cloud, Shield, Lock, RefreshCw, Wifi, CheckCircle } from "lucide-react";
import { GlowOrb, GridPattern } from "./FloatingElements";
import { 
  ParallaxContainer, 
  AnimatedEntry, 
  StaggerContainer, 
  StaggerItem,
  DisplacementMotion,
  Floating3D 
} from "./ImmersiveAnimations";

// Synchronisation Section
export const SyncSection = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      <ParallaxContainer depth="background" className="absolute inset-0 pointer-events-none">
        <GridPattern className="opacity-20" />
        <GlowOrb color="secondary" size="xl" className="absolute left-1/4 top-0" />
        <GlowOrb color="primary" size="lg" className="absolute right-1/4 bottom-0" />
      </ParallaxContainer>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <AnimatedEntry type="fade-zoom">
            <div>
              <span className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-sm font-medium text-secondary mb-4">
                🔄 Synchronisation
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                <span className="text-foreground">Travaillez </span>
                <span className="text-gradient">partout</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Vos données synchronisées en temps réel sur tous vos appareils. 
                Au bureau, en boutique ou en déplacement.
              </p>

              <StaggerContainer className="grid grid-cols-2 gap-4" staggerDelay={0.08}>
                {[
                  { icon: Wifi, label: "Temps réel" },
                  { icon: RefreshCw, label: "Sync auto" },
                  { icon: Cloud, label: "Cloud sécurisé" },
                  { icon: CheckCircle, label: "Multi-appareils" },
                ].map((feature, i) => (
                  <StaggerItem key={i}>
                    <div className="bg-card/60 backdrop-blur-sm rounded-xl p-4 text-center transition-colors">
                      <feature.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                      <div className="text-sm font-medium text-foreground">{feature.label}</div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </AnimatedEntry>

          {/* Visual */}
          <DisplacementMotion direction="up" distance={15}>
            <AnimatedEntry type="fade-zoom" delay={0.2}>
              <div className="relative flex items-center justify-center gap-8 lg:gap-16">
                {/* Desktop */}
                <Floating3D amplitude={8} duration={5}>
                  <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-4">
                    <div className="w-32 h-20 bg-muted/30 rounded-lg flex items-center justify-center">
                      <Monitor size={40} className="text-primary" />
                    </div>
                    <div className="text-center mt-2">
                      <div className="text-xs font-medium text-foreground">PC Bureau</div>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span className="text-[10px] text-success">Connecté</span>
                      </div>
                    </div>
                  </div>
                </Floating3D>

                {/* Cloud */}
                <motion.div 
                  className="relative z-10"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-secondary p-[3px] shadow-glow">
                    <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                      <Cloud size={40} className="text-primary" />
                    </div>
                  </div>
                </motion.div>

                {/* Mobile */}
                <Floating3D amplitude={8} duration={5} delay={1}>
                  <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-4">
                    <div className="w-20 h-32 bg-muted/30 rounded-lg flex items-center justify-center">
                      <Smartphone size={32} className="text-secondary" />
                    </div>
                    <div className="text-center mt-2">
                      <div className="text-xs font-medium text-foreground">Mobile</div>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <RefreshCw size={10} className="text-primary animate-spin" style={{ animationDuration: '3s' }} />
                        <span className="text-[10px] text-primary">Sync</span>
                      </div>
                    </div>
                  </div>
                </Floating3D>
              </div>
            </AnimatedEntry>
          </DisplacementMotion>
        </div>
      </div>
    </section>
  );
};

// Security Section
export const SecuritySection = () => {
  const securityFeatures = [
    { icon: Shield, title: "Protection avancée", description: "Chiffrement de bout en bout" },
    { icon: Lock, title: "Accès sécurisé", description: "Authentification 2FA" },
    { icon: Cloud, title: "Sauvegarde auto", description: "Données préservées" },
    { icon: CheckCircle, title: "Conformité", description: "RGPD & standards" },
  ];

  return (
    <section className="relative py-24 overflow-hidden bg-muted/10">
      <ParallaxContainer depth="background" className="absolute inset-0 pointer-events-none">
        <GlowOrb color="accent" size="xl" className="absolute -right-40 top-1/3" />
      </ParallaxContainer>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <AnimatedEntry type="fade-zoom">
            <div>
              <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-sm font-medium text-accent mb-4">
                🔐 Sécurité
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                <span className="text-foreground">Vos données </span>
                <span className="text-gradient-accent">protégées</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Sécurité de niveau entreprise pour protéger vos données commerciales. 
                Chiffrement, sauvegardes automatiques et conformité garantis.
              </p>
              
              <StaggerContainer className="grid sm:grid-cols-2 gap-4" staggerDelay={0.1}>
                {securityFeatures.map((feature, index) => (
                  <StaggerItem key={index}>
                    <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-4 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-accent/20">
                          <feature.icon size={20} className="text-accent" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground text-sm mb-1">{feature.title}</h4>
                          <p className="text-xs text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </AnimatedEntry>

          {/* Visual */}
          <DisplacementMotion direction="up" distance={20}>
            <AnimatedEntry type="fade-zoom" delay={0.2}>
              <div className="relative flex justify-center">
                <Floating3D amplitude={15} duration={6}>
                  <div className="relative">
                    <div className="w-48 h-56 rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent p-[3px] shadow-glow">
                      <div className="w-full h-full rounded-3xl bg-card flex items-center justify-center">
                        <Shield size={80} className="text-primary" />
                      </div>
                    </div>
                    
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0"
                      style={{ width: '300px', height: '300px', left: '-50px', top: '-25px' }}
                    >
                      <div className="absolute top-0 left-1/2 -translate-x-1/2">
                        <div className="p-2 rounded-full bg-card/80 backdrop-blur-sm">
                          <Lock size={16} className="text-primary" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                        <div className="p-2 rounded-full bg-card/80 backdrop-blur-sm">
                          <Cloud size={16} className="text-secondary" />
                        </div>
                      </div>
                      <div className="absolute left-0 top-1/2 -translate-y-1/2">
                        <div className="p-2 rounded-full bg-card/80 backdrop-blur-sm">
                          <CheckCircle size={16} className="text-success" />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </Floating3D>
              </div>
            </AnimatedEntry>
          </DisplacementMotion>
        </div>
      </div>
    </section>
  );
};
