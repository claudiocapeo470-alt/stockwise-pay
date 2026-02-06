import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package, CreditCard, TrendingUp, Bell, Sparkles, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FloatingCard, StatsCard, DeviceMockup, GlowOrb, GridPattern } from "./FloatingElements";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-20">
      {/* Background Elements */}
      <GridPattern className="opacity-50" />
      
      {/* Animated Orbs */}
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-strong border border-primary/30 mb-6"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                La solution #1 en Côte d'Ivoire
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight mb-6"
            >
              <span className="text-foreground">Gérez votre</span>
              <br />
              <span className="text-gradient">commerce</span>
              <br />
              <span className="text-foreground">en toute</span>
              <span className="text-gradient-accent"> simplicité</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-8"
            >
              Stocks, ventes, factures et analytics réunis dans une plateforme 
              intuitive et puissante. Conçu pour les entrepreneurs africains.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button 
                size="lg"
                onClick={() => navigate('/auth')}
                className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-xl shadow-primary/25 font-semibold group"
              >
                Démarrer gratuitement
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate('/fonctionnalites')}
                className="text-lg px-8 py-6 border-2 border-border/60 hover:border-primary/50 font-semibold group"
              >
                <Play className="mr-2 h-5 w-5 text-primary" />
                Voir la démo
              </Button>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-4 mt-10 justify-center lg:justify-start"
            >
              <div className="flex -space-x-3">
                {["K", "F", "I", "M", "A"].map((initial, i) => (
                  <motion.div 
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-sm font-bold border-2 border-background"
                  >
                    {initial}
                  </motion.div>
                ))}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">500+ entreprises</p>
                <p className="text-xs text-muted-foreground">nous font confiance</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - 3D Scene */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            {/* Main Desktop Mockup */}
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

            {/* Mobile Mockup - Floating */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute -bottom-10 -left-10"
            >
              <FloatingCard delay={0.5} duration={5}>
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
              </FloatingCard>
            </motion.div>

            {/* Floating Stats Cards */}
            <div className="absolute -top-4 -right-4">
              <StatsCard 
                icon={TrendingUp}
                value="↑ 23%"
                label="Croissance"
                trend="+12% ce mois"
                delay={0.2}
              />
            </div>
            
            <div className="absolute top-1/2 -right-16">
              <StatsCard 
                icon={Package}
                value="1,247"
                label="Produits"
                delay={0.8}
              />
            </div>

            <div className="absolute -bottom-4 right-20">
              <FloatingCard delay={1.2}>
                <div className="glass-strong rounded-2xl p-3 border border-border/40 shadow-xl flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-warning/20">
                    <Bell size={18} className="text-warning" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">Alerte Stock</p>
                    <p className="text-[10px] text-muted-foreground">Riz 5kg - Stock bas</p>
                  </div>
                </div>
              </FloatingCard>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
