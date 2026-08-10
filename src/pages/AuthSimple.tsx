import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Eye, EyeOff, ArrowLeft, Users, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { PinKeypad } from "@/components/auth/PinKeypad";
import { BrandLogo, stocknixLogoWhite } from '@/components/ui/brand-logo';
import stocknixLogoIcon from '@/assets/stocknix-logo-icon.png';
import entrepreneursImage from "@/assets/african-entrepreneur-tablet.png";

// Schémas de validation
const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis')
});

const signupSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
  firstName: z.string().optional(),
  lastName: z.string().optional()
});

const resetEmailSchema = z.object({
  email: z.string().email('Email invalide')
});

export default function AuthSimple() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn, signUp, loading, setMemberInfo } = useAuth();
  
  const [screen, setScreen] = useState<'welcome' | 'method' | 'form' | 'employee'>('welcome');
  const [intent, setIntent] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  const goBack = () => {
    setScreen('welcome');
    setPinError('');
    setErrors({});
  };
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetStep, setResetStep] = useState<'email' | 'success' | null>(null);
  
  // PIN login state
  const [pinStep, setPinStep] = useState<'company' | 'pin'>('company');
  const [companyCode, setCompanyCode] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinLoading, setPinLoading] = useState(false);

  // États des formulaires
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  
  const [resetEmail, setResetEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/app`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error('Connexion Google impossible', { description: err?.message });
      setGoogleLoading(false);
    }
  };




  // noindex for auth pages - prevent SEO indexing
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  // Redirection si déjà connecté
  useEffect(() => {
    if (user && !loading) {
      // If employee, redirect to role-appropriate page
      const storedMember = localStorage.getItem('stocknix_member');
      if (storedMember) {
        try {
          const mi = JSON.parse(storedMember);
          const roleName = mi.member_role_name?.toLowerCase() || '';
          if (roleName.includes('caissier')) { navigate('/app/caisse', { replace: true }); return; }
          if (roleName.includes('livreur')) { navigate('/app/livreur', { replace: true }); return; }
          if (roleName.includes('gestionnaire')) { navigate('/app/stocks', { replace: true }); return; }
          if (roleName.includes('vendeur')) { navigate('/app/boutique/commandes', { replace: true }); return; }
        } catch {}
      }
      navigate('/app', { replace: true });
    }
  }, [user, loading, navigate]);

  // Handle email confirmation redirect  
  useEffect(() => {
    const confirmed = searchParams.get('confirmed');
    if (confirmed === 'true') {
      if (user) {
        navigate('/app', { replace: true });
      } else {
        navigate('/auth/confirm', { replace: true });
      }
    }
  }, [searchParams, user, navigate]);

  // PIN Login handler
  const handlePinLogin = async (pin: string) => {
    setPinLoading(true);
    setPinError('');
    
    try {
      const { data, error } = await supabase.functions.invoke('pin-login', {
        body: { company_code: companyCode, pin_code: pin }
      });

      if (error || !data?.success) {
        setPinError(data?.error || 'Code entreprise ou PIN incorrect');
        setPinLoading(false);
        return;
      }

      // Store member info in AuthContext and localStorage
      const mi = {
        member_id: data.member.id,
        member_first_name: data.member.first_name,
        member_last_name: data.member.last_name || null,
        member_photo_url: data.member.photo_url || null,
        member_role_name: data.member.role_name || '',
        member_permissions: data.member.permissions || {},
        company_id: data.member.company_id,
        company_name: data.member.company_name,
        company_logo_url: data.member.company_logo_url || null,
        owner_id: data.member.owner_id || undefined,
      };
      setMemberInfo(mi);

      // Use the magic link hashed token to authenticate
      const { error: otpError } = await supabase.auth.verifyOtp({
        token_hash: data.token_hash,
        type: 'magiclink',
      });

      if (otpError) {
        console.error('OTP verification error:', otpError);
        setPinError('Erreur de connexion. Réessayez.');
        setPinLoading(false);
        return;
      }

      toast.success('✅ Connexion réussie !', {
        description: `Bienvenue ${data.member.first_name}`
      });

      localStorage.setItem('theme', 'light');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');

      // Navigate smoothly based on role
      const roleName = (data.member.role_name || '').toLowerCase();
      if (roleName.includes('caissier')) {
        navigate('/app/caisse', { replace: true });
      } else if (roleName.includes('livreur')) {
        navigate('/app/livreur', { replace: true });
      } else if (roleName.includes('gestionnaire')) {
        navigate('/app/stocks', { replace: true });
      } else if (roleName.includes('vendeur')) {
        navigate('/app/boutique/commandes', { replace: true });
      } else {
        navigate('/app', { replace: true });
      }
    } catch (err) {
      console.error('PIN login error:', err);
      setPinError('Erreur de connexion');
    } finally {
      setPinLoading(false);
    }
  };

  const handleCompanyCodeComplete = (code: string) => {
    setCompanyCode(code);
    setPinStep('pin');
    setPinError('');
  };

  // Réinitialisation de mot de passe
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const validation = resetEmailSchema.safeParse({ email: resetEmail });
      if (!validation.success) {
        setErrors({ resetEmail: validation.error.errors[0].message });
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        toast.error('❌ Erreur', {
          description: 'Impossible d\'envoyer l\'email de réinitialisation'
        });
        return;
      }

      setResetStep('success');
      toast.success('✅ Email envoyé !', {
        description: 'Vérifiez votre boîte email pour réinitialiser votre mot de passe'
      });
    } catch (error: any) {
      toast.error('❌ Erreur', { description: 'Une erreur est survenue' });
    } finally {
      setIsLoading(false);
    }
  };

  // Soumission du formulaire principal
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      if (activeTab === 'login') {
        const validation = loginSchema.safeParse({
          email: formData.email,
          password: formData.password
        });
        
        if (!validation.success) {
          const fieldErrors: Record<string, string> = {};
          validation.error.errors.forEach(err => {
            if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
          });
          setErrors(fieldErrors);
          return;
        }

        const result = await signIn(formData.email, formData.password);
        
        if (result.error) {
          if (result.error.message.includes('Invalid login credentials')) {
            toast.error('❌ Connexion échouée', { description: 'Email ou mot de passe incorrect' });
          } else if (result.error.message.includes('pas encore confirmé')) {
            toast.error('❌ Compte non confirmé', { description: 'Vérifiez votre email pour confirmer votre compte' });
          } else {
            toast.error('❌ Erreur de connexion', { description: result.error.message });
          }
          return;
        }

        toast.success('✅ Connexion réussie !');
        // Navigate smoothly without full page reload
        if ((result as any).isAdmin) {
          navigate('/admin', { replace: true });
        } else {
          navigate('/app', { replace: true });
        }
        
      } else {
        const validation = signupSchema.safeParse(formData);
        
        if (!validation.success) {
          const fieldErrors: Record<string, string> = {};
          validation.error.errors.forEach(err => {
            if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
          });
          setErrors(fieldErrors);
          return;
        }

        const { error, needsConfirmation, user: newUser } = await signUp(
          formData.email,
          formData.password,
          formData.firstName,
          formData.lastName
        );

        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('❌ Inscription échouée', { description: 'Un compte avec cet email existe déjà' });
          } else {
            toast.error('❌ Erreur d\'inscription', { description: error.message });
          }
          return;
        }

        if (needsConfirmation) {
          toast.success('✅ Inscription réussie !', { description: 'Vérifiez votre email pour confirmer votre compte' });
        } else {
          toast.success('✅ Compte créé !', { description: 'Choisissez vos modules pour démarrer' });
          localStorage.setItem('theme', 'light');
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
          navigate('/onboarding', { replace: true });
        }
      }
    } catch (error: any) {
      toast.error('❌ Erreur', { description: 'Une erreur inattendue est survenue' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getFieldError = (field: string) => errors[field];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-blue-600 to-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  // Interface de réinitialisation de mot de passe
  if (resetStep) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-blue-600 to-slate-900 p-4">
        <div className="w-full max-w-md bg-background rounded-[28px] shadow-2xl p-7 sm:p-8 border border-border/50">
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              {resetStep === 'success' ? (
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            
            <div>
              <h2 className="text-2xl font-bold">
                {resetStep === 'success' ? 'Email envoyé !' : 'Réinitialiser le mot de passe'}
              </h2>
            </div>

            {resetStep === 'email' && (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="text-left">
                  <Label htmlFor="resetEmail">Email</Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className={getFieldError('resetEmail') ? 'border-destructive' : ''}
                  />
                  {getFieldError('resetEmail') && (
                    <p className="text-sm text-destructive mt-1">{getFieldError('resetEmail')}</p>
                  )}
                </div>
                <Button type="submit" className="w-full h-12 rounded-full text-base font-semibold" disabled={isLoading}>
                  {isLoading ? 'Envoi...' : 'Envoyer le lien'}
                </Button>
              </form>
            )}
            
            {resetStep === 'success' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Un email avec les instructions a été envoyé à <strong>{resetEmail}</strong>
                </p>
                <p className="text-xs text-muted-foreground">Vérifiez aussi votre dossier spam</p>
              </div>
            )}
            
            <Button variant="outline" onClick={() => setResetStep(null)} className="w-full h-12 rounded-full">
              Retour à la connexion
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Interface principale d'authentification
  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Side - Branding & Illustration (FIXED, no scroll) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary via-blue-600 to-slate-900 p-12 flex-col justify-between overflow-hidden sticky top-0 h-screen">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-transparent to-white/10"></div>

        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-white hover:text-blue-100 transition-colors group"
          >
            <div className="p-2 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </div>
            <span className="font-medium">Retour</span>
          </Link>
          <img src={stocknixLogoWhite} alt="Stocknix" className="h-10 w-auto object-contain" />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <h1 className="text-5xl font-bold text-white leading-tight">
              Pilotez votre PME/TPE avec confiance
            </h1>
            <p className="text-lg text-blue-100">
              Stock • Ventes • Paiements • Analytics
            </p>
          </div>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-3/5 overflow-hidden opacity-40">
          <img 
            src={entrepreneursImage} 
            alt="Entrepreneurs africains" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 text-sm text-blue-100">
          © 2025 Stocknix. Tous droits réservés.
        </div>
      </div>

      {/* Right Side - Auth Flow */}
      <div className="flex-1 flex flex-col justify-center p-4 sm:p-6 lg:p-8 auth-bg relative overflow-y-auto h-full">
        {/* Logo blanc centré en haut du fond bleu quadrillé */}
        <img
          src={stocknixLogoWhite}
          alt="Stocknix"
          className="lg:hidden absolute top-5 left-1/2 -translate-x-1/2 h-9 w-auto object-contain pointer-events-none select-none"
        />

        {/* Back button — position fixe et identique partout */}
        {screen === 'welcome' ? (
          !window.matchMedia('(display-mode: standalone)').matches && (
            <Link to="/" aria-label="Retour" className="back-fab lg:hidden">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          )
        ) : (
          <button type="button" aria-label="Retour" onClick={goBack} className="back-fab">
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}

        {/* ÉCRAN 1 — Choix */}
        {screen === 'welcome' && (
          <div className="w-full max-w-md mx-auto auth-card p-6 sm:p-8 text-center space-y-7 animate-fade-in">
            <BrandLogo className="h-14 w-auto mx-auto" />
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Gérez votre business en toute simplicité
              </h1>
              <p className="text-sm text-muted-foreground">
                Stock • Ventes • Paiements • Analytics
              </p>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full h-14 rounded-full text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-medium"
                onClick={() => { setIntent('login'); setActiveTab('login'); setErrors({}); setScreen('form'); }}
              >
                Se connecter
              </Button>
              <Button
                variant="outline"
                className="w-full h-14 rounded-full text-base font-semibold border-2 border-primary/25 bg-card text-primary hover:bg-primary/5"
                onClick={() => { setIntent('register'); setActiveTab('register'); setErrors({}); setScreen('form'); }}
              >
                Créer un compte
              </Button>
              <button
                type="button"
                onClick={() => { setScreen('employee'); setPinStep('company'); setCompanyCode(''); setPinError(''); }}
                className="inline-flex items-center justify-center gap-2 w-full h-12 text-sm font-semibold text-foreground/70 hover:text-foreground transition-colors"
              >
                <Users className="h-4 w-4" />
                Continuer en tant qu'employé
              </button>
            </div>
          </div>

        )}

        {/* ÉCRAN 2 — Méthode (email ou Google) */}
        {screen === 'method' && (
          <div className="w-full max-w-md mx-auto auth-card p-6 sm:p-8 space-y-6 animate-fade-in">
            <div className="text-center space-y-3">
              <BrandLogo className="h-11 w-auto mx-auto" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {intent === 'login' ? 'Connectez-vous pour continuer' : 'Créez un compte pour continuer'}
              </h2>
            </div>

            <Button
              className="w-full h-14 rounded-full text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-medium"
              onClick={() => { setActiveTab(intent); setScreen('form'); }}
            >
              <Mail className="mr-2 h-5 w-5" />
              {intent === 'login' ? 'Se connecter avec l\'e-mail' : 'S\'inscrire avec l\'e-mail'}
            </Button>


            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">ou</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={googleLoading}
                aria-label="Continuer avec Google"
                className="h-16 w-16 rounded-full bg-card border-2 border-border hover:bg-muted shadow-soft transition-colors inline-flex items-center justify-center disabled:opacity-60"
              >
                {googleLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <svg className="h-7 w-7" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" />
                  </svg>
                )}
              </button>
            </div>

            <p className="text-center text-xs text-muted-foreground leading-relaxed">
              En continuant, j'accepte les{' '}
              <Link to="/mentions-legales" className="underline">mentions légales</Link> et la politique de confidentialité de Stocknix.
            </p>
          </div>
        )}

        {/* ÉCRAN 3 — Formulaire e-mail */}
        {screen === 'form' && (
          <div className="w-full max-w-md mx-auto auth-card p-6 sm:p-8 mt-12 space-y-6 animate-fade-in">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {activeTab === 'login' ? 'Heureux de vous revoir !' : 'Bienvenue sur Stocknix'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {activeTab === 'login' ? 'Connectez-vous pour continuer.' : 'Créez votre compte en quelques secondes.'}
              </p>
            </div>


            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'register' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-sm text-muted-foreground">Prénom</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="John"
                      className="h-14 rounded-2xl bg-muted/40 border border-border"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-sm text-muted-foreground">Nom</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Doe"
                      className="h-14 rounded-2xl bg-muted/40 border border-border"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm text-muted-foreground">Adresse e-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="vous@exemple.com"
                  className={`h-14 rounded-2xl bg-muted/40 border border-border ${getFieldError('email') ? 'border-destructive' : ''}`}
                />
                {getFieldError('email') && (
                  <p className="text-sm text-destructive">{getFieldError('email')}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm text-muted-foreground">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder={activeTab === 'login' ? '••••••••' : 'Minimum 8 caractères'}
                    className={`h-14 rounded-2xl bg-muted/40 border border-border pr-12 ${getFieldError('password') ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Afficher le mot de passe"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {getFieldError('password') && (
                  <p className="text-sm text-destructive">{getFieldError('password')}</p>
                )}
              </div>

              {activeTab === 'login' && (
                <div className="flex justify-end">
                  <button type="button" onClick={() => setResetStep('email')} className="text-sm text-muted-foreground hover:text-foreground">
                    Mot de passe oublié ?
                  </button>
                </div>
              )}

              <Button type="submit" className="w-full h-14 rounded-full text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-medium" disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{activeTab === 'login' ? 'Connexion...' : 'Inscription...'}</>
                ) : (
                  activeTab === 'login' ? 'Se connecter' : 'Créer un compte'
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              {activeTab === 'login' ? (
                <>Pas encore de compte ?{' '}
                  <button type="button" className="font-semibold text-foreground" onClick={() => { setActiveTab('register'); setIntent('register'); setErrors({}); }}>S'inscrire</button>
                </>
              ) : (
                <>Déjà un compte ?{' '}
                  <button type="button" className="font-semibold text-foreground" onClick={() => { setActiveTab('login'); setIntent('login'); setErrors({}); }}>Se connecter</button>
                </>
              )}
            </p>

            {activeTab === 'login' && (
              <div className="text-center">
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={async () => {
                    if (!formData.email) {
                      toast.error('Entrez votre email pour renvoyer la confirmation');
                      return;
                    }
                    const { error } = await supabase.auth.resend({
                      type: 'signup',
                      email: formData.email,
                      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` }
                    });
                    if (error) toast.error('Erreur lors du renvoi');
                    else toast.success('Email de confirmation renvoyé !');
                  }}
                >
                  Renvoyer la confirmation
                </button>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">ou</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={googleLoading}
                aria-label="Continuer avec Google"
                className="h-14 w-14 rounded-full bg-card border-2 border-border hover:bg-muted shadow-soft transition-colors inline-flex items-center justify-center disabled:opacity-60"
              >
                {googleLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <svg className="h-6 w-6" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ÉCRAN 4 — Employé (PIN) */}
        {screen === 'employee' && (
          <div className="w-full max-w-md mx-auto auth-card p-6 sm:p-8 space-y-5 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <img src={stocknixLogoIcon} alt="Stocknix" className="h-9 w-9 object-contain" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Espace employé</h2>
              <p className="text-sm text-muted-foreground">
                {pinStep === 'company'
                  ? 'Saisissez le code de votre entreprise (6 chiffres)'
                  : 'Saisissez votre code PIN personnel'}
              </p>
            </div>

            {/* Steps indicator */}
            <div className="flex items-center justify-center gap-2">
              <span className={`h-1.5 w-10 rounded-full transition-colors ${pinStep === 'company' ? 'bg-primary' : 'bg-primary/30'}`} />
              <span className={`h-1.5 w-10 rounded-full transition-colors ${pinStep === 'pin' ? 'bg-primary' : 'bg-muted'}`} />
            </div>

            {pinStep === 'company' ? (
              <PinKeypad
                length={6}
                onComplete={handleCompanyCodeComplete}
                label="Code entreprise"
                error={pinError}
              />
            ) : (
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    Entreprise : <span className="font-mono font-bold text-foreground">{companyCode}</span>
                  </p>
                  <button 
                    type="button"
                    onClick={() => { setPinStep('company'); setCompanyCode(''); setPinError(''); }}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Changer
                  </button>
                </div>
                <PinKeypad
                  length={6}
                  onComplete={handlePinLogin}
                  label="Votre code PIN"
                  isLoading={pinLoading}
                  error={pinError}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

