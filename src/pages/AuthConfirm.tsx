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
          
          // Envoyer l'email de bienvenue après confirmation
          try {
            const response = await fetch(`https://fsdfzzhbydlmuiblgkvb.supabase.co/functions/v1/send-welcome-email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzZGZ6emhieWRsbXVpYmxna3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MTE5NjUsImV4cCI6MjA3MjQ4Nzk2NX0.NlfYPNMEpTAqXbJsLpBM3ubw0U2o5S63NVveVzLUT4w`
              },
              body: JSON.stringify({
                email: data.user.email,
                firstName: data.user.user_metadata?.first_name,
                lastName: data.user.user_metadata?.last_name
              })
            });

            if (response.ok) {
              console.log('Email de bienvenue envoyé avec succès');
            } else {
              console.warn('Erreur lors de l\'envoi de l\'email de bienvenue');
            }
          } catch (emailError) {
            console.warn('Email de bienvenue non envoyé:', emailError);
            // L'erreur d'email n'affecte pas la confirmation
          }
          
          // Redirection automatique après 3 secondes vers la page de connexion
          setTimeout(() => {
            navigate('/auth');
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
              <div className="w-16 h-16 bg-gradient-to-r from-success to-success rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-success-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Compte confirmé !</h2>
              <p className="text-muted-foreground mb-6">Félicitations ! Votre compte est maintenant actif. Vous pouvez maintenant vous connecter à votre espace.</p>
              <Alert className="border-success/30 bg-success/10 mb-4">
                <CheckCircle className="h-4 w-4 text-success" />
                <AlertDescription className="text-success">
                  Redirection automatique vers la page de connexion dans 3 secondes...
                </AlertDescription>
              </Alert>
              <Button 
                onClick={() => navigate('/auth')} 
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-medium"
              >
                Se connecter maintenant
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-gradient-to-r from-destructive to-destructive rounded-2xl flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-8 w-8 text-destructive-foreground" />
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