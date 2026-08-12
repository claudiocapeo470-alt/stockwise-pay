import { RoleDashboard } from '@/components/dashboard/RoleDashboard';
import { useRoleRedirect } from '@/hooks/useRoleRedirect';
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileHomeGrid } from '@/components/layout/MobileHomeGrid';
import { useSales } from '@/hooks/useSales';
import { useCurrency } from '@/hooks/useCurrency';
import { useCompany } from '@/hooks/useCompany';
import { useCompanySettings } from '@/hooks/useCompanySettings';

export default function Dashboard() {
  useRoleRedirect();
  const { isEmployee, memberInfo } = useAuth();
  const isMobile = useIsMobile();
  const { sales } = useSales();
  const { formatCurrency } = useCurrency();
  const { company } = useCompany();
  const { settings } = useCompanySettings();
  const companyName = settings?.company_name?.trim() || company?.name?.trim() || 'Votre entreprise';

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlySales = (sales || []).filter(s => new Date(s.sale_date) >= monthStart);
  const monthlyCA = monthlySales.reduce((sum, s) => sum + (s.total_amount || 0), 0);

  const role = (memberInfo?.member_role_name || '').toLowerCase();

  // Mobile: role-specific employees get their dedicated dashboard
  if (isMobile && isEmployee && (role.includes('caissier') || role.includes('livreur'))) {
    return <RoleDashboard />;
  }

  // Mobile: owners get summary cards + grid
  if (isMobile && !isEmployee) {
    return (
      <div className="flex flex-col gap-4 h-[calc(100dvh-10.25rem)] min-h-0 overflow-hidden">
        <div className="shrink-0 rounded-3xl bg-primary text-primary-foreground px-5 py-5 shadow-sm">
          <h2 className="text-2xl font-bold leading-tight truncate mt-1">
            {companyName}
          </h2>
          <div className="grid grid-cols-2 gap-2.5 mt-4">
            <div className="rounded-2xl bg-primary-foreground/10 px-3.5 py-3">
              <p className="text-[11px] opacity-70 leading-none">C.A (Mois)</p>
              <p className="text-base font-bold mt-1.5 truncate">{formatCurrency(monthlyCA)}</p>
            </div>
            <div className="rounded-2xl bg-primary-foreground/10 px-3.5 py-3">
              <p className="text-[11px] opacity-70 leading-none">Ventes (Mois)</p>
              <p className="text-base font-bold mt-1.5 truncate">{monthlySales.length}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-0 mt-1">
          <MobileHomeGrid />
        </div>
      </div>
    );
  }

  // Mobile employees (non-caissier/livreur) get their role dashboard
  if (isMobile && isEmployee) {
    return <RoleDashboard />;
  }

  return (
    <div className="space-y-6">
      {!isEmployee && <OnboardingChecklist />}
      <RoleDashboard />
    </div>
  );
}
