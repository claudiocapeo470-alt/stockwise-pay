import { motion } from "framer-motion";
import { 
  Package, Scan, Download, Upload, Bell, AlertTriangle,
  CreditCard, Smartphone, Wallet, Receipt,
  FileText, FilePlus, FileCheck, DollarSign,
  BarChart3, TrendingUp, PieChart, LineChart
} from "lucide-react";
import { FloatingCard, DeviceMockup, GlowOrb, GridPattern } from "./FloatingElements";
import { 
  ParallaxContainer, 
  AnimatedEntry, 
  StaggerContainer, 
  StaggerItem,
  DisplacementMotion,
  Floating3D 
} from "./ImmersiveAnimations";

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  delay?: number;
}

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) => (
  <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-4 transition-all duration-300 group">
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-xl bg-primary/20 transition-colors">
        <Icon size={20} className="text-primary" />
      </div>
      <div>
        <h4 className="font-semibold text-foreground text-sm mb-1">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  </div>
);

// Section 1: Gestion des Stocks
export const StocksSection = () => {
  const features = [
    { icon: Package, title: "Suivi temps réel", description: "Inventaire toujours à jour" },
    { icon: AlertTriangle, title: "Alertes stock bas", description: "Ne manquez plus jamais" },
    { icon: Download, title: "Import facile", description: "Excel, CSV, et plus" },
    { icon: Scan, title: "Scanner codes-barres", description: "Ajout instantané" },
  ];

  return (
    <section className="relative py-12 sm:py-16 overflow-hidden">
      <ParallaxContainer depth="background" className="absolute inset-0 pointer-events-none">
        <GridPattern className="opacity-30" />
        <GlowOrb color="primary" size="xl" className="absolute -left-40 top-1/4" />
      </ParallaxContainer>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <AnimatedEntry type="fade-zoom">
            <div>
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-sm font-medium text-primary mb-4">
                📦 Gestion des Stocks
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                <span className="text-foreground">Maîtrisez votre </span>
                <span className="text-gradient">inventaire</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Suivez chaque produit en temps réel, recevez des alertes automatiques 
                et optimisez votre gestion des stocks sans effort.
              </p>
              
              <StaggerContainer className="grid sm:grid-cols-2 gap-4" staggerDelay={0.1}>
                {features.map((feature, index) => (
                  <StaggerItem key={index}>
                    <FeatureCard {...feature} delay={index * 0.2} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </AnimatedEntry>

          {/* Visual */}
          <DisplacementMotion direction="up" distance={30}>
            <AnimatedEntry type="fade-zoom" delay={0.2}>
              <div className="relative">
                <DeviceMockup type="desktop">
                  <div className="p-6 min-h-[300px]">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="text-sm font-semibold text-foreground">Gestion des Stocks</div>
                        <div className="text-xs text-muted-foreground">1,247 produits</div>
                      </div>
                      <div className="flex gap-2">
                        <div className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium">
                          + Ajouter
                        </div>
                      </div>
                    </div>
                    
                    {/* Product Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { name: "Riz 5kg", qty: 45, status: "ok" },
                        { name: "Huile 1L", qty: 12, status: "low" },
                        { name: "Sucre 1kg", qty: 89, status: "ok" },
                        { name: "Lait 1L", qty: 5, status: "critical" },
                        { name: "Farine 2kg", qty: 67, status: "ok" },
                        { name: "Sel 500g", qty: 23, status: "ok" },
                      ].map((product, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                          className={`p-3 rounded-xl ${
                            product.status === 'critical' ? 'bg-destructive/10' :
                            product.status === 'low' ? 'bg-warning/10' :
                            'bg-muted/20'
                          }`}
                        >
                          <div className="w-8 h-8 bg-muted rounded-lg mb-2" />
                          <div className="text-xs font-medium text-foreground truncate">{product.name}</div>
                          <div className={`text-[10px] ${
                            product.status === 'critical' ? 'text-destructive' :
                            product.status === 'low' ? 'text-warning' :
                            'text-muted-foreground'
                          }`}>
                            {product.qty} en stock
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </DeviceMockup>

                {/* Floating Alert */}
                <Floating3D amplitude={10} duration={5} className="absolute -right-8 top-1/3">
                  <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-3 shadow-xl">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-warning/20">
                        <Bell size={14} className="text-warning" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground">Stock bas</p>
                        <p className="text-[10px] text-muted-foreground">3 produits</p>
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

// Section 2: Caisse & POS
export const POSSection = () => {
  const features = [
    { icon: CreditCard, title: "Encaissement rapide", description: "En quelques clics" },
    { icon: Wallet, title: "Mobile Money", description: "Orange, MTN, Wave" },
    { icon: Receipt, title: "Tickets auto", description: "Impression instantanée" },
    { icon: Smartphone, title: "Multi-appareils", description: "PC, tablette, mobile" },
  ];

  return (
    <section className="relative py-12 sm:py-16 overflow-hidden bg-muted/10">
      <ParallaxContainer depth="background" className="absolute inset-0 pointer-events-none">
        <GlowOrb color="secondary" size="xl" className="absolute -right-40 top-1/4" />
      </ParallaxContainer>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <AnimatedEntry type="fade-zoom">
            <div>
              <span className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-sm font-medium text-secondary mb-4">
                💳 Caisse & POS
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                <span className="text-foreground">Encaissez </span>
                <span className="text-gradient">rapidement</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Interface intuitive pour un encaissement rapide. Acceptez tous les 
                modes de paiement, imprimez les tickets automatiquement.
              </p>
              
              <StaggerContainer className="grid sm:grid-cols-2 gap-4" staggerDelay={0.1}>
                {features.map((feature, index) => (
                  <StaggerItem key={index}>
                    <FeatureCard {...feature} delay={index * 0.2} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </AnimatedEntry>

          {/* Visual */}
          <DisplacementMotion direction="diagonal" distance={25}>
            <AnimatedEntry type="fade-zoom" delay={0.2}>
              <div className="relative">
                <div className="flex justify-center items-end gap-6">
                  {/* Main Phone */}
                  <DeviceMockup type="mobile">
                    <div className="p-4 min-h-[300px]">
                      <div className="text-center mb-4">
                        <div className="text-xs text-muted-foreground">Total</div>
                        <div className="text-2xl font-bold text-primary">25 500 F</div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {[
                          { name: "Riz 5kg", price: "15 000 F" },
                          { name: "Huile 1L", price: "5 500 F" },
                          { name: "Sucre 1kg", price: "5 000 F" },
                        ].map((item, i) => (
                          <div key={i} className="flex justify-between text-xs p-2 bg-muted/30 rounded-lg">
                            <span className="text-foreground">{item.name}</span>
                            <span className="text-muted-foreground">{item.price}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {["Espèces", "Orange", "Wave"].map((method, i) => (
                          <div 
                            key={i}
                            className={`p-2 rounded-lg text-center text-[10px] font-medium ${
                              i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground'
                            }`}
                          >
                            {method}
                          </div>
                        ))}
                      </div>
                      
                      <div className="p-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-center text-white text-sm font-semibold">
                        Valider
                      </div>
                    </div>
                  </DeviceMockup>

                  <div className="hidden sm:flex flex-col gap-4">
                    {[
                      { icon: "🔶", label: "Orange Money" },
                      { icon: "🌊", label: "Wave" },
                      { icon: "💛", label: "MTN" },
                    ].map((payment, i) => (
                      <Floating3D key={i} delay={i * 0.3} duration={4} amplitude={8}>
                        <div className="bg-card/80 backdrop-blur-xl rounded-xl p-3 flex items-center gap-2 shadow-lg">
                          <span className="text-xl">{payment.icon}</span>
                          <span className="text-xs font-medium text-foreground">{payment.label}</span>
                        </div>
                      </Floating3D>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedEntry>
          </DisplacementMotion>
        </div>
      </div>
    </section>
  );
};

// Section 3: Facturation
export const InvoicingSection = () => {
  const features = [
    { icon: FileText, title: "Factures pro", description: "Templates élégants" },
    { icon: FilePlus, title: "Devis rapides", description: "Conversion en 1 clic" },
    { icon: FileCheck, title: "Suivi paiements", description: "Relances auto" },
    { icon: DollarSign, title: "Multi-devises", description: "FCFA, EUR, USD" },
  ];

  return (
    <section className="relative py-12 sm:py-16 overflow-hidden">
      <ParallaxContainer depth="background" className="absolute inset-0 pointer-events-none">
        <GridPattern className="opacity-30" />
        <GlowOrb color="accent" size="xl" className="absolute -left-40 top-1/4" />
      </ParallaxContainer>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <AnimatedEntry type="fade-zoom">
            <div>
              <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-sm font-medium text-accent mb-4">
                🧾 Facturation
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                <span className="text-foreground">Factures & devis </span>
                <span className="text-gradient-accent">professionnels</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Créez des documents professionnels en quelques clics. 
                Suivez vos paiements et relancez automatiquement.
              </p>
              
              <StaggerContainer className="grid sm:grid-cols-2 gap-4" staggerDelay={0.1}>
                {features.map((feature, index) => (
                  <StaggerItem key={index}>
                    <FeatureCard {...feature} delay={index * 0.2} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </AnimatedEntry>

          {/* Visual */}
          <DisplacementMotion direction="up" distance={25}>
            <AnimatedEntry type="fade-zoom" delay={0.2}>
              <div className="relative">
                {/* Invoice Preview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-card/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl max-w-md mx-auto"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-lg font-bold text-foreground">FACTURE</div>
                      <div className="text-xs text-muted-foreground">#FAC-2025-0042</div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-success/20 text-success text-xs font-medium">
                      Payée
                    </div>
                  </div>
                  
                  <div className="border-t border-b border-border/20 py-4 my-4 space-y-3">
                    {[
                      { desc: "Riz 5kg x 10", amount: "150,000 F" },
                      { desc: "Huile 1L x 5", amount: "27,500 F" },
                      { desc: "Sucre 1kg x 8", amount: "40,000 F" },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-foreground">{item.desc}</span>
                        <span className="text-muted-foreground">{item.amount}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total TTC</span>
                    <span className="text-2xl font-bold text-primary">217,500 F</span>
                  </div>
                </motion.div>

                {/* Floating Elements */}
                <Floating3D amplitude={12} duration={6} delay={0.3} className="absolute -left-8 top-1/4">
                  <div className="bg-card/80 backdrop-blur-xl rounded-xl p-3 shadow-lg">
                    <FileText size={24} className="text-accent" />
                  </div>
                </Floating3D>

                <Floating3D amplitude={10} duration={5} delay={0.6} className="absolute -right-4 bottom-1/4">
                  <div className="bg-card/80 backdrop-blur-xl rounded-xl p-3 shadow-lg">
                    <FileCheck size={24} className="text-success" />
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

// Section 4: Analytics
export const AnalyticsSection = () => {
  const features = [
    { icon: BarChart3, title: "Rapports détaillés", description: "Ventes, stocks, clients" },
    { icon: TrendingUp, title: "Tendances", description: "Prévisions intelligentes" },
    { icon: PieChart, title: "Répartition", description: "Par catégorie" },
    { icon: LineChart, title: "Évolution", description: "Historique complet" },
  ];

  return (
    <section className="relative py-12 sm:py-16 overflow-hidden bg-muted/10">
      <ParallaxContainer depth="background" className="absolute inset-0 pointer-events-none">
        <GlowOrb color="primary" size="xl" className="absolute -right-40 top-1/4" />
      </ParallaxContainer>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <AnimatedEntry type="fade-zoom">
            <div>
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-sm font-medium text-primary mb-4">
                📊 Analytics
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                <span className="text-foreground">Décisions </span>
                <span className="text-gradient">éclairées</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Visualisez vos performances en temps réel. Identifiez les tendances, 
                anticipez les besoins et optimisez votre business.
              </p>
              
              <StaggerContainer className="grid sm:grid-cols-2 gap-4" staggerDelay={0.1}>
                {features.map((feature, index) => (
                  <StaggerItem key={index}>
                    <FeatureCard {...feature} delay={index * 0.2} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </AnimatedEntry>

          {/* Visual */}
          <DisplacementMotion direction="diagonal" distance={20}>
            <AnimatedEntry type="fade-zoom" delay={0.2}>
              <div className="relative">
                <DeviceMockup type="desktop">
                  <div className="p-6 min-h-[320px]">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="text-sm font-semibold text-foreground">Analytics</div>
                        <div className="text-xs text-muted-foreground">Janvier 2025</div>
                      </div>
                      <div className="flex gap-2">
                        {["Jour", "Semaine", "Mois"].map((period, i) => (
                          <div 
                            key={i}
                            className={`px-2 py-1 rounded text-[10px] ${
                              i === 2 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                            }`}
                          >
                            {period}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="h-32 bg-muted/20 rounded-xl mb-4 flex items-end gap-2 p-4">
                      {[35, 52, 41, 78, 45, 65, 88, 55, 72, 95, 60, 82].map((h, i) => (
                        <motion.div 
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: 0.8 + i * 0.05, duration: 0.5 }}
                          className="flex-1 bg-gradient-to-t from-primary to-secondary rounded-t opacity-80"
                        />
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: "Chiffre d'affaires", value: "12.5M F", change: "+18%" },
                        { label: "Transactions", value: "1,847", change: "+12%" },
                        { label: "Panier moyen", value: "6,750 F", change: "+5%" },
                      ].map((stat, i) => (
                        <div key={i} className="text-center">
                          <div className="text-xs text-muted-foreground">{stat.label}</div>
                          <div className="text-sm font-bold text-foreground">{stat.value}</div>
                          <div className="text-[10px] text-success">{stat.change}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </DeviceMockup>

                <Floating3D amplitude={15} duration={5} delay={0.8} className="absolute -right-6 top-1/4">
                  <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg">
                    <TrendingUp size={32} className="text-primary" />
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
