import { motion } from "framer-motion";
import { Package, ShoppingCart, FileText, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AnimatedEntry, StaggerContainer, StaggerItem } from "./ImmersiveAnimations";

const steps = [
  {
    number: "01",
    icon: Package,
    title: "Ajoutez vos produits",
    description: "Créez votre catalogue en ajoutant vos produits avec prix, catégories et quantités. Importez en masse via CSV si besoin.",
  },
  {
    number: "02",
    icon: ShoppingCart,
    title: "Vendez & encaissez",
    description: "Utilisez la caisse pour enregistrer vos ventes en quelques clics. Acceptez espèces, Mobile Money, carte bancaire.",
  },
  {
    number: "03",
    icon: FileText,
    title: "Facturez vos clients",
    description: "Générez des factures et devis professionnels automatiquement. Envoyez-les par email ou téléchargez en PDF.",
  },
  {
    number: "04",
    icon: BarChart3,
    title: "Analysez vos performances",
    description: "Consultez vos statistiques de ventes, stocks et finances en temps réel. Prenez les bonnes décisions.",
  },
];

const HowItWorksSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatedEntry type="fade-zoom">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-sm font-medium text-primary mb-4">
              📖 Guide rapide
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-foreground">Comment </span>
              <span className="text-gradient">ça marche ?</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Démarrez en 4 étapes simples et gérez votre commerce comme un pro.
            </p>
          </div>
        </AnimatedEntry>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8" staggerDelay={0.12}>
          {steps.map((step, index) => (
            <StaggerItem key={index}>
              <div className="relative group">
                {/* Connector line (desktop) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-[2px] z-0">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary/40 to-primary/10"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + index * 0.15, duration: 0.6 }}
                      style={{ transformOrigin: "left" }}
                    />
                  </div>
                )}

                <div className="relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-6 h-full">
                  {/* Step number */}
                  <div className="text-5xl font-black text-primary/10 absolute top-4 right-4">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="relative z-10 mb-5">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                      <step.icon className="h-7 w-7 text-primary" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-foreground mb-2 relative z-10">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed relative z-10">
                    {step.description}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* CTA */}
        <AnimatedEntry type="fade-zoom" delay={0.6}>
          <div className="text-center mt-12">
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary shadow-xl shadow-primary/25 font-semibold group"
            >
              Commencer maintenant
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </AnimatedEntry>
      </div>
    </section>
  );
};

export default HowItWorksSection;
