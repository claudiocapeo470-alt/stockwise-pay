import { RoleDashboard } from '@/components/dashboard/RoleDashboard';
import { useRoleRedirect } from '@/hooks/useRoleRedirect';
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileHomeGrid } from '@/components/layout/MobileHomeGrid';
import { useSales } from '@/hooks/useSales';
import { useCurrency } from '@/hooks/useCurrency';

export default function Dashboard() {
  useRoleRedirect();
  const { isEmployee, memberInfo } = useAuth();
  const isMobile = useIsMobile();
  const { sales } = useSales();
  const { formatCurrency } = useCurrency();

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
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-primary rounded-xl p-4 text-primary-foreground">
            <p className="text-xs opacity-80">C.A (Mois)</p>
            <p className="text-lg font-bold mt-1">{formatCurrency(monthlyCA)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">Ventes (Mois)</p>
            <p className="text-lg font-bold mt-1 text-foreground">{monthlySales.length}</p>
          </div>
        </div>
        <MobileHomeGrid />
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
