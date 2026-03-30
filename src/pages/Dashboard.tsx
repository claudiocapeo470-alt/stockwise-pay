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
  const { isEmployee } = useAuth();
  const isMobile = useIsMobile();
  const { sales } = useSales();
  const { formatCurrency } = useCurrency();

  // Calculate monthly stats
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlySales = (sales || []).filter(s => new Date(s.sale_date) >= monthStart);
  const monthlyCA = monthlySales.reduce((sum, s) => sum + (s.total_amount || 0), 0);

  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Monthly summary cards */}
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

        {/* Tile grid */}
        <MobileHomeGrid />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isEmployee && <OnboardingChecklist />}
      <RoleDashboard />
    </div>
  );
}
