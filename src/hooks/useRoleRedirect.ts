import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function useRoleRedirect() {
  const { isEmployee, memberInfo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isEmployee || !memberInfo) return;
    const role = (memberInfo.member_role_name || '').toLowerCase();

    // Caissier -> espace caisse (any non-caisse route)
    if (role.includes('caissier') && !location.pathname.startsWith('/app/caisse')) {
      navigate('/app/caisse', { replace: true });
      return;
    }
    // Livreur -> espace livraisons (any non-livreur route)
    if (role.includes('livreur') && !location.pathname.startsWith('/app/livreur')) {
      navigate('/app/livreur', { replace: true });
      return;
    }
  }, [isEmployee, memberInfo, navigate, location.pathname]);
}
