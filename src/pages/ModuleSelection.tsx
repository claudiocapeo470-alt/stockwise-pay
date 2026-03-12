import { useState } from 'react';
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
  const { saveModules, company } = useCompanyModules();
  const [step, setStep] = useState<'company' | 'modules' | 'plan'>('company');
  const [companyName, setCompanyName] = useState(company?.name || '');
  const [selectedKeys, setSelectedKeys] = useState<ModuleKey[]>((company?.selected_modules as ModuleKey[]) || []);
  const [showCombos, setShowCombos] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState('');

  const COMBOS = MODULE_PLANS.filter(p => p.keys.length > 1);
  const matchingPlan = getMatchingPlan(selectedKeys);
  const currentStepIdx = STEP_KEYS.indexOf(step);

  const toggleModule = (key: ModuleKey) => {
    setSelectedKeys(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const handleNextFromCompany = () => {
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
    setSaving(true);
    try {
      await saveModules(selectedKeys, companyName.trim());
      toast.success(`✅ Bienvenue dans ${companyName.trim()} !`, { description: `${matchingPlan?.label || 'Espace'} activé avec succès` });
      navigate('/app');
    } catch (e: any) {
      toast.error('Erreur', { description: e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[200px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Logo & Title */}
        <div className="flex flex-col items-center mb-6">
          <img src={stocknixLogo} alt="Stocknix" className="h-10 w-10 mb-3" />
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">Stocknix</h1>
            <p className="text-sm text-muted-foreground">Configuration de votre espace</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="mb-8">
          <div className="flex gap-1.5 mb-2">
            {STEP_LABELS.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${currentStepIdx >= i ? 'bg-primary' : 'bg-muted'}`} />
            ))}
          </div>
          <div className="flex justify-between">
            {STEP_LABELS.map((label, i) => (
              <span key={label} className={`text-[11px] font-medium ${currentStepIdx >= i ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <AnimatePresence mode="wait">

            {step === 'company' && (
              <motion.div key="company" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Votre entreprise</h2>
                  <p className="text-sm text-muted-foreground">Comment s'appelle votre business ?</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Nom de l'entreprise *</Label>
                  <Input value={companyName} onChange={e => { setCompanyName(e.target.value); if (nameError) setNameError(''); }} onKeyDown={e => e.key === 'Enter' && handleNextFromCompany()} placeholder="Ex: Boutique Koné, TechStore CI..." className="h-12 text-base" />
                  {nameError && <p className="text-xs text-destructive">⚠ {nameError}</p>}
                </div>

                <Button onClick={handleNextFromCompany} className="w-full h-11 gap-2">
                  Continuer <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {step === 'modules' && (
              <motion.div key="modules" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                <div className="text-center space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Choisissez vos modules</h2>
                  <p className="text-sm text-muted-foreground">Activez ce dont {companyName} a besoin</p>
                </div>

                <div className="space-y-3">
                  {MODULE_CONFIGS.map(mod => {
                    const isSelected = selectedKeys.includes(mod.key);
                    return (
                      <motion.button key={mod.key} onClick={() => toggleModule(mod.key)} whileTap={{ scale: 0.985 }} className={`relative w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 ${isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-card hover:border-primary/30'}`}>
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
                      </motion.button>
                    );
                  })}
                </div>

                {/* Combos toggle */}
                <button onClick={() => setShowCombos(!showCombos)} className="flex items-center gap-2 w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1">
                  <div className="flex-1 h-px bg-border" />
                  ou une combinaison prête
                  <ChevronDown className={`h-3 w-3 transition-transform ${showCombos ? 'rotate-180' : ''}`} />
                  <div className="flex-1 h-px bg-border" />
                </button>

                <AnimatePresence>
                  {showCombos && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="grid grid-cols-2 gap-2">
                        {COMBOS.map((combo, idx) => {
                          const isActive = combo.keys.length === selectedKeys.length && combo.keys.every(k => selectedKeys.includes(k));
                          return (
                            <motion.button key={idx} onClick={() => { setSelectedKeys(combo.keys); setShowCombos(false); }} whileTap={{ scale: 0.97 }} className={`relative p-3 rounded-xl border text-left transition-all ${isActive ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'}`}>
                              {(combo as any).popular && <Badge className="absolute -top-2 right-2 text-[9px] px-1.5 py-0">Populaire</Badge>}
                              {isActive && <Check className="absolute top-2 right-2 h-3.5 w-3.5 text-primary" />}
                              <p className="text-lg mb-1">{combo.icon}</p>
                              <p className="text-xs font-semibold text-foreground">{combo.label}</p>
                              <p className="text-[10px] text-muted-foreground leading-tight">{combo.description}</p>
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

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep('company')} className="flex-1 h-11 gap-2"><ArrowLeft className="h-4 w-4" /> Retour</Button>
                  <Button onClick={handleNextFromModules} disabled={selectedKeys.length === 0} className="flex-1 h-11 gap-2">Continuer <ArrowRight className="h-4 w-4" /></Button>
                </div>
              </motion.div>
            )}

            {step === 'plan' && (
              <motion.div key="plan" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                <div className="text-center space-y-2">
                  <p className="text-3xl">{matchingPlan?.icon || '🎯'}</p>
                  <h2 className="text-lg font-semibold text-foreground">Votre abonnement</h2>
                  <p className="text-sm text-muted-foreground">Récapitulatif avant de lancer votre espace</p>
                </div>

                {matchingPlan && (
                  <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-foreground">{matchingPlan.label}</p>
                        <p className="text-xs text-muted-foreground">{matchingPlan.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">Gratuit</p>
                        <p className="text-[10px] text-muted-foreground">pour l'instant</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {matchingPlan.keys.map(k => { const cfg = MODULE_CONFIGS.find(m => m.key === k)!; return <Badge key={k} variant="outline" className="text-xs">{cfg.icon} {cfg.label}</Badge>; })}
                    </div>
                    <p className="text-xs text-primary flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5" /> Tous les modules activés immédiatement
                    </p>
                  </div>
                )}

                <div className="flex items-start gap-2.5 p-3 bg-muted/50 rounded-xl">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">Tous les modules sont gratuits pendant la période de lancement. Des plans payants seront disponibles prochainement. Modifiez votre abonnement à tout moment dans Paramètres → Mon abonnement.</p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep('modules')} className="flex-1 h-11 gap-2"><ArrowLeft className="h-4 w-4" /> Retour</Button>
                  <Button onClick={handleConfirm} disabled={saving} className="flex-1 h-11 gap-2 bg-primary hover:bg-primary/90">
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
