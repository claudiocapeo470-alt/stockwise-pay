import { motion } from "framer-motion";
import { Monitor, Smartphone, Cloud, Shield, Lock, RefreshCw, Wifi, CheckCircle } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { FloatingCard, GlowOrb, GridPattern } from "./FloatingElements";

// Synchronisation Section
export const SyncSection = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      <GridPattern className="opacity-20" />
      <GlowOrb color="secondary" size="xl" className="absolute left-1/4 top-0" />
      <GlowOrb color="primary" size="lg" className="absolute right-1/4 bottom-0" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full glass-strong border border-secondary/30 text-sm font-medium text-secondary mb-4">
              🔄 Synchronisation
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-foreground">Travaillez </span>
              <span className="text-gradient">partout</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Vos données synchronisées en temps réel sur tous vos appareils. 
              Au bureau, en boutique ou en déplacement.
            </p>
          </div>
        </ScrollReveal>

        {/* Devices Illustration */}
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-8 lg:gap-16">
            {/* Desktop */}
            <ScrollReveal delay={100}>
              <motion.div 
                className="relative"
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="glass-strong rounded-2xl p-4 border border-border/40">
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
              </motion.div>
            </ScrollReveal>

            {/* Cloud - Center */}
            <ScrollReveal delay={200}>
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
                
                {/* Connection Lines */}
                <svg className="absolute inset-0 w-full h-full -z-10" style={{ transform: 'scale(3)' }}>
                  <motion.line
                    x1="0" y1="50%" x2="30%" y2="50%"
                    stroke="url(#line-gradient)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                  <motion.line
                    x1="70%" y1="50%" x2="100%" y2="50%"
                    stroke="url(#line-gradient)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.7 }}
                  />
                  <defs>
                    <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                      <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
                      <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            </ScrollReveal>

            {/* Mobile */}
            <ScrollReveal delay={300}>
              <motion.div 
                className="relative"
                animate={{ y: [5, -5, 5] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="glass-strong rounded-2xl p-4 border border-border/40">
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
              </motion.div>
            </ScrollReveal>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            {[
              { icon: Wifi, label: "Temps réel" },
              { icon: RefreshCw, label: "Sync auto" },
              { icon: Cloud, label: "Cloud sécurisé" },
              { icon: CheckCircle, label: "Multi-appareils" },
            ].map((feature, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="glass-strong rounded-xl p-4 border border-border/40 text-center hover:border-primary/30 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-sm font-medium text-foreground">{feature.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
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
    <section className="relative py-24 overflow-hidden bg-muted/20">
      <GlowOrb color="accent" size="xl" className="absolute -right-40 top-1/3" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Visual */}
          <ScrollReveal>
            <div className="relative flex justify-center">
              {/* Main Shield */}
              <motion.div
                animate={{ 
                  y: [-10, 10, -10],
                  rotate: [-2, 2, -2]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <div className="w-48 h-56 rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent p-[3px] shadow-glow">
                  <div className="w-full h-full rounded-3xl bg-card flex items-center justify-center">
                    <Shield size={80} className="text-primary" />
                  </div>
                </div>
                
                {/* Orbiting elements */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                  style={{ width: '300px', height: '300px', left: '-50px', top: '-25px' }}
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2">
                    <div className="p-2 rounded-full glass-strong border border-primary/40">
                      <Lock size={16} className="text-primary" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                    <div className="p-2 rounded-full glass-strong border border-secondary/40">
                      <Cloud size={16} className="text-secondary" />
                    </div>
                  </div>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2">
                    <div className="p-2 rounded-full glass-strong border border-success/40">
                      <CheckCircle size={16} className="text-success" />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </ScrollReveal>

          {/* Content */}
          <ScrollReveal delay={200}>
            <div>
              <span className="inline-block px-4 py-2 rounded-full glass-strong border border-accent/30 text-sm font-medium text-accent mb-4">
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
              
              <div className="grid sm:grid-cols-2 gap-4">
                {securityFeatures.map((feature, index) => (
                  <FloatingCard key={index} delay={index * 0.2} duration={5}>
                    <div className="glass-strong rounded-2xl p-4 border border-border/40 hover:border-accent/30 transition-colors">
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
                  </FloatingCard>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
