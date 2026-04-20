import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Crown, Layers, RefreshCw, Loader2, Zap, Shield } from 'lucide-react';
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
    <div className="space-y-6 max-w-3xl mx-auto pb-8 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold">Mon abonnement</h2>
        <p className="text-sm text-muted-foreground">Plan actuel et modules activés</p>
      </div>

      {/* Plan résumé — épuré */}
      <Card>
        <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="h-12 w-12 bg-primary/10 flex items-center justify-center rounded-xl shrink-0">
            <Crown className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold">{currentPlan?.label || 'Plan personnalisé'}</h3>
              <Badge variant="secondary" className="bg-success/10 text-success">Gratuit</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{currentPlan?.description || 'Configurez vos modules'}</p>
          </div>
          {!editing && (
            <Button variant="outline" onClick={() => { setDraft(selectedModules); setEditing(true); }} className="h-10 gap-2 w-full sm:w-auto">
              <RefreshCw className="h-4 w-4" /> Modifier
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Stats compactes */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 flex items-center justify-center rounded-xl shrink-0">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold">{selectedModules.length}<span className="text-sm font-normal text-muted-foreground">/{MODULE_CONFIGS.length}</span></p>
              <p className="text-xs text-muted-foreground">Modules</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 bg-success/10 flex items-center justify-center rounded-xl shrink-0">
              <Zap className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-lg font-bold">Actif</p>
              <p className="text-xs text-muted-foreground">Statut</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 bg-warning/10 flex items-center justify-center rounded-xl shrink-0">
              <Shield className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-lg font-bold">24/7</p>
              <p className="text-xs text-muted-foreground">Support</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modules actifs */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 text-sm font-semibold mb-4">
            <Layers className="h-4 w-4 text-muted-foreground" /> Modules activés
          </div>
          {selectedModules.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Aucun module actif</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {selectedModules.map(k => {
                const cfg = MODULE_CONFIGS.find(m => m.key === k)!;
                return (
                  <div key={k} className="p-3 rounded-lg border border-border bg-card flex items-center gap-3">
                    <span className="text-xl">{cfg.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">{cfg.label}</p>
                      <p className="text-[10px] text-success flex items-center gap-1"><Check className="h-2.5 w-2.5" /> Actif</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal Inline */}
      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <Card className="border-primary/40">
              <CardContent className="p-4 sm:p-6 space-y-5">
                <div>
                  <h3 className="font-semibold">Personnaliser vos modules</h3>
                  <p className="text-sm text-muted-foreground">Cochez les modules à activer</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {MODULE_CONFIGS.map(mod => {
                    const isSelected = draft.includes(mod.key);
                    return (
                      <button key={mod.key} onClick={() => toggleDraft(mod.key)} className={`relative p-3 rounded-lg border text-left transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'}`}>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                        <div className="flex items-center gap-3 pr-6">
                          <span className="text-2xl">{mod.icon}</span>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{mod.label}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{mod.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Combinaisons rapides</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {MODULE_PLANS.filter(p => p.keys.length > 1).map((combo, idx) => {
                      const isActive = combo.keys.length === draft.length && combo.keys.every(k => draft.includes(k));
                      return (
                        <button key={idx} onClick={() => setDraft(combo.keys)} className={`p-2.5 rounded-lg border text-center transition-all ${isActive ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'}`}>
                          <p className="text-xl">{combo.icon}</p>
                          <p className="text-xs font-semibold mt-1">{combo.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {draft.length > 0 && draftPlan && (
                  <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20 text-sm">
                    <span className="text-lg">{draftPlan.icon}</span>
                    <span className="font-medium">→ {draftPlan.label}</span>
                    <Badge variant="secondary" className="ml-auto bg-success/10 text-success">Gratuit</Badge>
                  </div>
                )}

                <div className="flex gap-2">
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
    </div>
  );
}
