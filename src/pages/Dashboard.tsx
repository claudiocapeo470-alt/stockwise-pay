import { RoleDashboard } from '@/components/dashboard/RoleDashboard';
import { useRoleRedirect } from '@/hooks/useRoleRedirect';
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  useRoleRedirect();
  const { isEmployee } = useAuth();
  return (
    <div className="space-y-6">
      {!isEmployee && <OnboardingChecklist />}
      <RoleDashboard />
    </div>
  );
}
