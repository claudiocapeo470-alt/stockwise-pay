import { RoleDashboard } from '@/components/dashboard/RoleDashboard';
import { useRoleRedirect } from '@/hooks/useRoleRedirect';
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileHomeGrid } from '@/components/layout/MobileHomeGrid';
import { useSales } from '@/hooks/useSales';
import { useCurrency } from '@/hooks/useCurrency';
import { useCompany } from '@/hooks/useCompany';

export default function Dashboard() {
  useRoleRedirect();
  const { isEmployee, memberInfo } = useAuth();
  const isMobile = useIsMobile();
  const { sales } = useSales();
  const { formatCurrency } = useCurrency();
  const { company } = useCompany();
  const companyName = company?.name?.trim() || 'Votre entreprise';

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
      <div className="flex flex-col gap-2.5 h-[calc(100dvh-10.25rem)] min-h-0 overflow-hidden">
        <div className="shrink-0 rounded-2xl bg-primary text-primary-foreground px-4 py-3.5 shadow-sm">
          <p className="text-[11px] uppercase tracking-wide opacity-70">Bienvenue !</p>
          <h2 className="text-xl font-bold leading-tight truncate mt-0.5">
            {companyName}
          </h2>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="rounded-xl bg-primary-foreground/10 px-3 py-2">
              <p className="text-[10px] opacity-70 leading-none">C.A (Mois)</p>
              <p className="text-sm font-bold mt-1 truncate">{formatCurrency(monthlyCA)}</p>
            </div>
            <div className="rounded-xl bg-primary-foreground/10 px-3 py-2">
              <p className="text-[10px] opacity-70 leading-none">Ventes (Mois)</p>
              <p className="text-sm font-bold mt-1 truncate">{monthlySales.length}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-0">
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
