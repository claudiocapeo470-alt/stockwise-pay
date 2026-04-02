import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const CEO_EMAIL = 'support@stocknix.com';

export function CeoGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          navigate('/ceo', { replace: true });
          return;
        }

        if (session.user.email !== CEO_EMAIL) {
          await supabase.auth.signOut();
          navigate('/ceo', { replace: true });
          return;
        }

        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (roleData?.role !== 'admin') {
          await supabase.auth.signOut();
          navigate('/ceo', { replace: true });
          return;
        }

        setVerified(true);
      } catch (err) {
        console.error('CeoGuard check error:', err);
        navigate('/ceo', { replace: true });
      }
    };

    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setVerified(false);
        navigate('/ceo', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (!verified) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
