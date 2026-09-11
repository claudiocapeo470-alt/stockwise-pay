import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { PageLoader } from '@/components/ui/PageLoader'
import { getDefaultRouteFromPerms, getPerms } from '@/lib/rolePermissions'

interface ProtectedRouteProps {
  children: React.ReactNode
}

// Map routes to required permissions
const ROUTE_PERMISSIONS: Record<string, string> = {
  '/app/stocks': 'stock',
  '/app/caisse': 'pos',
  '/app/livreur': 'deliveries_own',
  '/app/ventes': 'sales',
  '/app/facturation': 'sales',
  '/app/factures': 'sales',
  '/app/devis': 'sales',
  '/app/paiements': 'sales',
  '/app/rapports': 'reports',
  '/app/rapport-employes': 'reports',
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

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, isEmployee, hasPermission, memberInfo } = useAuth()
  const location = useLocation()

  if (loading) {
    return <PageLoader />
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  // Check route-level permissions for employees (basé UNIQUEMENT sur les permissions, jamais sur le nom du rôle)
  if (isEmployee) {
    const path = location.pathname;

    for (const [route, perm] of Object.entries(ROUTE_PERMISSIONS)) {
      if (path.startsWith(route) && !hasPermission(perm)) {
        const fallbackRoute = getDefaultRouteFromPerms(getPerms(memberInfo))
        return <Navigate to={fallbackRoute === path ? '/app' : fallbackRoute} replace />
      }
    }
  }

  return <>{children}</>
}
