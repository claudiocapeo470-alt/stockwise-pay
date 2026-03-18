import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useSessionWarning() {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'TOKEN_REFRESHED') {
          return;
        }
        if (event === 'SIGNED_OUT') {
          toast.error('Session expirée', {
            description: 'Votre session a expiré. Veuillez vous reconnecter.',
            duration: 8000,
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);
}
