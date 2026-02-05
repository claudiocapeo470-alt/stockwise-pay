import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Monitor, Smartphone, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { ZoomCinematic, Magnetic, DepthParallax, ParticleField } from "./ImmersiveAnimations";
import { GlowOrb, GridPattern } from "./FloatingElements";

const CTASection = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"]
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden">
      {/* Background avec effet zoom cinématique */}
      <motion.div 
        className="absolute inset-0"
        style={{ scale }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <GridPattern className="opacity-20" />
        <ParticleField count={30} />
      </motion.div>
      
      {/* Orbes parallax */}
      <DepthParallax depth={-0.5} className="absolute -left-20 top-1/4 z-0">
        <GlowOrb color="primary" size="xl" />
      </DepthParallax>
      <DepthParallax depth={-0.7} className="absolute -right-20 bottom-1/4 z-0">
        <GlowOrb color="secondary" size="xl" />
      </DepthParallax>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          style={{ opacity }}
        >
          {/* Devices Illustration avec zoom dramatique */}
          <ZoomCinematic intensity={1.5}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative mb-12"
            >
              <div className="flex items-end justify-center gap-4">
                {/* Desktop */}
                <DepthParallax depth={0.3}>
                  <motion.div
                    animate={{ y: [-8, 8, -8] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="relative"
                  >
                    <div className="w-48 h-32 bg-card/90 backdrop-blur-xl rounded-xl border-2 border-primary/30 shadow-xl flex items-center justify-center group hover:border-primary/60 transition-colors">
                      <Monitor size={48} className="text-primary group-hover:scale-110 transition-transform" />
                      {/* Glow effect */}
                      <div className="absolute inset-0 rounded-xl bg-primary/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
                    </div>
                  </motion.div>
                </DepthParallax>

                {/* Mobile */}
                <DepthParallax depth={0.5}>
                  <motion.div
                    animate={{ y: [8, -8, 8] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="relative -ml-8"
                  >
                    <div className="w-20 h-36 bg-card/90 backdrop-blur-xl rounded-2xl border-2 border-secondary/30 shadow-xl flex items-center justify-center group hover:border-secondary/60 transition-colors">
                      <Smartphone size={32} className="text-secondary group-hover:scale-110 transition-transform" />
                      {/* Glow effect */}
                      <div className="absolute inset-0 rounded-2xl bg-secondary/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
                    </div>
                  </motion.div>
                </DepthParallax>
              </div>

              {/* Sparkles animées */}
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 1, 0.5],
                  rotate: [0, 180, 360]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute top-0 right-1/3"
              >
                <Sparkles className="text-primary h-6 w-6" />
              </motion.div>
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 1, 0.5],
                  rotate: [360, 180, 0]
                }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                className="absolute bottom-4 left-1/3"
              >
                <Sparkles className="text-secondary h-4 w-4" />
              </motion.div>
            </motion.div>
          </ZoomCinematic>

          {/* Content avec animation d'entrée */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
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
              <Magnetic strength={0.15}>
                <Button 
                  size="lg"
                  onClick={() => navigate('/auth')}
                  className="text-lg px-10 py-7 bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-xl shadow-primary/25 font-bold group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    Démarrer avec Stocknix
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  />
                </Button>
              </Magnetic>
              
              <Magnetic strength={0.15}>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/tarifs')}
                  className="text-lg px-10 py-7 border-2 border-border hover:border-primary/50 font-semibold bg-card/50 backdrop-blur-sm"
                >
                  Voir les tarifs
                </Button>
              </Magnetic>
            </div>

            {/* Trust badges avec animation staggered */}
            <motion.div 
              className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              {[
                "Essai gratuit",
                "Sans carte bancaire", 
                "Support 24/7"
              ].map((badge, i) => (
                <motion.div 
                  key={badge}
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                >
                  <div className="w-2 h-2 rounded-full bg-success" />
                  {badge}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
