import { RoleDashboard } from '@/components/dashboard/RoleDashboard';
import { useRoleRedirect } from '@/hooks/useRoleRedirect';

export default function Dashboard() {
  useRoleRedirect();
  return <RoleDashboard />;
}
