import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const CEO_EMAIL = 'support@stocknix.com';

export function CeoGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.email !== CEO_EMAIL) {
        await supabase.auth.signOut();
        navigate('/ceo', { replace: true });
        return;
      }
      setVerified(true);
    };
    check();
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
