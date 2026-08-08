import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, Layers } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCompanyModules, MODULE_CONFIGS, ModuleKey } from '@/hooks/useCompanyModules';
import { useSubscription } from '@/hooks/useSubscription';
import { usePaiementPro, type PaiementProPlan } from '@/hooks/usePaiementPro';
import { SubscriptionPlansView } from '@/components/subscription/SubscriptionPlansView';
import { SubscriptionSuccessView } from '@/components/subscription/SubscriptionSuccessView';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const PLAN_LABELS: Record<string, string> = {
  trial: 'Essai gratuit',
  starter: 'Starter',
  business: 'Business',
  pro: 'Pro',
};

export default function MySubscription() {
  const { status, refetch: refetchSub } = useSubscription();
  const { initPayment, loadingPlan } = usePaiementPro();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { selectedModules, saveModules } = useCompanyModules();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ModuleKey[]>(selectedModules);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setDraft(selectedModules); }, [selectedModules]);

  useEffect(() => {
    if (searchParams.get('ref')) {
      const t = setTimeout(() => {
        refetchSub();
        searchParams.delete('ref');
        setSearchParams(searchParams, { replace: true });
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [searchParams, setSearchParams, refetchSub]);

  const toggleDraft = (key: ModuleKey) =>
    setDraft(prev => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]));

  const handleSave = async () => {
    if (draft.length === 0) { toast.error('Choisissez au moins un module'); return; }
    setSaving(true);
    try {
      await saveModules(draft);
      toast.success('Abonnement mis à jour');
      setEditing(false);
    } catch (e: any) {
      toast.error('Erreur', { description: e.message });
    } finally {
      setSaving(false);
    }
  };

  const isPaidActive = status.isActive && !status.isTrial;

  return (
    <div className="mx-auto w-full max-w-md h-[calc(100dvh-190px)] min-h-[440px] flex flex-col">
      {isPaidActive ? (
        <SubscriptionSuccessView
          planLabel={PLAN_LABELS[status.planName ?? ''] ?? 'Premium'}
          title={`Abonnement ${PLAN_LABELS[status.planName ?? ''] ?? ''} actif`}
          description={
            status.subscriptionEnd
              ? `Votre accès est actif jusqu'au ${status.subscriptionEnd.toLocaleDateString('fr-FR')}. Profitez de toutes les fonctionnalités de Stocknix.`
              : undefined
          }
          onDone={() => navigate('/app')}
        />
      ) : (
        <>
          <div className="flex items-center justify-between gap-2 mb-2">
            <Badge
              variant="secondary"
              className={`rounded-full ${status.isTrial ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}
            >
              {status.isTrial ? `Essai · ${status.trialDaysLeft} j restants` : 'Essai terminé'}
            </Badge>
            <Button variant="ghost" size="sm" className="rounded-full gap-1.5 text-xs" onClick={() => setEditing(true)}>
              <Layers className="h-3.5 w-3.5" /> Modules
            </Button>
          </div>
          <div className="flex-1 min-h-0">
            <SubscriptionPlansView
              loadingPlan={loadingPlan}
              ctaLabel={status.isExpired ? 'Réactiver' : "S'abonner"}
              note={status.isTrial ? `Essai gratuit en cours — ${status.trialDaysLeft} jours restants.` : undefined}
              onSubscribe={(plan: PaiementProPlan, amount) =>
                initPayment({ plan, amount, billing_cycle: 'monthly' })
              }
            />
          </div>
        </>
      )}

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader><DialogTitle>Vos modules</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto">
            {MODULE_CONFIGS.map(mod => {
              const isSelected = draft.includes(mod.key);
              return (
                <button
                  key={mod.key}
                  onClick={() => toggleDraft(mod.key)}
                  className={`relative p-3 rounded-2xl text-left transition-all ${isSelected ? 'bg-primary/10 ring-2 ring-primary' : 'bg-muted/50'}`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-primary-foreground" />
                    </div>
                  )}
                  <span className="text-xl">{mod.icon}</span>
                  <p className="font-semibold text-xs mt-1 truncate">{mod.label}</p>
                </button>
              );
            })}
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full h-11 rounded-2xl">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enregistrer'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
