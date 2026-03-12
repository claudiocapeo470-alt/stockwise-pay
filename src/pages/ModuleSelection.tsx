import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, ArrowLeft, Building2, Loader2, Sparkles, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCompanyModules, MODULE_CONFIGS, ModuleKey } from "@/hooks/useCompanyModules";
import { toast } from "sonner";
import stocknixLogo from "@/assets/stocknix-logo-official.png";

// Détails par module pour le carousel
const MODULE_DETAILS: Record<ModuleKey, { features: string[]; highlight: string }> = {
  boutique: {
    highlight: "Lancez votre boutique en ligne en quelques clics",
    features: [
      "🛒 Vitrine produits personnalisable",
      "📦 Commandes clients en temps réel",
      "⭐ Gestion des avis clients",
      "📱 Responsive & optimisée mobile",
      "🔗 Lien partageable sur WhatsApp",
    ],
  },
  pos: {
    highlight: "Encaissez vos clients rapidement en magasin",
    features: [
      "💳 Paiements espèces, Mobile Money, CB",
      "📷 Scanner codes-barres avec caméra",
      "🧾 Tickets de caisse instantanés",
      "📊 Suivi des ventes en temps réel",
      "💰 Rapports de caisse quotidiens",
    ],
  },
  stock: {
    highlight: "Gardez le contrôle total sur votre inventaire",
    features: [
      "📦 Inventaire complet avec alertes",
      "📄 Factures & devis professionnels",
      "🚚 Suivi des livraisons",
      "📉 Alertes rupture de stock",
      "📤 Export Excel / PDF",
    ],
  },
};

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
  },
  {
    keys: ["boutique", "stock"] as ModuleKey[],
    label: "E-commerce & Stock",
    description: "Boutique en ligne + Inventaire",
    icon: "🌐",
  },
  {
    keys: ["boutique", "pos"] as ModuleKey[],
    label: "Vente multi-canal",
    description: "En ligne + En magasin",
    icon: "⚡",
  },
];

