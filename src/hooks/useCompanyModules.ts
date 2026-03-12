import { useCompany } from './useCompany';

export type ModuleKey = 'boutique' | 'pos' | 'stock';

export interface ModuleConfig {
  key: ModuleKey;
  label: string;
  description: string;
  icon: string;
  color: string;
  routes: string[];
  employeeRoles: string[];
}

export const MODULE_CONFIGS: ModuleConfig[] = [
  {
    key: 'boutique',
    label: 'Boutique en ligne',
    description: 'Vendez en ligne, gérez commandes et avis clients',
    icon: '🛍️',
    color: 'from-violet-500 to-purple-600',
    routes: ['/app/boutique/config', '/app/boutique/produits', '/app/boutique/commandes', '/app/boutique/avis'],
    employeeRoles: ['vendeur'],
  },
  {
    key: 'pos',
    label: 'Caisse POS',
    description: 'Point de vente tactile, encaissement rapide en magasin',
    icon: '🖥️',
    color: 'from-emerald-500 to-teal-600',
    routes: ['/app/caisse', '/app/ventes', '/app/paiements'],
    employeeRoles: ['caissier'],
  },
  {
    key: 'stock',
    label: 'Gestion de stock',
    description: 'Inventaire, alertes de rupture, factures et devis',
    icon: '📦',
    color: 'from-orange-500 to-amber-600',
    routes: ['/app/stocks', '/app/factures', '/app/devis', '/app/livraisons'],
    employeeRoles: ['gestionnaire', 'livreur'],
  },
];

export function useCompanyModules() {
  const { company, loading, updateCompany } = useCompany();

  const selectedModules: ModuleKey[] = (company?.selected_modules as ModuleKey[]) || [];
  const onboardingCompleted = company?.onboarding_completed ?? false;

  const hasModule = (key: ModuleKey): boolean => selectedModules.includes(key);
  const hasAnyModule = (): boolean => selectedModules.length > 0;

  const saveModules = async (modules: ModuleKey[], companyName?: string) => {
    const updates: Record<string, unknown> = {
      selected_modules: modules,
      onboarding_completed: true,
    };
    if (companyName) {
      updates.name = companyName;
      updates.company_name_set = true;
    }
    return updateCompany(updates);
  };

  const getActiveModuleConfigs = (): ModuleConfig[] =>
    MODULE_CONFIGS.filter(m => selectedModules.includes(m.key));

  const getAllowedRoutes = (): string[] => {
    const base = ['/app', '/app/performance', '/app/rapports', '/app/rapport-employes', '/app/team', '/app/profile', '/app/settings', '/app/subscription'];
    const moduleRoutes = getActiveModuleConfigs().flatMap(m => m.routes);
    return [...base, ...moduleRoutes];
  };

  return {
    selectedModules,
    onboardingCompleted,
    hasModule,
    hasAnyModule,
    saveModules,
    getActiveModuleConfigs,
    getAllowedRoutes,
    loading,
    company,
  };
}
