import { useAuth } from "@/contexts/AuthContext";
import { AdminOwnerDashboard } from "./AdminOwnerDashboard";
import { ManagerDashboard } from "./ManagerDashboard";
import { CaissierDashboard } from "./CaissierDashboard";
import { StockDashboard } from "./StockDashboard";
import { CommandesDashboard } from "./CommandesDashboard";
import { LivreurRoleDashboard } from "./LivreurRoleDashboard";
import { MinimalDashboard } from "./MinimalDashboard";
import {
  getPerms,
  isFullAccess,
  canPos,
  canStock,
  canOrders,
  isDriverOnly,
  canOwnDeliveries,
} from "@/lib/rolePermissions";

export function RoleDashboard() {
  const { isEmployee, memberInfo } = useAuth();

  // Le dashboard propriétaire est réservé EXCLUSIVEMENT au propriétaire réel.
  if (!isEmployee) return <AdminOwnerDashboard />;

  const perms = getPerms(memberInfo);

  // Accès complet → vue manager (estampillée employé)
  if (isFullAccess(perms)) return <ManagerDashboard />;

  // Livreur pur → vue dédiée livraisons
  if (isDriverOnly(perms)) return <LivreurRoleDashboard />;

  // Composition dynamique à partir des permissions actives
  const blocks: { key: string; node: React.ReactNode }[] = [];
  if (canPos(perms)) blocks.push({ key: "pos", node: <CaissierDashboard hideGreeting={blocks.length > 0} /> });
  if (canStock(perms)) blocks.push({ key: "stock", node: <StockDashboard hideGreeting={blocks.length > 0} /> });
  if (canOrders(perms)) blocks.push({ key: "orders", node: <CommandesDashboard hideGreeting={blocks.length > 0} /> });
  if (canOwnDeliveries(perms)) blocks.push({ key: "deliveries", node: <LivreurRoleDashboard hideGreeting={blocks.length > 0} /> });

  // Aucune permission reconnue → dashboard minimal générique (jamais celui du propriétaire)
  if (blocks.length === 0) return <MinimalDashboard />;

  if (blocks.length === 1) return <>{blocks[0].node}</>;

  return (
    <div className="space-y-8 animate-fade-in">
      {blocks.map((b) => (
        <div key={b.key}>{b.node}</div>
      ))}
    </div>
  );
}
