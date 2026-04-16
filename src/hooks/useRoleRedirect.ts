import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Redirige UNE SEULE FOIS à l'arrivée initiale d'un employé sur l'app vers son espace dédié.
 * - Caissier  → /app/caisse
 * - Livreur   → /app/livreur
 *
 * Ne s'exécute pas en boucle : on ne redirige plus dès qu'on a déjà redirigé une fois,
 * pour permettre à l'employé de naviguer librement (déconnexion, paramètres, etc.).
 */
export function useRoleRedirect() {
  const { isEmployee, memberInfo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (!isEmployee || !memberInfo) return;
    if (hasRedirectedRef.current) return;

    // On ne redirige que depuis la racine /app (pas depuis une sous-page volontaire)
    if (location.pathname !== '/app') return;

    const role = (memberInfo.member_role_name || '').toLowerCase();

    if (role.includes('caissier')) {
      hasRedirectedRef.current = true;
      navigate('/app/caisse', { replace: true });
      return;
    }
    if (role.includes('livreur')) {
      hasRedirectedRef.current = true;
      navigate('/app/livreur', { replace: true });
      return;
    }
  }, [isEmployee, memberInfo, navigate, location.pathname]);
}
