import { motion } from "framer-motion";
import { Store, ShoppingCart, Pill, Warehouse, Coffee, Scissors } from "lucide-react";
import { AnimatedEntry, StaggerContainer, StaggerItem, ParallaxContainer } from "./ImmersiveAnimations";
import { GlowOrb } from "./FloatingElements";

const businessTypes = [
  { icon: Store, label: "Boutiques", gradient: "from-primary to-secondary" },
  { icon: ShoppingCart, label: "Supermarchés", gradient: "from-secondary to-accent" },
  { icon: Pill, label: "Pharmacies", gradient: "from-success to-primary" },
  { icon: Warehouse, label: "Dépôts", gradient: "from-warning to-destructive" },
  { icon: Coffee, label: "Restaurants", gradient: "from-accent to-secondary" },
  { icon: Scissors, label: "Salons", gradient: "from-primary to-accent" },
];

const BusinessTypesSection = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <ParallaxContainer depth="background" className="absolute inset-0 pointer-events-none">
        <GlowOrb color="secondary" size="lg" className="absolute top-0 left-1/4 opacity-30" />
        <GlowOrb color="primary" size="md" className="absolute bottom-0 right-1/4 opacity-30" />
      </ParallaxContainer>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatedEntry type="fade-zoom">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-sm font-medium text-secondary mb-4">
              Polyvalent
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-foreground">Pensé pour </span>
              <span className="text-gradient">tous les commerces</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Que vous gériez une boutique, un supermarché ou une pharmacie, 
              Stocknix s'adapte à votre activité
            </p>
          </div>
        </AnimatedEntry>

        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6" staggerDelay={0.08}>
          {businessTypes.map((business, index) => (
            <StaggerItem key={index}>
              <div className="group relative">
                {/* Card without border - clean design */}
                <div className="bg-card/60 backdrop-blur-sm rounded-3xl p-6 text-center transition-all duration-500 group-hover:bg-card/80">
                  {/* Icon Container with gradient glow */}
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${business.gradient} p-[2px] transition-all duration-500`}>
                    <div className="w-full h-full rounded-2xl bg-card/90 flex items-center justify-center backdrop-blur-sm">
                      <business.icon className="h-7 w-7 text-primary transition-transform duration-500" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground transition-colors duration-300">
                    {business.label}
                  </h3>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default BusinessTypesSection;
