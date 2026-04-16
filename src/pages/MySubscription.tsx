import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Crown, Layers, Sparkles, RefreshCw, Loader2, Zap, TrendingUp, Shield } from 'lucide-react';
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
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      {/* Hero */}
      <Card className="border-border/60 overflow-hidden">
        <div className="relative bg-gradient-to-br from-primary via-primary/90 to-secondary p-6 sm:p-8 text-primary-foreground">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <Badge variant="secondary" className="mb-3 bg-white/20 text-primary-foreground border-0">
                <Sparkles className="h-3 w-3 mr-1" /> Période de lancement
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 flex items-center gap-2">
                <Crown className="h-6 w-6" /> {currentPlan?.label || 'Plan personnalisé'}
              </h1>
              <p className="text-sm text-primary-foreground/80">{currentPlan?.description || 'Configurez vos modules'}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl sm:text-4xl font-bold">Gratuit</div>
              <p className="text-xs text-primary-foreground/70 mt-1">Tout inclus</p>
            </div>
          </div>
        </div>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <StatBox icon={Layers} label="Modules" value={`${selectedModules.length}/${MODULE_CONFIGS.length}`} />
            <StatBox icon={Zap} label="Statut" value="Actif" success />
            <StatBox icon={Shield} label="Support" value="24/7" />
          </div>
          {!editing && (
            <Button variant="outline" onClick={() => { setDraft(selectedModules); setEditing(true); }} className="w-full sm:w-auto gap-2">
              <RefreshCw className="h-4 w-4" /> Modifier mes modules
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Active Modules */}
      <Card className="border-border/60">
        <CardContent className="p-4 sm:p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" /> Modules activés
          </h3>
          {selectedModules.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Aucun module actif</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {selectedModules.map(k => {
                const cfg = MODULE_CONFIGS.find(m => m.key === k)!;
                return (
                  <div key={k} className="p-3 rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-3">
                    <span className="text-2xl">{cfg.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">{cfg.label}</p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><Check className="h-2.5 w-2.5" /> Actif</p>
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
            <Card className="border-primary/30 border-2">
              <CardContent className="p-4 sm:p-6 space-y-5">
                <div>
                  <h3 className="font-semibold text-foreground">Personnaliser vos modules</h3>
                  <p className="text-sm text-muted-foreground">Cochez les modules à activer</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {MODULE_CONFIGS.map(mod => {
                    const isSelected = draft.includes(mod.key);
                    return (
                      <button key={mod.key} onClick={() => toggleDraft(mod.key)} className={`relative p-3 rounded-xl border-2 text-left transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'}`}>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                        <div className="flex items-center gap-3 pr-6">
                          <span className="text-2xl">{mod.icon}</span>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground text-sm">{mod.label}</p>
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
                        <button key={idx} onClick={() => setDraft(combo.keys)} className={`p-2.5 rounded-xl border text-center transition-all ${isActive ? 'border-primary bg-primary/5' : 'border-border bg-muted/30 hover:border-primary/30'}`}>
                          <p className="text-xl">{combo.icon}</p>
                          <p className="text-xs font-semibold text-foreground mt-1">{combo.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {draft.length > 0 && draftPlan && (
                  <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-xl border border-primary/10 text-sm">
                    <span className="text-lg">{draftPlan.icon}</span>
                    <span className="font-medium text-foreground">→ {draftPlan.label}</span>
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
      <Card className="border-border/60">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">Plans à venir</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Profitez de tout gratuitement pendant la période de lancement.</p>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { label: 'Starter', desc: 'Essentiels', color: 'from-blue-500/20 to-cyan-500/10' },
              { label: 'Business', desc: 'Analytics+', color: 'from-purple-500/20 to-pink-500/10' },
              { label: 'Pro', desc: 'Multi + API', color: 'from-orange-500/20 to-red-500/10' },
            ].map(plan => (
              <div key={plan.label} className={`p-3 rounded-xl border border-border bg-gradient-to-br ${plan.color} text-center`}>
                <p className="font-bold text-foreground text-sm">{plan.label}</p>
                <Badge variant="outline" className="text-[10px] mt-1.5">À venir</Badge>
                <p className="text-[10px] text-muted-foreground mt-1.5">{plan.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, success }: any) {
  return (
    <div className="p-3 rounded-xl bg-muted/50 border border-border/60">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="h-3 w-3 text-muted-foreground" />
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
      </div>
      <p className={`text-sm font-bold ${success ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>{value}</p>
    </div>
  );
}
