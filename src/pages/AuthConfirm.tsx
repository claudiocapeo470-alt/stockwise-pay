import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import stocknixLogo from '@/assets/stocknix-logo.png';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#081020] p-4">
      <div className="w-full max-w-md bg-[#0f2440]/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 text-center space-y-6">
        <img src={stocknixLogo} alt="Stocknix" className="h-10 mx-auto object-contain" />
        
        {status === 'loading' && (
          <div className="space-y-4 py-6">
            <Loader2 className="h-12 w-12 text-emerald-400 animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-white">Vérification en cours…</h2>
            <p className="text-sm text-slate-400">Nous confirmons votre adresse email, veuillez patienter.</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="space-y-4 py-6">
            <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Compte confirmé !</h2>
            <p className="text-sm text-slate-400">Votre email a été vérifié. Redirection en cours…</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="space-y-4 py-6">
            <XCircle className="h-12 w-12 text-red-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Échec de la confirmation</h2>
            <p className="text-sm text-slate-400">{errorMsg}</p>
            <Button
              onClick={() => navigate('/auth')}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium"
            >
              Retour à la connexion
            </Button>
            <p className="text-xs text-slate-500">
              Besoin d'un nouveau lien ? Connectez-vous et cliquez sur "Renvoyer la confirmation".
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
