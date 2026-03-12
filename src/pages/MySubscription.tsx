import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Crown, Layers, Info, RefreshCw, Loader2 } from 'lucide-react';
import { useCompanyModules, MODULE_CONFIGS, MODULE_PLANS, ModuleKey, getMatchingPlan } from '@/hooks/useCompanyModules';
import { toast } from 'sonner';

export default function MySubscription() {
  const { selectedModules, saveModules, currentPlan, loading } = useCompanyModules();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ModuleKey[]>(selectedModules);
  const [saving, setSaving] = useState(false);

  const draftPlan = getMatchingPlan(draft);

  const toggleDraft = (key: ModuleKey) => {
    setDraft(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const handleSave = async () => {
    if (draft.length === 0) { toast.error('Choisissez au moins un module'); return; }
    setSaving(true);
    try {
      await saveModules(draft);
      toast.success('✅ Abonnement mis à jour !');
      setEditing(false);
    } catch (e: any) {
      toast.error('Erreur', { description: e.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Crown className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Mon abonnement</h1>
        </div>
        <p className="text-sm text-muted-foreground">Gérez vos modules actifs et consultez votre plan</p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Layers className="h-4 w-4" /> Plan actuel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-foreground">{currentPlan?.label || 'Aucun plan'}</p>
              <p className="text-sm text-muted-foreground">{currentPlan?.description || 'Aucun module configuré'}</p>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="text-sm">Gratuit</Badge>
              <p className="text-[10px] text-muted-foreground mt-1">Période de lancement</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedModules.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun module actif</p>
            ) : (
              selectedModules.map(k => {
                const cfg = MODULE_CONFIGS.find(m => m.key === k)!;
                return (
                  <div key={k} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
                    <span>{cfg.icon}</span>
                    <span className="text-sm font-medium text-foreground">{cfg.label}</span>
                  </div>
                );
              })
            )}
          </div>
          {!editing && (
            <Button variant="outline" onClick={() => { setDraft(selectedModules); setEditing(true); }} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Modifier mes modules
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Edit Section */}
      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Modifier mes modules</CardTitle>
                <p className="text-sm text-muted-foreground">La sidebar se met à jour immédiatement après la sauvegarde.</p>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-3">
                  {MODULE_CONFIGS.map(mod => {
                    const isSelected = draft.includes(mod.key);
                    return (
                      <button key={mod.key} onClick={() => toggleDraft(mod.key)} className={`relative w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'}`}>
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{mod.icon}</span>
                          <div>
                            <p className="font-semibold text-foreground text-sm">{mod.label}</p>
                            <p className="text-xs text-muted-foreground">{mod.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Combinaisons rapides</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {MODULE_PLANS.filter(p => p.keys.length > 1).map((combo, idx) => {
                      const isActive = combo.keys.length === draft.length && combo.keys.every(k => draft.includes(k));
                      return (
                        <button key={idx} onClick={() => setDraft(combo.keys)} className={`p-3 rounded-xl border transition-all text-left ${isActive ? 'border-primary bg-primary/5' : 'border-border bg-muted/30 hover:border-primary/30'}`}>
                          <p className="text-lg">{combo.icon}</p>
                          <p className="text-xs font-semibold text-foreground">{combo.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {draft.length > 0 && draftPlan && (
                  <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-xl border border-primary/10 text-sm">
                    <span>{draftPlan.icon}</span>
                    <span className="font-medium text-foreground">Plan résultant : {draftPlan.label}</span>
                    <Badge variant="secondary" className="ml-auto">Gratuit</Badge>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => { setDraft(selectedModules); setEditing(false); }} className="flex-1">Annuler</Button>
                  <Button onClick={handleSave} disabled={saving || draft.length === 0} className="flex-1">
                    {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Sauvegarde...</> : 'Sauvegarder'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Future Plans */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Info className="h-4 w-4" /> Plans à venir</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2.5 p-3 bg-muted/50 rounded-xl mb-4">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">Des plans payants avec fonctionnalités avancées arrivent bientôt. Profitez de tout gratuitement pendant la période de lancement !</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[{ label: 'Starter', desc: 'Modules essentiels' }, { label: 'Business', desc: 'Tout + analytics avancés' }, { label: 'Pro', desc: 'Multi-boutiques + API' }].map(plan => (
              <div key={plan.label} className="p-3 rounded-xl border border-border bg-muted/20 text-center">
                <p className="font-semibold text-foreground text-sm">{plan.label}</p>
                <Badge variant="outline" className="text-[10px] mt-1">À venir</Badge>
                <p className="text-[10px] text-muted-foreground mt-1">{plan.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
