import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import stocknixLogo from '@/assets/stocknix-logo.png';

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
    const checkSession = async () => {
      await new Promise(res => setTimeout(res, 1000));
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setStatus('form');
      } else {
        setStatus('error');
        setErrorMsg('Lien de réinitialisation invalide ou expiré. Veuillez faire une nouvelle demande.');
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#081020] p-4">
      <div className="w-full max-w-md bg-[#0f2440]/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 space-y-6">
        <div className="text-center">
          <img src={stocknixLogo} alt="Stocknix" className="h-10 mx-auto object-contain" />
        </div>

        {status === 'loading' && (
          <div className="text-center space-y-4 py-6">
            <Loader2 className="h-12 w-12 text-emerald-400 animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-white">Vérification en cours…</h2>
          </div>
        )}

        {status === 'form' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Nouveau mot de passe</h2>
              <p className="text-sm text-slate-400">Choisissez un nouveau mot de passe sécurisé</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 caractères"
                    className="bg-[#0d1f3c] border-[#1e3a5f] text-white pr-10"
                    required
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Répétez votre mot de passe"
                    className="bg-[#0d1f3c] border-[#1e3a5f] text-white pr-10"
                    required
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Mise à jour...</> : 'Mettre à jour le mot de passe'}
              </Button>
            </form>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center space-y-4 py-6">
            <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Mot de passe mis à jour !</h2>
            <p className="text-sm text-slate-400">Vous allez être redirigé vers la connexion…</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center space-y-4 py-6">
            <XCircle className="h-12 w-12 text-red-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Lien invalide</h2>
            <p className="text-sm text-slate-400">{errorMsg}</p>
            <Button
              onClick={() => navigate('/auth')}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium"
            >
              Retour à la connexion
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
