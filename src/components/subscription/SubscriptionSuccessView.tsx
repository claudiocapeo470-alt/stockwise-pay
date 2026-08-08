import { Button } from '@/components/ui/button';
import { Check, X, Boxes, Zap, ShieldCheck } from 'lucide-react';

interface Props {
  planLabel?: string;
  onDone: () => void;
  onClose?: () => void;
  title?: string;
  description?: string;
}

const FEATURES = [
  { icon: Boxes, label: 'Stock illimité' },
  { icon: Zap, label: 'Rapidité' },
  { icon: ShieldCheck, label: 'Support' },
];

export function SubscriptionSuccessView({ planLabel, onDone, onClose, title, description }: Props) {
  return (
    <div className="relative flex h-full min-h-0 flex-col items-center justify-between text-center py-4">
      <div className="w-full flex items-center justify-center relative">
        <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">Félicitations</p>
        {onClose && (
          <button onClick={onClose} aria-label="Fermer" className="absolute right-0 text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex flex-col items-center gap-5">
        <div className="relative h-32 w-32 rounded-full bg-primary flex items-center justify-center shadow-xl">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl -z-10" />
          <Check className="h-14 w-14 text-primary-foreground" strokeWidth={3} />
        </div>
        <div className="space-y-2 max-w-xs">
          <h2 className="text-2xl font-extrabold">{title ?? 'Abonnement activé'}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description ??
              `Félicitations, votre accès ${planLabel ?? 'Premium'} est actif. Profitez de toutes les fonctionnalités de Stocknix !`}
          </p>
        </div>
        <div className="flex items-start justify-center gap-8 pt-2">
          {FEATURES.map(f => (
            <div key={f.label} className="flex flex-col items-center gap-2 w-16">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <f.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <p className="text-[11px] font-semibold leading-tight">{f.label}</p>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={onDone} size="lg" className="w-full max-w-xs h-12 rounded-full font-semibold">
        Terminé
      </Button>
    </div>
  );
}
