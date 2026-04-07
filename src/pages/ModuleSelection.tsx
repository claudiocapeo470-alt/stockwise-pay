import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, ArrowLeft, Building2, Loader2, Sparkles, ChevronDown, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useCompanyModules, MODULE_CONFIGS, MODULE_PLANS, ModuleKey, getMatchingPlan } from '@/hooks/useCompanyModules';
import { toast } from 'sonner';
import stocknixLogo from '@/assets/stocknix-logo-official.png';

const STEP_LABELS = ['Entreprise', 'Modules', 'Abonnement'];
const STEP_KEYS = ['company', 'modules', 'plan'];

export default function ModuleSelection() {
  const navigate = useNavigate();
  const { saveModules, company, onboardingCompleted, loading } = useCompanyModules();
  const [step, setStep] = useState<'company' | 'modules' | 'plan'>('company');
  const [companyName, setCompanyName] = useState(company?.name || '');
  const [selectedKeys, setSelectedKeys] = useState<ModuleKey[]>((company?.selected_modules as ModuleKey[]) || []);
  const [showCombos, setShowCombos] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState('');

  const COMBOS = MODULE_PLANS.filter(p => p.keys.length > 1);
  const matchingPlan = getMatchingPlan(selectedKeys);
  const currentStepIdx = STEP_KEYS.indexOf(step);

  useEffect(() => {
    if (!loading && onboardingCompleted) {
      navigate('/app', { replace: true });
    }
  }, [loading, onboardingCompleted, navigate]);

  useEffect(() => {
    if (!company) return;

    setCompanyName((prev) => prev || company.name || '');

    if (selectedKeys.length === 0 && company.selected_modules?.length) {
      setSelectedKeys(company.selected_modules as ModuleKey[]);
    }
  }, [company, selectedKeys.length]);

  const toggleModule = (key: ModuleKey) => {
    setSelectedKeys(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const handleNextFromCompany = () => {
    if (loading) return;
    if (!companyName.trim()) { setNameError("Le nom de votre entreprise est requis"); return; }
    if (companyName.trim().length < 2) { setNameError('Minimum 2 caractères'); return; }
    setNameError('');
    setStep('modules');
  };

  const handleNextFromModules = () => {
    if (selectedKeys.length === 0) { toast.error('Choisissez au moins un module'); return; }
    setStep('plan');
  };

  const handleConfirm = async () => {
    if (loading) return;
    setSaving(true);
    try {
      const result = await saveModules(selectedKeys, companyName.trim());
      if (result?.error) throw result.error;
      toast.success(`Bienvenue dans ${companyName.trim()} !`, { description: `${matchingPlan?.label || 'Espace'} activé !` });
      navigate('/app', { replace: true });
    } catch (e: any) {
      toast.error('Erreur', { description: e.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading && !company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <img src={stocknixLogo} alt="Stocknix" className="h-16 w-16 sm:h-20 sm:w-20" />
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-foreground">Préparation de votre espace</h1>
            <p className="text-sm text-muted-foreground">Nous configurons votre entreprise avant de lancer l'onboarding.</p>
          </div>
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-3 py-6 sm:px-6 sm:py-10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[360px] w-[720px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 mx-auto h-48 w-[85%] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="w-full max-w-3xl relative z-10">
        <div className="flex flex-col items-center mb-8 sm:mb-10">
          <img src={stocknixLogo} alt="Stocknix" className="mb-4 h-16 w-16 sm:h-20 sm:w-20" />
          <div className="text-center space-y-2">
            <Badge variant="secondary" className="px-3 py-1 text-xs uppercase tracking-[0.22em]">Vision 2030</Badge>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Stocknix</h1>
            <p className="max-w-md text-sm text-muted-foreground sm:text-base">Un onboarding plus fluide, plus premium et prêt pour lancer votre espace sans blocage.</p>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-border/60 bg-card/70 p-4 backdrop-blur-sm sm:mb-8 sm:p-5">
          <div className="mb-3 flex gap-2">
            {STEP_LABELS.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${currentStepIdx >= i ? 'bg-primary' : 'bg-muted'}`} />
            ))}
          </div>
          <div className="flex justify-between gap-3">
            {STEP_LABELS.map((label, i) => (
              <span key={label} className={`text-xs font-medium sm:text-sm ${currentStepIdx >= i ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-border/60 bg-card/95 p-5 shadow-xl shadow-primary/5 backdrop-blur-xl sm:p-8">
          <AnimatePresence mode="wait">

            {step === 'company' && (
              <motion.div key="company" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-7">
                <div className="text-center space-y-3">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold text-foreground">Votre entreprise</h2>
                  <p className="text-sm text-muted-foreground sm:text-base">Donnez un nom clair à votre business pour finaliser votre espace sans friction.</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Nom de l'entreprise *</Label>
                  <Input value={companyName} onChange={e => { setCompanyName(e.target.value); if (nameError) setNameError(''); }} onKeyDown={e => e.key === 'Enter' && handleNextFromCompany()} placeholder="Ex: Boutique Koné, TechStore CI..." className="h-14 rounded-2xl text-base" />
                  {nameError && <p className="text-xs text-destructive">⚠ {nameError}</p>}
                </div>

                <Button onClick={handleNextFromCompany} className="h-12 w-full rounded-2xl gap-2" disabled={loading}>
                  Continuer <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {step === 'modules' && (
              <motion.div key="modules" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="text-center space-y-3">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-primary/10">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold text-foreground">Choisissez vos modules</h2>
                  <p className="text-sm text-muted-foreground sm:text-base">Composez un espace moderne pour {companyName} avec les briques dont vous avez vraiment besoin.</p>
                </div>

                <div className="space-y-3">
                  {MODULE_CONFIGS.map(mod => {
                    const isSelected = selectedKeys.includes(mod.key);
                    return (
                      <motion.button key={mod.key} onClick={() => toggleModule(mod.key)} whileTap={{ scale: 0.985 }} className={`relative w-full overflow-hidden rounded-3xl border text-left transition-all duration-200 ${isSelected ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10' : 'border-border/70 bg-background hover:border-primary/40 hover:bg-primary/5'}`}>
                        <div className="absolute inset-y-0 left-0 w-1 bg-primary/80" />
                        {isSelected && (
                          <div className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                        <div className="flex items-center gap-4 p-5 pr-12 sm:p-6">
                          <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl ${isSelected ? 'bg-primary/15' : 'bg-muted'}`}>
                            <span className="text-3xl">{mod.icon}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-base font-semibold text-foreground sm:text-lg">{mod.label}</p>
                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{mod.description}</p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Combos toggle */}
                <button onClick={() => setShowCombos(!showCombos)} className="flex w-full items-center gap-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm">
                  <div className="flex-1 h-px bg-border" />
                  ou une combinaison prête
                  <ChevronDown className={`h-3 w-3 transition-transform ${showCombos ? 'rotate-180' : ''}`} />
                  <div className="flex-1 h-px bg-border" />
                </button>

                <AnimatePresence>
                  {showCombos && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {COMBOS.map((combo, idx) => {
                          const isActive = combo.keys.length === selectedKeys.length && combo.keys.every(k => selectedKeys.includes(k));
                          return (
                            <motion.button key={idx} onClick={() => { setSelectedKeys(combo.keys); setShowCombos(false); }} whileTap={{ scale: 0.97 }} className={`relative rounded-2xl border p-4 text-left transition-all ${isActive ? 'border-primary bg-primary/10 shadow-sm' : 'border-border/70 bg-background hover:border-primary/30'}`}>
                              {(combo as any).popular && <Badge className="absolute -top-2 right-2 text-[9px] px-1.5 py-0">Populaire</Badge>}
                              {isActive && <Check className="absolute top-2 right-2 h-3.5 w-3.5 text-primary" />}
                              <p className="mb-2 text-2xl">{combo.icon}</p>
                              <p className="text-sm font-semibold text-foreground">{combo.label}</p>
                              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{combo.description}</p>
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {selectedKeys.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-1.5">
                      {selectedKeys.map(k => { const cfg = MODULE_CONFIGS.find(m => m.key === k)!; return <Badge key={k} variant="secondary" className="text-xs">{cfg.icon} {cfg.label}</Badge>; })}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Button variant="outline" onClick={() => setStep('company')} className="h-12 rounded-2xl gap-2"><ArrowLeft className="h-4 w-4" /> Retour</Button>
                  <Button onClick={handleNextFromModules} disabled={selectedKeys.length === 0} className="h-12 rounded-2xl gap-2">Continuer <ArrowRight className="h-4 w-4" /></Button>
                </div>
              </motion.div>
            )}

            {step === 'plan' && (
              <motion.div key="plan" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="text-center space-y-3">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-primary/10 text-4xl">{matchingPlan?.icon || '🎯'}</div>
                  <h2 className="text-2xl font-semibold text-foreground">Votre abonnement</h2>
                  <p className="text-sm text-muted-foreground sm:text-base">Un dernier aperçu premium avant de lancer votre espace et commencer à vendre.</p>
                </div>

                {matchingPlan && (
                  <div className="overflow-hidden rounded-[1.75rem] border border-primary/20 bg-primary/10">
                    <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                      <div className="space-y-3">
                        <Badge variant="secondary" className="w-fit">Plan sélectionné</Badge>
                        <div>
                          <p className="text-2xl font-bold text-foreground">{matchingPlan.label}</p>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{matchingPlan.description}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {matchingPlan.keys.map(k => { const cfg = MODULE_CONFIGS.find(m => m.key === k)!; return <Badge key={k} variant="outline" className="rounded-full px-3 py-1 text-xs">{cfg.icon} {cfg.label}</Badge>; })}
                        </div>
                      </div>
                      <div className="rounded-3xl border border-primary/20 bg-background/80 px-5 py-4 text-left sm:min-w-[170px] sm:text-right">
                        <p className="text-3xl font-bold text-primary">Gratuit</p>
                        <p className="text-xs text-muted-foreground">Tous les modules sont activés immédiatement pour la phase de lancement.</p>
                      </div>
                    </div>
                    <div className="border-t border-primary/15 bg-background/60 p-5 sm:p-6">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-background p-4">
                          <p className="text-sm font-semibold text-foreground">Modules activés</p>
                          <div className="mt-3 space-y-2">
                            {matchingPlan.keys.map(k => {
                              const cfg = MODULE_CONFIGS.find(m => m.key === k)!;
                              return (
                                <div key={k} className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Check className="h-4 w-4 text-primary" />
                                  <span>{cfg.label}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="rounded-2xl bg-background p-4">
                          <p className="text-sm font-semibold text-foreground">Prêt à lancer</p>
                          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Votre navigation, vos permissions et vos modules seront activés dès que vous entrez dans l'application.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2.5 rounded-2xl bg-muted/50 p-4">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">Tous les modules sont gratuits pendant la période de lancement. Des plans payants seront disponibles prochainement. Modifiez votre abonnement à tout moment dans Paramètres → Mon abonnement.</p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Button variant="outline" onClick={() => setStep('modules')} className="h-12 rounded-2xl gap-2"><ArrowLeft className="h-4 w-4" /> Retour</Button>
                  <Button onClick={handleConfirm} disabled={saving || loading} className="h-12 rounded-2xl gap-2 bg-primary hover:bg-primary/90">
                    {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Création...</> : <><Sparkles className="h-4 w-4" />Lancer mon espace</>}
                  </Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
