import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { BrandLogo } from '@/components/ui/brand-logo';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'form' | 'success' | 'error'>('loading');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let resolved = false;

    const showForm = () => {
      if (resolved) return;
      resolved = true;
      setStatus('form');
    };
    const showError = () => {
      if (resolved) return;
      resolved = true;
      setStatus('error');
      setErrorMsg('Lien de réinitialisation invalide ou expiré. Veuillez faire une nouvelle demande.');
    };

    // Prefer the PASSWORD_RECOVERY event over an arbitrary timeout
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        showForm();
      }
    });

    // Fallback: check existing session immediately and after a brief grace period
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) showForm();
    };
    check();
    const timer = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) showForm();
      else showError();
    }, 2500);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error('Erreur : ' + error.message);
        return;
      }
      setStatus('success');
      toast.success('Mot de passe mis à jour avec succès !');
      setTimeout(() => navigate('/auth', { replace: true }), 3000);
    } catch (err: any) {
      toast.error('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sidebar via-sidebar-accent to-background dark p-4">
      <div className="w-full max-w-md bg-card/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-border p-8 space-y-6">
        <div className="text-center">
          <BrandLogo className="h-10 mx-auto" />
        </div>

        {status === 'loading' && (
          <div className="text-center space-y-4 py-6">
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-foreground">Vérification en cours…</h2>
          </div>
        )}

        {status === 'form' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Nouveau mot de passe</h2>
              <p className="text-sm text-muted-foreground">Choisissez un nouveau mot de passe sécurisé</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 caractères"
                    className="bg-background border-border text-foreground pr-10"
                    required
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Répétez votre mot de passe"
                    className="bg-background border-border text-foreground pr-10"
                    required
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-medium" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Mise à jour...</> : 'Mettre à jour le mot de passe'}
              </Button>
            </form>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center space-y-4 py-6">
            <CheckCircle className="h-12 w-12 text-primary mx-auto" />
            <h2 className="text-xl font-bold text-foreground">Mot de passe mis à jour !</h2>
            <p className="text-sm text-muted-foreground">Vous allez être redirigé vers la connexion…</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center space-y-4 py-6">
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-bold text-foreground">Lien invalide</h2>
            <p className="text-sm text-muted-foreground">{errorMsg}</p>
            <Button
              onClick={() => navigate('/auth')}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-medium"
            >
              Retour à la connexion
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
