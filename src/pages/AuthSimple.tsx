import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Eye, EyeOff, ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { PinKeypad } from "@/components/auth/PinKeypad";
import stocknixLogo from '@/assets/stocknix-logo.png';
import entrepreneursImage from "@/assets/african-entrepreneur-tablet.png";

// Schémas de validation
const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis')
});

const signupSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
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
  
  const [authMode, setAuthMode] = useState<'classic' | 'employee'>('classic');
  const [activeTab, setActiveTab] = useState('login');
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

  // Redirection si déjà connecté
  useEffect(() => {
    if (user && !loading) {
      navigate('/app');
    }
  }, [user, loading, navigate]);

  // Handle email confirmation redirect  
  useEffect(() => {
    const confirmed = searchParams.get('confirmed');
    if (confirmed === 'true' && user) {
      navigate('/app?confirmed=true');
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

      // Store member info for the session
      localStorage.setItem('stocknix_member', JSON.stringify(data.member));

      // Use the magic link token to authenticate
      const { error: otpError } = await supabase.auth.verifyOtp({
        email: data.email,
        token: data.token_hash,
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

      // Redirect based on role
      const roleName = data.member.role_name?.toLowerCase();
      if (roleName === 'caissier') {
        navigate('/app/caisse');
      } else if (roleName === 'livreur') {
        navigate('/app/livraisons');
      } else {
        navigate('/app');
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
        redirectTo: `${window.location.origin}/auth?reset=true`
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

        const { error } = await signIn(formData.email, formData.password);
        
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('❌ Connexion échouée', { description: 'Email ou mot de passe incorrect' });
          } else if (error.message.includes('pas encore confirmé')) {
            toast.error('❌ Compte non confirmé', { description: 'Vérifiez votre email pour confirmer votre compte' });
          } else {
            toast.error('❌ Erreur de connexion', { description: error.message });
          }
          return;
        }

        toast.success('✅ Connexion réussie !');
        localStorage.setItem('theme', 'light');
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        navigate('/app');
        
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

        const { error, needsConfirmation } = await signUp(
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
          toast.success('✅ Compte créé et activé !');
          localStorage.setItem('theme', 'light');
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
          navigate('/app?confirmed=true');
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
        <div className="w-full max-w-md bg-background/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-primary/20">
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
                <Button type="submit" className="w-full" disabled={isLoading}>
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
            
            <Button variant="outline" onClick={() => setResetStep(null)} className="w-full">
              Retour à la connexion
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Interface principale d'authentification
  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Side - Branding & Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary via-blue-600 to-slate-900 p-12 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-transparent to-white/10 animate-pulse"></div>
        
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
          <img src={stocknixLogo} alt="Stocknix" className="h-10 w-auto object-contain brightness-0 invert" />
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

      {/* Right Side - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background relative">
        <Link 
          to="/" 
          className="absolute top-6 left-6 lg:hidden inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>

        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="lg:hidden text-center">
            <img src={stocknixLogo} alt="Stocknix" className="h-8 w-auto object-contain mx-auto mb-4" />
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Bienvenue</h1>
            <p className="text-muted-foreground">
              {authMode === 'classic' 
                ? 'Connectez-vous ou créez un compte' 
                : 'Connexion employé avec code PIN'
              }
            </p>
          </div>

          {/* Auth mode toggle */}
          <div className="flex rounded-xl border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => { setAuthMode('classic'); setPinStep('company'); setCompanyCode(''); setPinError(''); }}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                authMode === 'classic' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted/50 text-muted-foreground'
              }`}
            >
              Admin / Propriétaire
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('employee'); setPinStep('company'); setCompanyCode(''); setPinError(''); }}
              className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                authMode === 'employee' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted/50 text-muted-foreground'
              }`}
            >
              <Users className="h-4 w-4" />
              Employé
            </button>
          </div>

          {/* CLASSIC AUTH MODE */}
          {authMode === 'classic' && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="register">Inscription</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="votre@email.com"
                      className={getFieldError('email') ? 'border-destructive' : ''}
                    />
                    {getFieldError('email') && (
                      <p className="text-sm text-destructive">{getFieldError('email')}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="••••••••"
                        className={getFieldError('password') ? 'border-destructive' : ''}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {getFieldError('password') && (
                      <p className="text-sm text-destructive">{getFieldError('password')}</p>
                    )}
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connexion...
                      </>
                    ) : (
                      'Se connecter'
                    )}
                  </Button>
                </form>
                
                <div className="text-center">
                  <Button variant="link" onClick={() => setResetStep('email')} className="text-sm">
                    Mot de passe oublié ?
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="register" className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom (optionnel)</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom (optionnel)</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="registerEmail">Email</Label>
                    <Input
                      id="registerEmail"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="votre@email.com"
                      className={getFieldError('email') ? 'border-destructive' : ''}
                    />
                    {getFieldError('email') && (
                      <p className="text-sm text-destructive">{getFieldError('email')}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="registerPassword">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="registerPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Minimum 6 caractères"
                        className={getFieldError('password') ? 'border-destructive' : ''}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {getFieldError('password') && (
                      <p className="text-sm text-destructive">{getFieldError('password')}</p>
                    )}
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Inscription...
                      </>
                    ) : (
                      'Créer un compte'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}

          {/* EMPLOYEE PIN AUTH MODE */}
          {authMode === 'employee' && (
            <div className="space-y-6 py-4">
              {pinStep === 'company' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <span className="text-2xl">🏢</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">
                      Saisissez le code de votre entreprise (6 chiffres)
                    </p>
                  </div>
                  <PinKeypad
                    length={6}
                    onComplete={handleCompanyCodeComplete}
                    label="Code entreprise"
                    error={pinError}
                  />
                </div>
              )}

              {pinStep === 'pin' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                      <span className="text-2xl">🔑</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Entreprise : <span className="font-mono font-bold text-foreground">{companyCode}</span>
                    </p>
                    <button 
                      type="button"
                      onClick={() => { setPinStep('company'); setCompanyCode(''); setPinError(''); }}
                      className="text-xs text-primary underline"
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
    </div>
  );
}
