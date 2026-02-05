import { motion, useScroll, useTransform } from "framer-motion";
import { Store, ShoppingCart, Pill, Warehouse, Coffee, Scissors } from "lucide-react";
import { useRef } from "react";
import { DepthParallax, ZoomCinematic, Magnetic } from "./ImmersiveAnimations";
import { GlowOrb } from "./FloatingElements";

const businessTypes = [
  { icon: Store, label: "Boutiques", color: "from-primary to-secondary" },
  { icon: ShoppingCart, label: "Supermarchés", color: "from-secondary to-accent" },
  { icon: Pill, label: "Pharmacies", color: "from-success to-primary" },
  { icon: Warehouse, label: "Dépôts", color: "from-warning to-destructive" },
  { icon: Coffee, label: "Restaurants", color: "from-accent to-secondary" },
  { icon: Scissors, label: "Salons", color: "from-primary to-accent" },
];

const BusinessTypesSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={sectionRef} className="relative py-24 overflow-hidden">
      {/* Background parallax orbs */}
      <DepthParallax depth={-0.6} className="absolute top-0 left-1/4 z-0">
        <GlowOrb color="secondary" size="lg" />
      </DepthParallax>
      <DepthParallax depth={-0.4} className="absolute bottom-0 right-1/4 z-0">
        <GlowOrb color="primary" size="md" />
      </DepthParallax>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ZoomCinematic intensity={0.8}>
          <motion.div 
            className="text-center mb-16"
            style={{ opacity }}
          >
            <motion.span 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-block px-4 py-2 rounded-full bg-card/80 backdrop-blur-xl border border-secondary/30 text-sm font-medium text-secondary mb-4 shadow-lg"
            >
              Polyvalent
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
            >
              <span className="text-foreground">Pensé pour </span>
              <span className="text-gradient">tous les commerces</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Que vous gériez une boutique, un supermarché ou une pharmacie, 
              Stocknix s'adapte à votre activité
            </motion.p>
          </motion.div>
        </ZoomCinematic>

        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
          style={{ y }}
        >
          {businessTypes.map((business, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              <Magnetic strength={0.15}>
                <motion.div
                  whileHover={{ scale: 1.08, y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="group relative cursor-pointer"
                >
                  <div className="bg-card/80 backdrop-blur-xl rounded-3xl p-6 border border-border hover:border-primary/40 transition-all duration-300 text-center shadow-lg hover:shadow-xl">
                    {/* Icon Container */}
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${business.color} p-[2px] group-hover:shadow-glow transition-shadow duration-300`}>
                      <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
                        <business.icon className="h-7 w-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                      {business.label}
                    </h3>
                  </div>
                  
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                </motion.div>
              </Magnetic>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BusinessTypesSection;
