import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PageLoader } from '@/components/ui/PageLoader';

const CEO_EMAIL = (import.meta.env.VITE_CEO_EMAIL as string | undefined) || 'support@stocknix.com';

export function CeoGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'checking' | 'ok' | 'denied'>('checking');

  const verify = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.email !== CEO_EMAIL) {
        setStatus('denied');
        navigate('/ceo', { replace: true });
        return;
      }

      const { data: role } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (role?.role !== 'admin') {
        await supabase.auth.signOut();
        setStatus('denied');
        navigate('/ceo', { replace: true });
        return;
      }

      setStatus('ok');
    } catch {
      setStatus('denied');
      navigate('/ceo', { replace: true });
    }
  };

  useEffect(() => {
    verify();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setStatus('denied');
        navigate('/ceo', { replace: true });
      } else if (event === 'TOKEN_REFRESHED') {
        verify();
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  if (status === 'checking') {
    return <PageLoader label="Vérification sécurité..." className="bg-slate-950" />;
  }

  if (status === 'denied') return null;

  return <>{children}</>;
}
