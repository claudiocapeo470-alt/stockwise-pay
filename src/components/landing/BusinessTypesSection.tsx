import { motion } from "framer-motion";
import { Store, ShoppingCart, Pill, Warehouse, Coffee, Scissors } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { FloatingIcon, GlowOrb } from "./FloatingElements";

const businessTypes = [
  { icon: Store, label: "Boutiques", color: "from-primary to-secondary" },
  { icon: ShoppingCart, label: "Supermarchés", color: "from-secondary to-accent" },
  { icon: Pill, label: "Pharmacies", color: "from-success to-primary" },
  { icon: Warehouse, label: "Dépôts", color: "from-warning to-destructive" },
  { icon: Coffee, label: "Restaurants", color: "from-accent to-secondary" },
  { icon: Scissors, label: "Salons", color: "from-primary to-accent" },
];

const BusinessTypesSection = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <GlowOrb color="secondary" size="lg" className="absolute top-0 left-1/4 opacity-30" />
      <GlowOrb color="primary" size="md" className="absolute bottom-0 right-1/4 opacity-30" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <motion.span 
              className="inline-block px-4 py-2 rounded-full glass-strong border border-secondary/30 text-sm font-medium text-secondary mb-4"
            >
              Polyvalent
            </motion.span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-foreground">Pensé pour </span>
              <span className="text-gradient">tous les commerces</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Que vous gériez une boutique, un supermarché ou une pharmacie, 
              Stocknix s'adapte à votre activité
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {businessTypes.map((business, index) => (
            <ScrollReveal key={index} delay={index * 100}>
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="group relative"
              >
                <div className="glass-strong rounded-3xl p-6 border border-border/40 hover:border-primary/40 transition-all duration-300 text-center">
                  {/* Icon Container */}
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${business.color} p-[2px] group-hover:shadow-glow transition-shadow`}>
                    <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
                      <business.icon className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {business.label}
                  </h3>
                </div>
                
                {/* Hover glow */}
                <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BusinessTypesSection;
