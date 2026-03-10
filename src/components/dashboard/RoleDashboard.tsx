import { useAuth } from "@/contexts/AuthContext";
import { AdminOwnerDashboard } from "./AdminOwnerDashboard";
import { ManagerDashboard } from "./ManagerDashboard";
import { CaissierDashboard } from "./CaissierDashboard";
import { StockDashboard } from "./StockDashboard";
import { CommandesDashboard } from "./CommandesDashboard";
import { FusionDashboard } from "./FusionDashboard";
import { LivreurRoleDashboard } from "./LivreurRoleDashboard";

export function RoleDashboard() {
  const { isEmployee, memberInfo } = useAuth();

  if (!isEmployee) return <AdminOwnerDashboard />;

  const role = (memberInfo?.member_role_name || '').toLowerCase();
  if (role.includes('manager')) return <ManagerDashboard />;
  if (role.includes('caissier')) return <CaissierDashboard />;
  if (role.includes('livreur')) return <LivreurRoleDashboard />;
  if (role.includes('fusionn')) return <FusionDashboard />;
  if (role.includes('commande')) return <CommandesDashboard />;
  if (role.includes('stock')) return <StockDashboard />;
  return <AdminOwnerDashboard />;
}
