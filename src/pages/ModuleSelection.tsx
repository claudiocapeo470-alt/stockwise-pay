import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, Building2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCompanyModules, MODULE_CONFIGS, ModuleKey } from "@/hooks/useCompanyModules";
import { toast } from "sonner";
import stocknixLogo from "@/assets/stocknix-logo-official.png";

const FUSION_PRESETS = [
  {
    keys: ["boutique", "pos", "stock"] as ModuleKey[],
    label: "Tout-en-un",
    description: "Boutique + Caisse + Stock — L'arsenal complet",
    icon: "🚀",
    popular: true,
  },
  {
    keys: ["pos", "stock"] as ModuleKey[],
    label: "Magasin physique",
    description: "Caisse POS + Gestion de stock",
    icon: "🏪",
    popular: false,
  },
  {
    keys: ["boutique", "stock"] as ModuleKey[],
    label: "E-commerce & Stock",
    description: "Boutique en ligne + Inventaire",
    icon: "🌐",
    popular: false,
  },
  {
    keys: ["boutique", "pos"] as ModuleKey[],
    label: "Vente multi-canal",
    description: "En ligne + En magasin",
    icon: "⚡",
    popular: false,
  },
];

export default function ModuleSelection() {
  const navigate = useNavigate();
  const { saveModules, onboardingCompleted, company } = useCompanyModules();
  const [step, setStep] = useState<"company" | "modules">(
    onboardingCompleted && company?.company_name_set ? "modules" : "company"
  );
  const [companyName, setCompanyName] = useState(company?.name || "");
  const [selectedKeys, setSelectedKeys] = useState<ModuleKey[]>(
    (company?.selected_modules as ModuleKey[]) || []
  );
  const [activePreset, setActivePreset] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState("");

  const toggleModule = (key: ModuleKey) => {
    setActivePreset(null);
    setSelectedKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const applyPreset = (idx: number) => {
    setActivePreset(idx);
    setSelectedKeys(FUSION_PRESETS[idx].keys);
  };

  const handleNextStep = () => {
    if (!companyName.trim()) { setNameError("Le nom de votre entreprise est requis"); return; }
    if (companyName.trim().length < 2) { setNameError("Minimum 2 caractères"); return; }
    setNameError("");
    setStep("modules");
  };

  const handleSave = async () => {
    if (selectedKeys.length === 0) { toast.error("Choisissez au moins un module"); return; }
    setSaving(true);
    try {
      await saveModules(selectedKeys, companyName.trim());
      toast.success(`✅ Bienvenue dans ${companyName.trim()} !`, { description: "Votre espace est prêt" });
      navigate("/app");
    } catch (e: any) {
      toast.error("Erreur", { description: e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-8">
          <img src={stocknixLogo} alt="Stocknix" className="h-10 w-10" />
          <div>
            <h2 className="text-xl font-bold">Stocknix</h2>
            <p className="text-xs text-white/40">Configuration de votre espace</p>
          </div>
        </motion.div>

        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            {/* STEP 1 — Nom entreprise */}
            {step === "company" && (
              <motion.div key="company" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} className="space-y-8">
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-2">
                    <Building2 className="h-8 w-8 text-blue-400" />
                  </div>
                  <h1 className="text-2xl font-bold">Votre entreprise</h1>
                  <p className="text-white/50">Comment s'appelle votre business ?</p>
                </div>

                <div className="space-y-3">
                  <Label className="text-white/70">Nom de l'entreprise</Label>
                  <Input
                    value={companyName}
                    onChange={e => { setCompanyName(e.target.value); if (nameError) setNameError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleNextStep()}
                    placeholder="Ex: Boutique Koné, TechStore CI..."
                    className="h-14 text-lg bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-blue-500/50 rounded-xl"
                  />
                  {nameError && <p className="text-red-400 text-sm">{nameError}</p>}
                </div>

                <Button onClick={handleNextStep} className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl border-0">
                  Continuer <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {/* STEP 2 — Sélection modules */}
            {step === "modules" && (
              <motion.div key="modules" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 mb-2">
                    <Sparkles className="h-8 w-8 text-violet-400" />
                  </div>
                  <h1 className="text-2xl font-bold">Choisissez vos modules</h1>
                  <p className="text-white/50">
                    Activez uniquement ce dont <span className="text-white font-medium">{companyName}</span> a besoin
                  </p>
                </div>

                {/* Modules individuels */}
                <div className="grid gap-3">
                  {MODULE_CONFIGS.map(mod => {
                    const isSelected = selectedKeys.includes(mod.key);
                    return (
                      <motion.button
                        key={mod.key}
                        onClick={() => toggleModule(mod.key)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative p-5 rounded-2xl border text-left transition-all duration-200 ${isSelected ? "border-blue-500/60 bg-blue-500/10" : "border-white/10 bg-white/[0.03] hover:border-white/20"}`}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">{mod.icon}</span>
                          <div>
                            <p className="font-semibold text-white">{mod.label}</p>
                            <p className="text-sm text-white/40">{mod.description}</p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Séparateur */}
                <div className="flex items-center gap-3 text-white/20 text-xs">
                  <div className="flex-1 h-px bg-white/10" />
                  ou choisir une combinaison
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Presets de fusion */}
                <div className="grid grid-cols-2 gap-3">
                  {FUSION_PRESETS.map((preset, idx) => {
                    const isActive = activePreset === idx;
                    return (
                      <motion.button
                        key={idx}
                        onClick={() => applyPreset(idx)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`relative p-4 rounded-xl border text-left transition-all ${isActive ? "border-violet-500/60 bg-violet-500/10" : "border-white/10 bg-white/[0.02] hover:border-white/20"}`}
                      >
                        {preset.popular && <span className="absolute -top-2 right-3 text-[10px] bg-violet-500 text-white px-2 py-0.5 rounded-full font-medium">Populaire</span>}
                        {isActive && <Check className="absolute top-3 right-3 h-4 w-4 text-violet-400" />}
                        <div className="flex items-start gap-3">
                          <span className="text-xl">{preset.icon}</span>
                          <div>
                            <p className="font-medium text-sm text-white">{preset.label}</p>
                            <p className="text-xs text-white/30 mt-0.5">{preset.description}</p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Résumé sélection */}
                {selectedKeys.length > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-white/40">Modules activés :</span>
                      {selectedKeys.map(k => {
                        const cfg = MODULE_CONFIGS.find(m => m.key === k)!;
                        return <span key={k} className="text-xs bg-white/10 px-2 py-1 rounded-full">{cfg.icon} {cfg.label}</span>;
                      })}
                    </div>
                    <span className="text-xs text-white/30">{selectedKeys.length} module{selectedKeys.length > 1 ? "s" : ""}</span>
                  </motion.div>
                )}

                {/* Boutons */}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("company")} className="flex-1 h-12 border border-white/10 text-white/60 hover:text-white hover:bg-white/5 rounded-xl bg-transparent">
                    Retour
                  </Button>
                  <Button onClick={handleSave} disabled={saving || selectedKeys.length === 0} className="flex-1 h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl border-0">
                    {saving ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Création...</>) : (<>Lancer mon espace <ArrowRight className="ml-2 h-5 w-5" /></>)}
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
