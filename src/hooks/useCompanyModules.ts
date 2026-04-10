import { useCompany } from './useCompany';
import { supabase } from '@/integrations/supabase/client';

export type ModuleKey = 'boutique' | 'pos' | 'stock';

export interface ModuleConfig {
  key: ModuleKey;
  label: string;
  description: string;
  icon: string;
  color: string;
  routes: string[];
}

export const MODULE_CONFIGS: ModuleConfig[] = [
  {
    key: 'boutique',
    label: 'Boutique en ligne',
    description: 'Vendez en ligne, gérez commandes et avis clients',
    icon: '🛍️',
    color: 'from-violet-500 to-purple-600',
    routes: ['/app/boutique/config', '/app/boutique/produits', '/app/boutique/commandes', '/app/boutique/avis'],
  },
  {
    key: 'pos',
    label: 'Caisse POS',
    description: 'Point de vente tactile, encaissement rapide en magasin',
    icon: '🖥️',
    color: 'from-emerald-500 to-teal-600',
    routes: ['/app/caisse', '/app/ventes', '/app/paiements'],
  },
  {
    key: 'stock',
    label: 'Gestion de stock',
    description: 'Inventaire, alertes de rupture, factures et devis',
    icon: '📦',
    color: 'from-orange-500 to-amber-600',
    routes: ['/app/stocks', '/app/factures', '/app/devis', '/app/livraisons'],
  },
];

export const MODULE_PLANS = [
  { keys: ['boutique'] as ModuleKey[], planId: 'boutique', label: 'Plan Boutique', description: 'Boutique en ligne + commandes + avis', icon: '🛍️', color: 'from-violet-500 to-purple-600' },
  { keys: ['pos'] as ModuleKey[], planId: 'pos', label: 'Plan Caisse POS', description: 'Caisse tactile + ventes + paiements', icon: '🖥️', color: 'from-emerald-500 to-teal-600' },
  { keys: ['stock'] as ModuleKey[], planId: 'stock', label: 'Plan Stock', description: 'Inventaire + factures + devis + livraisons', icon: '📦', color: 'from-orange-500 to-amber-600' },
  { keys: ['pos', 'stock'] as ModuleKey[], planId: 'magasin', label: 'Plan Magasin', description: 'Caisse POS + Gestion de stock', icon: '🏪', color: 'from-blue-500 to-cyan-600' },
  { keys: ['boutique', 'stock'] as ModuleKey[], planId: 'ecommerce', label: 'Plan E-commerce', description: 'Boutique en ligne + Inventaire', icon: '🌐', color: 'from-indigo-500 to-violet-600' },
  { keys: ['boutique', 'pos'] as ModuleKey[], planId: 'multicanal', label: 'Plan Multi-canal', description: 'Boutique en ligne + Caisse POS', icon: '⚡', color: 'from-orange-500 to-rose-500' },
  { keys: ['boutique', 'pos', 'stock'] as ModuleKey[], planId: 'toutEnUn', label: 'Plan Tout-en-un', description: 'Boutique + Caisse + Stock — accès complet', icon: '🚀', color: 'from-blue-600 via-violet-600 to-indigo-700', popular: true },
];

export function getMatchingPlan(modules: ModuleKey[]) {
  const sorted = [...modules].sort();
  return MODULE_PLANS.find(p => {
    const ps = [...p.keys].sort();
    return ps.length === sorted.length && ps.every((k, i) => k === sorted[i]);
  }) || null;
}

export function useCompanyModules() {
  const { company, loading, updateCompany, ensureCompany } = useCompany();

  const selectedModules: ModuleKey[] = (company?.selected_modules as ModuleKey[]) || [];
  const onboardingCompleted = company?.onboarding_completed ?? false;

  const hasModule = (key: ModuleKey): boolean => selectedModules.includes(key);

  const saveModules = async (modules: ModuleKey[], companyName?: string) => {
    // Resolve the company — use current state or fetch/create it
    const activeCompany = company ?? await ensureCompany();

    if (!activeCompany) {
      throw new Error("Votre entreprise est en cours d'initialisation. Réessayez dans quelques secondes.");
    }

    // Build updates
    const updates: Record<string, unknown> = {
      selected_modules: modules,
      onboarding_completed: true,
    };

    if (companyName) {
      updates.name = companyName;
      updates.company_name_set = true;
    }

    // Direct DB update using the resolved company ID — don't rely on updateCompany
    // which depends on React state that may not be synchronized yet
    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', activeCompany.id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    // Also try updateCompany to sync React state
    try {
      await updateCompany(updates as any);
    } catch {
      // State will sync on next render via useCompany effect
    }

    return { data, error: null };
  };

  const getActiveModuleConfigs = (): ModuleConfig[] =>
    MODULE_CONFIGS.filter(m => selectedModules.includes(m.key));

  const currentPlan = getMatchingPlan(selectedModules);

  return {
    selectedModules,
    onboardingCompleted,
    hasModule,
    saveModules,
    getActiveModuleConfigs,
    currentPlan,
    loading,
    company,
  };
}
