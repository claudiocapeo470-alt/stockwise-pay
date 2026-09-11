import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getPerms, isDriverOnly, canPos } from '@/lib/rolePermissions';

const REDIRECT_FLAG_KEY = 'role_redirect_done';

/**
 * Redirige UNE SEULE FOIS par session à l'arrivée initiale d'un employé vers son espace dédié,
 * en se basant sur ses permissions réelles (jamais sur le nom du rôle).
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

    const perms = getPerms(memberInfo);

    if (isDriverOnly(perms)) {
      sessionStorage.setItem(REDIRECT_FLAG_KEY, '1');
      navigate('/app/livreur', { replace: true });
      return;
    }
    if (canPos(perms) && perms.all !== true) {
      sessionStorage.setItem(REDIRECT_FLAG_KEY, '1');
      navigate('/app/caisse', { replace: true });
      return;
    }
  }, [isEmployee, memberInfo, navigate]);
}
