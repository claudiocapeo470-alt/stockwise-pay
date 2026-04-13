import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

// Map routes to required permissions
const ROUTE_PERMISSIONS: Record<string, string> = {
  '/app/stocks': 'stock',
  '/app/caisse': 'pos',
  '/app/ventes': 'sales',
  '/app/facturation': 'sales',
  '/app/boutique/config': 'boutique',
  '/app/boutique/produits': 'boutique',
  '/app/boutique/commandes': 'boutique_orders',
  '/app/boutique/avis': 'boutique',
  '/app/livraisons': 'deliveries',
  '/app/clients': 'customers_minimal',
  '/app/team': 'settings',
  '/app/settings': 'settings',
  '/app/performance': 'performance',
};

function getDefaultRoute(memberInfo: any): string {
  if (!memberInfo) return '/app';
  const role = memberInfo.member_role_name?.toLowerCase() || '';
  if (role.includes('caissier')) return '/app/caisse';
  if (role.includes('livreur')) return '/app/livreur';
  if (role.includes('manager')) return '/app';
  if (role.includes('gestionnaire') || role.includes('stock')) return '/app/stocks';
  if (role.includes('vendeur') || role.includes('commande')) return '/app/boutique/commandes';
  if (role.includes('fusionn')) return '/app';
  return '/app';
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, isEmployee, hasPermission, memberInfo } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="rounded-full h-8 w-8 border-b-2 border-primary animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  // Check route-level permissions for employees
  if (isEmployee) {
    const path = location.pathname;
    const role = memberInfo?.member_role_name?.toLowerCase() || '';
    const hasRoleRouteAccess =
      (path.startsWith('/app/caisse') && role.includes('caissier')) ||
      (path.startsWith('/app/livreur') && role.includes('livreur'));

    for (const [route, perm] of Object.entries(ROUTE_PERMISSIONS)) {
      if (path.startsWith(route) && !hasPermission(perm) && !hasRoleRouteAccess) {
        const fallbackRoute = getDefaultRoute(memberInfo)
        return <Navigate to={fallbackRoute === path ? '/app' : fallbackRoute} replace />
      }
    }
  }

  return <>{children}</>
}
