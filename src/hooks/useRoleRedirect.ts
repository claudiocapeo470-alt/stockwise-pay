import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

let hasPerformedInitialRoleRedirect = false;

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
  const initialPathRef = useRef(location.pathname);

  useEffect(() => {
    if (!isEmployee || !memberInfo) {
      hasPerformedInitialRoleRedirect = false;
      return;
    }
    if (hasPerformedInitialRoleRedirect) return;

    // On ne redirige qu'à l'arrivée initiale sur /app.
    // Si le composant se remonte sur une autre page (settings, auth, etc.), on ne force rien.
    if (initialPathRef.current !== '/app') return;

    const role = (memberInfo.member_role_name || '').toLowerCase();

    if (role.includes('caissier')) {
      hasPerformedInitialRoleRedirect = true;
      navigate('/app/caisse', { replace: true });
      return;
    }
    if (role.includes('livreur')) {
      hasPerformedInitialRoleRedirect = true;
      navigate('/app/livreur', { replace: true });
      return;
    }
  }, [isEmployee, memberInfo, navigate]);
}
