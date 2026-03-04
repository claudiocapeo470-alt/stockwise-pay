import { Button } from "@/components/ui/button";
import { CheckCircle, Package, ShoppingCart, FileText, BarChart3, Store, Scan, X, ArrowRight, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const WELCOME_GUIDE_VERSION = "2";

interface WelcomeGuideProps {
  onClose?: () => void;
}

const steps = [
  {
    title: "Gérez vos stocks",
    description: "Ajoutez vos produits, suivez les quantités en temps réel et recevez des alertes quand le stock est bas. Vous pouvez aussi scanner les codes-barres.",
    icon: Package,
    action: "Gérer les Stocks",
    route: "/app/stocks",
  },
  {
    title: "Vendez avec la Caisse",
    description: "Enregistrez vos ventes rapidement depuis l'interface Caisse. Acceptez les espèces, Mobile Money (Orange, MTN, Wave) et carte bancaire.",
    icon: ShoppingCart,
    action: "Ouvrir la Caisse",
    route: "/app/caisse",
  },
  {
    title: "Facturez & créez des devis",
    description: "Générez des factures et devis professionnels en quelques clics. Téléchargez-les en PDF ou envoyez-les par email.",
    icon: FileText,
    action: "Créer une facture",
    route: "/app/facturation",
  },
  {
    title: "Analysez vos performances",
    description: "Consultez vos statistiques de ventes, suivez votre chiffre d'affaires et exportez vos rapports en Excel ou PDF.",
    icon: BarChart3,
    action: "Voir les rapports",
    route: "/app/performance",
  },
  {
    title: "Boutique en ligne",
    description: "Créez et publiez votre propre boutique en ligne. Vos clients peuvent commander directement depuis leur téléphone, avec synchronisation du stock en temps réel.",
    icon: Store,
    action: "Configurer ma boutique",
    route: "/app/boutique/config",
  },
  {
    title: "Scannez vos produits",
    description: "Scannez les codes-barres depuis la caisse avec la caméra de votre téléphone ou un scanner USB. Les produits sont ajoutés automatiquement au ticket.",
    icon: Scan,
    action: "Ouvrir la Caisse",
    route: "/app/caisse",
  },
];

export function WelcomeGuide({ onClose }: WelcomeGuideProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const step = steps[currentStep];
  const Icon = step.icon;

  const handleStepAction = (route: string) => {
    navigate(route);
    onClose?.();
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-card border border-border shadow-2xl overflow-hidden animate-fade-in">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-muted/80 hover:bg-muted transition-colors"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
        <h2 className="text-xl font-bold mb-1">Bienvenue sur Stocknix 🎉</h2>
        <p className="text-sm text-white/80">Découvrez les fonctionnalités principales en {steps.length} étapes</p>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1 px-6 pt-4">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 transition-colors duration-300 ${
              index <= currentStep ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="p-6 space-y-5">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Étape {currentStep + 1} sur {steps.length}
            </p>
            <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
          </div>
        </div>

        <Button
          onClick={() => handleStepAction(step.route)}
          className="w-full h-11"
        >
          {step.action}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Footer navigation */}
      <div className="flex items-center justify-between px-6 pb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Précédent
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentStep(currentStep + 1)}
          >
            Suivant
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Terminé
          </Button>
        )}
      </div>

      {/* Skip */}
      <div className="text-center pb-4">
        <button
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Ignorer le guide
        </button>
      </div>
    </div>
  );
}
