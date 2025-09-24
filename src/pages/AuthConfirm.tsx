import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AuthConfirm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmUser = async () => {
      try {
        const tokenHash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        
        if (!tokenHash || !type) {
          setStatus('error');
          setMessage('Lien de confirmation invalide');
          return;
        }

        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as any
        });

        if (error) {
          console.error('Erreur de confirmation:', error);
          setStatus('error');
          setMessage(error.message || 'Erreur lors de la confirmation du compte');
        } else if (data.user) {
          setStatus('success');
          setMessage('Votre compte a été confirmé avec succès !');
          
          // Redirection automatique après 3 secondes
          setTimeout(() => {
            navigate('/app');
          }, 3000);
        }
      } catch (err: any) {
        console.error('Erreur inattendue:', err);
        setStatus('error');
        setMessage('Une erreur inattendue est survenue');
      }
    };

    confirmUser();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Confirmation en cours...</h2>
              <p className="text-muted-foreground">Veuillez patienter pendant la vérification de votre compte.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Compte confirmé !</h2>
              <p className="text-muted-foreground mb-6">{message}</p>
              <Alert className="border-green-200 bg-green-50 mb-4">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Redirection automatique vers votre dashboard dans 3 secondes...
                </AlertDescription>
              </Alert>
              <Button 
                onClick={() => navigate('/app')} 
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-medium"
              >
                Accéder à mon dashboard
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Erreur de confirmation</h2>
              <p className="text-muted-foreground mb-6">{message}</p>
              <Alert variant="destructive" className="mb-4">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  Le lien de confirmation a peut-être expiré ou est invalide.
                </AlertDescription>
              </Alert>
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/auth')} 
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-medium"
                >
                  Retour à la connexion
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.reload()} 
                  className="w-full h-12 rounded-2xl"
                >
                  Réessayer
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}