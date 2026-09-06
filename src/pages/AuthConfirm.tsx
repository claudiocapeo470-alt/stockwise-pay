import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/ui/brand-logo';

export default function AuthConfirm() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      await new Promise(res => setTimeout(res, 1500));
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        setStatus('error');
        setErrorMsg('Lien de confirmation invalide ou expiré.');
        return;
      }

      if (session?.user) {
        setStatus('success');
        setTimeout(() => navigate('/app', { replace: true }), 2000);
      } else {
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.replace('#', '?'));
        const errDesc = params.get('error_description') || params.get('error');
        if (errDesc) {
          setStatus('error');
          setErrorMsg(decodeURIComponent(errDesc.replace(/\+/g, ' ')));
        } else {
          const { data: { session: s2 } } = await supabase.auth.getSession();
          if (s2?.user) {
            setStatus('success');
            setTimeout(() => navigate('/app', { replace: true }), 2000);
          } else {
            setStatus('error');
            setErrorMsg('Impossible de vérifier votre compte. Le lien a peut-être expiré.');
          }
        }
      }
    };
    checkSession();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sidebar via-sidebar-accent to-background dark p-4">
      <div className="w-full max-w-md bg-card/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-border p-8 text-center space-y-6">
        <BrandLogo className="h-10 mx-auto" />
        
        {status === 'loading' && (
          <div className="space-y-4 py-6">
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-foreground">Vérification en cours…</h2>
            <p className="text-sm text-muted-foreground">Nous confirmons votre adresse email, veuillez patienter.</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="space-y-4 py-6">
            <CheckCircle className="h-12 w-12 text-primary mx-auto" />
            <h2 className="text-xl font-bold text-foreground">Compte confirmé !</h2>
            <p className="text-sm text-muted-foreground">Votre email a été vérifié. Redirection en cours…</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="space-y-4 py-6">
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-bold text-foreground">Échec de la confirmation</h2>
            <p className="text-sm text-muted-foreground">{errorMsg}</p>
            <Button
              onClick={() => navigate('/auth')}
              className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-medium"
            >
              Retour à la connexion
            </Button>
            <p className="text-xs text-muted-foreground">
              Besoin d'un nouveau lien ? Connectez-vous et cliquez sur "Renvoyer la confirmation".
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
