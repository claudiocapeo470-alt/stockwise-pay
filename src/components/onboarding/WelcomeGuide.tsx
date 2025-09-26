import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, ShoppingCart, Receipt, BarChart3 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface WelcomeGuideProps {
  onClose?: () => void;
}

export function WelcomeGuide({ onClose }: WelcomeGuideProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Ajoutez vos premiers produits",
      description: "Créez votre inventaire en ajoutant les produits que vous vendez",
      icon: Package,
      action: "Gérer les Stocks",
      route: "/app/stocks"
    },
    {
      title: "Enregistrez vos ventes",
      description: "Suivez vos transactions et générez vos factures automatiquement",
      icon: ShoppingCart,
      action: "Voir les Ventes", 
      route: "/app/ventes"
    },
    {
      title: "Gérez vos paiements",
      description: "Trackez vos encaissements et suivez les paiements en attente",
      icon: Receipt,
      action: "Gérer Paiements",
      route: "/app/paiements"
    },
    {
      title: "Analysez vos performances", 
      description: "Consultez vos rapports et exportez vos données",
      icon: BarChart3,
      action: "Voir Rapports",
      route: "/app/rapports"
    }
  ];

  const handleStepAction = (route: string) => {
    navigate(route);
    onClose?.();
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <Card className="w-full max-w-md mx-auto glass">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-secondary">
          <Icon className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-xl font-semibold">
          Bienvenue dans votre SaaS ! 
        </CardTitle>
        <CardDescription>
          Votre interface est vierge et prête à évoluer avec votre activité
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress */}
        <div className="flex items-center justify-center space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-8 rounded-full transition-colors ${
                index <= currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Current Step */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="mb-2">
            Étape {currentStep + 1} sur {steps.length}
          </Badge>
          
          <div>
            <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>

          <Button
            onClick={() => handleStepAction(step.route)}
            className="w-full bg-gradient-secondary hover:opacity-90"
          >
            {step.action}
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            size="sm"
          >
            Précédent
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button
              variant="outline"
              onClick={nextStep}
              size="sm"
            >
              Suivant
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={onClose}
              size="sm"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Terminé
            </Button>
          )}
        </div>

        {/* Skip Guide */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={onClose}
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Ignorer le guide
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}