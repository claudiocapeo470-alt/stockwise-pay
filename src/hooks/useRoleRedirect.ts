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

    // Caissier -> espace caisse stand-alone
    if (role.includes('caissier') && location.pathname === '/app') {
      navigate('/app/caisse', { replace: true });
      return;
    }
    // Livreur -> espace livraisons
    if (role.includes('livreur') && location.pathname === '/app') {
      navigate('/app/livreur', { replace: true });
    }
  }, [isEmployee, memberInfo, navigate, location.pathname]);
}
