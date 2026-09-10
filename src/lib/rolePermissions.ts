import type { MemberInfo } from "@/contexts/AuthContext";

export type Perms = Record<string, any>;

export function getPerms(memberInfo?: MemberInfo | null): Perms {
  return (memberInfo?.member_permissions as Perms) || {};
}

export const isFullAccess = (p: Perms) => p.all === true;
export const canPos = (p: Perms) => p.pos === true;
export const canStock = (p: Perms) => p.stock === true;
export const canOrders = (p: Perms) => p.boutique_orders === true || p.boutique === true;
/** Vue livreur dédiée : permission propre, jamais basée sur le nom du rôle */
export const canOwnDeliveries = (p: Perms) => p.deliveries_own === true || p.deliveries === true;
/** Livreur "pur" : uniquement ses propres livraisons */
export const isDriverOnly = (p: Perms) =>
  !isFullAccess(p) && p.deliveries_own === true && !canPos(p) && !canStock(p) && !canOrders(p);

/**
 * Route par défaut d'un employé, déduite de ses permissions réelles.
 */
export function getDefaultRouteFromPerms(p: Perms): string {
  if (isFullAccess(p)) return "/app";
  if (isDriverOnly(p)) return "/app/livreur";
  if (canPos(p)) return "/app/caisse";
  if (canStock(p)) return "/app/stocks";
  if (canOrders(p)) return "/app/boutique/commandes";
  return "/app";
}
