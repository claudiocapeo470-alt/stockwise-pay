import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import logo from '@/assets/stocknix-logo-official.png';

const CEO_EMAIL = 'support@stocknix.com';

export default function CeoLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // noindex for CEO login page
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().toLowerCase() !== CEO_EMAIL) {
      toast.error('Accès refusé', { description: 'Cet espace est réservé au CEO.' });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user?.email !== CEO_EMAIL) {
        await supabase.auth.signOut();
        toast.error('Accès refusé');
        return;
      }
      toast.success('Bienvenue, CEO !');
      navigate('/ceo/dashboard', { replace: true });
    } catch (err: any) {
      toast.error('Erreur de connexion', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <img src={logo} alt="Stocknix" className="h-10 mx-auto" />
          <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 px-3 py-1.5 rounded-full text-xs font-medium">
            <Shield className="h-3.5 w-3.5" /> Espace Propriétaire
          </div>
          <h1 className="text-2xl font-bold text-white">CEO Super Admin</h1>
          <p className="text-slate-400 text-sm">Connexion sécurisée au panneau de contrôle</p>
        </div>

        <form onSubmit={handleLogin} className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500">Email</label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="support@stocknix.com"
              className="bg-slate-800/60 border-slate-700/40 text-white placeholder:text-slate-600 focus:border-teal-500/40"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500">Mot de passe</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-slate-800/60 border-slate-700/40 text-white placeholder:text-slate-600 focus:border-teal-500/40 pr-10"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white border-0">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Connexion...</> : 'Se connecter'}
          </Button>
        </form>

        <p className="text-center text-slate-600 text-xs">Stocknix CEO Panel · Confidentiel</p>
      </div>
    </div>
  );
}
