import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const REDIRECT_FLAG_KEY = 'role_redirect_done';

/**
 * Redirige UNE SEULE FOIS par session à l'arrivée initiale d'un employé vers son espace dédié.
 * Le flag est stocké dans sessionStorage pour se réinitialiser proprement entre sessions.
 */
export function useRoleRedirect() {
  const { isEmployee, memberInfo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const initialPathRef = useRef(location.pathname);

  useEffect(() => {
    if (!isEmployee || !memberInfo) {
      sessionStorage.removeItem(REDIRECT_FLAG_KEY);
      return;
    }
    if (sessionStorage.getItem(REDIRECT_FLAG_KEY)) return;

    if (initialPathRef.current !== '/app') return;

    const role = (memberInfo.member_role_name || '').toLowerCase();

    if (role.includes('caissier')) {
      sessionStorage.setItem(REDIRECT_FLAG_KEY, '1');
      navigate('/app/caisse', { replace: true });
      return;
    }
    if (role.includes('livreur')) {
      sessionStorage.setItem(REDIRECT_FLAG_KEY, '1');
      navigate('/app/livreur', { replace: true });
      return;
    }
  }, [isEmployee, memberInfo, navigate]);
}