function ModuleDetailCarousel({ moduleKey }: { moduleKey: ModuleKey }) {
  const details = MODULE_DETAILS[moduleKey];
  const config = MODULE_CONFIGS.find(m => m.key === moduleKey)!;
  const [page, setPage] = useState(0);
  const perPage = 3;
  const pages = Math.ceil(details.features.length / perPage);
  const visible = details.features.slice(page * perPage, (page + 1) * perPage);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      className="mt-3 overflow-hidden"
    >
      <div className={`rounded-xl p-4 bg-gradient-to-br ${config.color} bg-opacity-10 border border-white/10`}
        style={{ background: `linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--accent) / 0.05))` }}
      >
        <p className="text-sm font-medium text-foreground/80 mb-3">{details.highlight}</p>
        <div className="space-y-2">
          {visible.map((feat, i) => (
            <motion.div
              key={feat}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="text-sm text-muted-foreground"
            >
              {feat}
            </motion.div>
          ))}
        </div>
        {pages > 1 && (
          <div className="flex items-center justify-end gap-2 mt-3">
            <button
              onClick={(e) => { e.stopPropagation(); setPage(Math.max(0, page - 1)); }}
              disabled={page === 0}
              className="p-1 rounded-md hover:bg-foreground/10 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </button>
            <span className="text-xs text-muted-foreground">{page + 1}/{pages}</span>
            <button
              onClick={(e) => { e.stopPropagation(); setPage(Math.min(pages - 1, page + 1)); }}
              disabled={page === pages - 1}
              className="p-1 rounded-md hover:bg-foreground/10 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

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
  const [showPresets, setShowPresets] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState("");
  const [expandedModule, setExpandedModule] = useState<ModuleKey | null>(null);

  const toggleModule = (key: ModuleKey) => {
    setSelectedKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
    setExpandedModule(prev => (prev === key ? null : key));
  };

  const applyPreset = (idx: number) => {
    setSelectedKeys(FUSION_PRESETS[idx].keys);
    setShowPresets(false);
    setExpandedModule(null);
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
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen px-4 py-6 sm:py-10 sm:justify-center">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6 sm:mb-8">
          <img src={stocknixLogo} alt="Stocknix" className="h-9 w-9" />
          <div>
            <h2 className="text-lg font-bold">Stocknix</h2>
            <p className="text-xs text-muted-foreground">Configuration de votre espace</p>
          </div>
        </motion.div>

        <div className="w-full max-w-lg">
          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`h-1 flex-1 rounded-full transition-colors ${step === "company" || step === "modules" ? "bg-primary" : "bg-muted"}`} />
            <div className={`h-1 flex-1 rounded-full transition-colors ${step === "modules" ? "bg-primary" : "bg-muted"}`} />
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1 — Nom entreprise */}
            {step === "company" && (
              <motion.div key="company" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 border border-primary/20 mb-2">
                    <Building2 className="h-7 w-7 text-primary" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold">Votre entreprise</h1>
                  <p className="text-muted-foreground text-sm">Comment s'appelle votre business ?</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm">Nom de l'entreprise</Label>
                  <Input
                    value={companyName}
                    onChange={e => { setCompanyName(e.target.value); if (nameError) setNameError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleNextStep()}
                    placeholder="Ex: Boutique Koné, TechStore CI..."
                    className="h-12 text-base"
                  />
                  {nameError && <p className="text-destructive text-sm">{nameError}</p>}
                </div>

                <Button onClick={handleNextStep} className="w-full h-12 text-base">
                  Continuer <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {/* STEP 2 — Sélection modules */}
            {step === "modules" && (
              <motion.div key="modules" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-accent/10 border border-accent/20 mb-2">
                    <Sparkles className="h-7 w-7 text-primary" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold">Choisissez vos modules</h1>
                  <p className="text-muted-foreground text-sm">
                    Activez ce dont <span className="text-foreground font-medium">{companyName}</span> a besoin
                  </p>
                </div>

                {/* Modules individuels */}
                <div className="space-y-3">
                  {MODULE_CONFIGS.map(mod => {
                    const isSelected = selectedKeys.includes(mod.key);
                    const isExpanded = expandedModule === mod.key;
                    return (
                      <div key={mod.key}>
                        <motion.button
                          onClick={() => toggleModule(mod.key)}
                          whileTap={{ scale: 0.98 }}
                          className={`relative w-full p-4 sm:p-5 border text-left transition-all duration-200 ${
                            isSelected
                              ? "border-primary/50 bg-primary/5"
                              : "border-border bg-card hover:border-primary/30"
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-3 right-3 w-6 h-6 bg-primary flex items-center justify-center">
                              <Check className="h-4 w-4 text-primary-foreground" />
                            </div>
                          )}
                          <div className="flex items-center gap-3 sm:gap-4">
                            <span className="text-2xl sm:text-3xl">{mod.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground text-sm sm:text-base">{mod.label}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground">{mod.description}</p>
                            </div>
                          </div>
                        </motion.button>

                        {/* Detail carousel when selected */}
                        <AnimatePresence>
                          {isSelected && isExpanded && (
                            <ModuleDetailCarousel moduleKey={mod.key} />
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                {/* Combinaisons — collapsible */}
                <div>
                  <button
                    onClick={() => setShowPresets(!showPresets)}
                    className="flex items-center justify-center gap-2 w-full py-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <div className="h-px flex-1 bg-border" />
                    <span className="flex items-center gap-1 shrink-0">
                      ou choisir une combinaison
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showPresets ? "rotate-180" : ""}`} />
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </button>

                  <AnimatePresence>
                    {showPresets && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          {FUSION_PRESETS.map((preset, idx) => {
                            const isActive = selectedKeys.length > 0 &&
                              preset.keys.length === selectedKeys.length &&
                              preset.keys.every(k => selectedKeys.includes(k));
                            return (
                              <motion.button
                                key={idx}
                                onClick={() => applyPreset(idx)}
                                whileTap={{ scale: 0.98 }}
                                className={`relative p-3 sm:p-4 border text-left transition-all ${
                                  isActive
                                    ? "border-primary/50 bg-primary/5"
                                    : "border-border bg-card hover:border-primary/30"
                                }`}
                              >
                                {preset.popular && (
                                  <span className="absolute -top-2 right-2 text-[10px] bg-primary text-primary-foreground px-2 py-0.5 font-medium">
                                    Populaire
                                  </span>
                                )}
                                {isActive && <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />}
                                <div className="flex items-start gap-2">
                                  <span className="text-lg">{preset.icon}</span>
                                  <div>
                                    <p className="font-medium text-xs sm:text-sm text-foreground">{preset.label}</p>
                                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 leading-tight">{preset.description}</p>
                                  </div>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Résumé sélection */}
                <AnimatePresence>
                  {selectedKeys.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="flex items-center justify-between p-3 bg-muted/50 border border-border"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">Activés :</span>
                        {selectedKeys.map(k => {
                          const cfg = MODULE_CONFIGS.find(m => m.key === k)!;
                          return (
                            <span key={k} className="text-xs bg-primary/10 text-primary px-2 py-1">
                              {cfg.icon} {cfg.label}
                            </span>
                          );
                        })}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        {selectedKeys.length} module{selectedKeys.length > 1 ? "s" : ""}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Boutons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep("company")}
                    className="flex-1 h-11"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving || selectedKeys.length === 0}
                    className="flex-1 h-11"
                  >
                    {saving ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Création...</>
                    ) : (
                      <>Lancer mon espace <ArrowRight className="ml-2 h-5 w-5" /></>
                    )}
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
