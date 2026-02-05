import { motion, useScroll, useTransform } from "framer-motion";
import { Monitor, Smartphone, Cloud, Shield, Lock, RefreshCw, Wifi, CheckCircle } from "lucide-react";
import { useRef } from "react";
import { DepthParallax, ZoomCinematic, Magnetic, Floating3D } from "./ImmersiveAnimations";
import { FloatingCard, GlowOrb, GridPattern } from "./FloatingElements";

// Synchronisation Section
export const SyncSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const cloudScale = useTransform(scrollYProgress, [0, 0.5], [0.5, 1]);
  const cloudOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <section ref={sectionRef} className="relative py-24 overflow-hidden">
      <GridPattern className="opacity-15" />
      
      {/* Parallax orbs */}
      <DepthParallax depth={-0.6} className="absolute left-1/4 top-0 z-0">
        <GlowOrb color="secondary" size="xl" />
      </DepthParallax>
      <DepthParallax depth={-0.4} className="absolute right-1/4 bottom-0 z-0">
        <GlowOrb color="primary" size="lg" />
      </DepthParallax>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ZoomCinematic intensity={0.6}>
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-card/80 backdrop-blur-xl border border-secondary/30 text-sm font-medium text-secondary mb-4 shadow-lg">
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
          </motion.div>
        </ZoomCinematic>

        {/* Devices Illustration avec effets 3D */}
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-8 lg:gap-16">
            {/* Desktop */}
            <DepthParallax depth={0.3}>
              <motion.div 
                className="relative"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Floating3D intensity={0.8} rotationIntensity={0.5}>
                  <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-4 border border-border shadow-xl">
                    <div className="w-32 h-20 bg-muted/30 rounded-lg flex items-center justify-center">
                      <Monitor size={40} className="text-primary" />
                    </div>
                    <div className="text-center mt-2">
                      <div className="text-xs font-medium text-foreground">PC Bureau</div>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <motion.div 
                          className="w-2 h-2 rounded-full bg-success"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <span className="text-[10px] text-success">Connecté</span>
                      </div>
                    </div>
                  </div>
                </Floating3D>
              </motion.div>
            </DepthParallax>

            {/* Cloud - Center avec zoom cinématique */}
            <motion.div 
              className="relative z-10"
              style={{ scale: cloudScale, opacity: cloudOpacity }}
            >
              <Floating3D intensity={1.2} rotationIntensity={0.3}>
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-secondary p-[3px] shadow-xl">
                  <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                    <Cloud size={40} className="text-primary" />
                  </div>
                </div>
              </Floating3D>
              
              {/* Lignes de connexion animées */}
              <svg className="absolute inset-0 w-full h-full -z-10" style={{ transform: 'scale(3)' }}>
                <defs>
                  <linearGradient id="sync-line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
                <motion.line
                  x1="0" y1="50%" x2="30%" y2="50%"
                  stroke="url(#sync-line-gradient)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                />
                <motion.line
                  x1="70%" y1="50%" x2="100%" y2="50%"
                  stroke="url(#sync-line-gradient)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: 0.7 }}
                />
              </svg>
            </motion.div>

            {/* Mobile */}
            <DepthParallax depth={0.5}>
              <motion.div 
                className="relative"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Floating3D intensity={0.8} rotationIntensity={0.5}>
                  <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-4 border border-border shadow-xl">
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
              </motion.div>
            </DepthParallax>
          </div>

          {/* Features Grid */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {[
              { icon: Wifi, label: "Temps réel" },
              { icon: RefreshCw, label: "Sync auto" },
              { icon: Cloud, label: "Cloud sécurisé" },
              { icon: CheckCircle, label: "Multi-appareils" },
            ].map((feature, i) => (
              <Magnetic key={i} strength={0.1}>
                <motion.div 
                  className="bg-card/80 backdrop-blur-xl rounded-xl p-4 border border-border text-center hover:border-primary/30 transition-all hover:shadow-lg cursor-pointer"
                  whileHover={{ y: -4, scale: 1.02 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                >
                  <feature.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-sm font-medium text-foreground">{feature.label}</div>
                </motion.div>
              </Magnetic>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Security Section
export const SecuritySection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const securityFeatures = [
    { icon: Shield, title: "Protection avancée", description: "Chiffrement de bout en bout" },
    { icon: Lock, title: "Accès sécurisé", description: "Authentification 2FA" },
    { icon: Cloud, title: "Sauvegarde auto", description: "Données préservées" },
    { icon: CheckCircle, title: "Conformité", description: "RGPD & standards" },
  ];

  return (
    <section ref={sectionRef} className="relative py-24 overflow-hidden bg-muted/10">
      <DepthParallax depth={-0.5} className="absolute -right-40 top-1/3 z-0">
        <GlowOrb color="accent" size="xl" />
      </DepthParallax>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Visual - Shield 3D avec orbite */}
          <motion.div 
            className="relative flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Main Shield avec Floating 3D */}
            <Floating3D intensity={1.5} rotationIntensity={0.4}>
              <div className="relative">
                <div className="w-48 h-56 rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent p-[3px] shadow-2xl">
                  <div className="w-full h-full rounded-3xl bg-card flex items-center justify-center">
                    <Shield size={80} className="text-primary" />
                  </div>
                </div>
                
                {/* Orbiting elements */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute"
                  style={{ width: '300px', height: '300px', left: '-50px', top: '-25px' }}
                >
                  <motion.div 
                    className="absolute top-0 left-1/2 -translate-x-1/2"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="p-2 rounded-full bg-card/90 backdrop-blur-xl border border-primary/40 shadow-lg">
                      <Lock size={16} className="text-primary" />
                    </div>
                  </motion.div>
                  <motion.div 
                    className="absolute bottom-0 left-1/2 -translate-x-1/2"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  >
                    <div className="p-2 rounded-full bg-card/90 backdrop-blur-xl border border-secondary/40 shadow-lg">
                      <Cloud size={16} className="text-secondary" />
                    </div>
                  </motion.div>
                  <motion.div 
                    className="absolute left-0 top-1/2 -translate-y-1/2"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  >
                    <div className="p-2 rounded-full bg-card/90 backdrop-blur-xl border border-success/40 shadow-lg">
                      <CheckCircle size={16} className="text-success" />
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </Floating3D>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-card/80 backdrop-blur-xl border border-accent/30 text-sm font-medium text-accent mb-4 shadow-lg">
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
                <Magnetic key={index} strength={0.1}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="bg-card/80 backdrop-blur-xl rounded-2xl p-4 border border-border hover:border-accent/30 transition-all shadow-lg hover:shadow-xl cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-accent/20">
                        <feature.icon size={20} className="text-accent" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-sm mb-1">{feature.title}</h4>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </motion.div>
                </Magnetic>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
