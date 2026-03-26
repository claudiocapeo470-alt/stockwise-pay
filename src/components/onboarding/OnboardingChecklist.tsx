import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/hooks/useCompany';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';
import { useTeam } from '@/hooks/useTeam';
import { useOnlineStore } from '@/hooks/useOnlineStore';
import { CheckCircle2, Circle, ChevronRight, X, Sparkles } from 'lucide-react';

interface Step {
  key: string;
  label: string;
  description: string;
  href: string;
  check: boolean;
  optional?: boolean;
}

export function OnboardingChecklist() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { company } = useCompany();
  const { products } = useProducts();
  const { sales } = useSales();
  const { members } = useTeam();
  const { store } = useOnlineStore();
  const [dismissed, setDismissed] = useState(false);

  // Don't show after 7 days or if dismissed
  const accountAge = user?.created_at ? (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24) : 0;
  const shouldShow = accountAge < 7 && products.length < 5 && !dismissed;

  useEffect(() => {
    const d = localStorage.getItem('stocknix_onboarding_dismissed');
    if (d === 'true') setDismissed(true);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('stocknix_onboarding_dismissed', 'true');
  };

  if (!shouldShow) return null;

  const steps: Step[] = [
    { key: 'account', label: 'Créer votre compte', description: 'Inscription terminée', href: '/app', check: true },
    { key: 'company', label: 'Configurer votre entreprise', description: 'Nom, logo, devise', href: '/app/settings', check: !!(company?.company_name_set && company?.name !== 'Mon entreprise') },
    { key: 'product', label: 'Ajouter votre premier produit', description: 'Au moins 1 produit dans le stock', href: '/app/stocks', check: products.length > 0 },
    { key: 'sale', label: 'Créer votre première vente', description: 'Enregistrer une vente', href: '/app/ventes', check: sales.length > 0 },
    { key: 'team', label: 'Inviter un employé', description: 'Ajouter un membre à l\'équipe', href: '/app/team', check: members.length > 0, optional: true },
    { key: 'store', label: 'Activer votre boutique en ligne', description: 'Configurer la boutique', href: '/app/boutique/config', check: !!store?.is_published, optional: true },
  ];

  const completed = steps.filter(s => s.check).length;
  const total = steps.length;
  const progress = Math.round((completed / total) * 100);
  const allDone = completed === total;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {allDone ? '🎉 Félicitations !' : 'Premiers pas avec Stocknix'}
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <Progress value={progress} className="flex-1 h-2" />
          <span className="text-xs font-medium text-muted-foreground">{completed}/{total}</span>
        </div>

        {allDone ? (
          <p className="text-sm text-muted-foreground">Vous avez complété toutes les étapes ! Stocknix est prêt à utiliser.</p>
        ) : (
          <div className="space-y-1">
            {steps.map(step => (
              <button
                key={step.key}
                onClick={() => !step.check && navigate(step.href)}
                disabled={step.check}
                className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${step.check ? 'opacity-60' : 'hover:bg-background'}`}
              >
                {step.check ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${step.check ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                    {step.label} {step.optional && <span className="text-xs text-muted-foreground">(optionnel)</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                {!step.check && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
