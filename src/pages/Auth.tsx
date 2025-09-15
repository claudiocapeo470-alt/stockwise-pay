import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BarChart3, Eye, EyeOff, LogIn, UserPlus, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import financialDashboard from '@/assets/3d-financial-dashboard.png';
import paymentAutomation from '@/assets/3d-payment-automation.png';

export default function Auth() {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: '',
    resetCode: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetStep, setResetStep] = useState<'email' | 'code' | 'password' | null>(null);
  const [resetEmail, setResetEmail] = useState('');
  const {
    signIn,
    signUp,
    user
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/app');
    }
  }, [user, navigate]);

  // Générer un code de réinitialisation de 6 chiffres
  const generateResetCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (resetStep === 'email') {
        // Étape 1: Envoyer le code par email
        const response = await fetch(`https://fsdfzzhbydlmuiblgkvb.supabase.co/functions/v1/send-password-reset`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzZGZ6emhieWRsbXVpYmxna3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MTE5NjUsImV4cCI6MjA3MjQ4Nzk2NX0.NlfYPNMEpTAqXbJsLpBM3ubw0U2o5S63NVveVzLUT4w`
          },
          body: JSON.stringify({
            email: resetEmail
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de l\'envoi de l\'email');
        }

        // Stocker l'email pour les étapes suivantes
        localStorage.setItem('resetEmail', resetEmail);

        setResetStep('code');
        toast({
          title: 'Code envoyé',
          description: 'Vérifiez votre email pour le code de vérification'
        });
      } else if (resetStep === 'code') {
        // Étape 2: Passer à l'étape de saisie du nouveau mot de passe
        if (!formData.resetCode || formData.resetCode.length !== 6) {
          setError('Veuillez saisir un code de 6 chiffres');
          return;
        }

        // Stocker le code pour l'étape suivante
        localStorage.setItem('resetCode', formData.resetCode);

        setResetStep('password');
        toast({
          title: 'Code vérifié',
          description: 'Vous pouvez maintenant saisir votre nouveau mot de passe'
        });
      } else if (resetStep === 'password') {
        // Étape 3: Réinitialiser le mot de passe
        if (formData.password !== formData.confirmPassword) {
          setError('Les mots de passe ne correspondent pas');
          return;
        }

        if (formData.password.length < 6) {
          setError('Le mot de passe doit contenir au moins 6 caractères');
          return;
        }

        const storedEmail = localStorage.getItem('resetEmail');
        const storedCode = localStorage.getItem('resetCode');
        
        if (!storedEmail || !storedCode) {
          setError('Session expirée. Veuillez recommencer.');
          setResetStep('email');
          return;
        }

        // Utiliser notre edge function pour réinitialiser le mot de passe
        const response = await fetch(`https://fsdfzzhbydlmuiblgkvb.supabase.co/functions/v1/reset-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzZGZ6emhieWRsbXVpYmxna3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MTE5NjUsImV4cCI6MjA3MjQ4Nzk2NX0.NlfYPNMEpTAqXbJsLpBM3ubw0U2o5S63NVveVzLUT4w`
          },
          body: JSON.stringify({
            email: storedEmail,
            code: storedCode,
            newPassword: formData.password
          })
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.error || 'Erreur lors de la réinitialisation du mot de passe');
        }

        // Nettoyer le localStorage
        localStorage.removeItem('resetCode');
        localStorage.removeItem('resetEmail');

        // Connecter automatiquement l'utilisateur
        const { error: signInError } = await signIn(storedEmail, formData.password);
        
        if (signInError) {
          // Si la connexion automatique échoue, rediriger vers la page de connexion
          setResetStep(null);
          setActiveTab('login');
          setFormData({ ...formData, email: storedEmail, password: '', confirmPassword: '', resetCode: '' });
          toast({
            title: 'Mot de passe réinitialisé',
            description: 'Vous pouvez maintenant vous connecter avec votre nouveau mot de passe'
          });
        } else {
          // Connexion réussie, l'utilisateur sera redirigé automatiquement
          toast({
            title: 'Mot de passe réinitialisé',
            description: 'Connexion automatique réussie'
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur inattendue est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (activeTab === 'login') {
        const {
          error
        } = await signIn(formData.email, formData.password);
        if (error) {
          if (error.message?.includes('Invalid login credentials')) {
            setError('Email ou mot de passe incorrect');
          } else {
            setError(error.message || 'Erreur de connexion');
          }
        } else {
          toast({
            title: 'Connexion réussie',
            description: 'Bienvenue dans GestionPro !'
          });
        }
      } else {
        const {
          error
        } = await signUp(formData.email, formData.password, formData.firstName, formData.lastName);
        if (error) {
          if (error.message?.includes('User already registered')) {
            setError('Un utilisateur avec cet email existe déjà');
          } else {
            setError(error.message || 'Erreur lors de l\'inscription');
          }
        } else {
          toast({
            title: 'Inscription réussie',
            description: 'Vérifiez votre email pour confirmer votre compte'
          });
        }
      }
    } catch (err) {
      setError('Une erreur inattendue est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleResetEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResetEmail(e.target.value);
  };

  // Si on est en mode réinitialisation de mot de passe
  if (resetStep) {
    return (
      <div className="min-h-screen bg-gradient-dark-animated flex relative overflow-hidden">
        {/* Animated background effects */}
        <div className="absolute inset-0">
          <div className="fluid-blob fluid-blob-1 animate-pulse"></div>
          <div className="fluid-blob fluid-blob-2 animate-pulse"></div>
          <div className="fluid-blob fluid-blob-3 animate-pulse"></div>
        </div>

        {/* Côté gauche - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-neon relative">
          <div className="flex flex-col justify-center px-12 py-16 text-white relative z-10">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 shadow-neon">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">GestionPro</h1>
              </div>
              <p className="text-xl font-medium mb-4 text-blue-100">Gestion Intelligente SaaS</p>
              <p className="text-blue-200 text-lg leading-relaxed">
                Gérez vos clients, suivez vos paiements et générez vos rapports financiers en toute simplicité avec notre solution moderne.
              </p>
            </div>
          </div>
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* Côté droit - Formulaire */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-12 relative z-10">
          <div className="w-full max-w-md">
            {/* Back button */}
            <div className="mb-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="group flex items-center gap-2 text-white hover:text-primary transition-all duration-300 hover:shadow-neon p-2 rounded-xl hover:bg-white/5"
              >
                <ArrowLeft className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Retour</span>
              </Button>
            </div>

            <div className="text-center mb-8">
              <div className="lg:hidden flex justify-center mb-4">
                <div className="bg-gradient-neon rounded-xl p-3 shadow-neon">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Réinitialisation du mot de passe</h2>
              <p className="text-muted-foreground">Suivez les étapes pour récupérer votre accès</p>
            </div>

            <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-large border border-white/10 p-8">
              {resetStep === 'email' && (
                <div className="space-y-6">
                  <div className="text-center space-y-2 mb-6">
                    <h3 className="text-xl font-semibold text-card-foreground">Mot de passe oublié ?</h3>
                    <p className="text-sm text-muted-foreground">
                      Saisissez votre adresse email pour recevoir un code de vérification
                    </p>
                  </div>

                  <form onSubmit={handlePasswordReset} className="space-y-6">
                    {error && <Alert variant="destructive" className="rounded-xl bg-destructive/10 border-destructive/20">
                        <AlertDescription className="text-destructive-foreground">{error}</AlertDescription>
                      </Alert>}

                    <div className="space-y-2">
                      <Label htmlFor="reset-email" className="text-sm font-medium text-card-foreground">Adresse email</Label>
                      <Input 
                        id="reset-email" 
                        type="email" 
                        required 
                        value={resetEmail} 
                        onChange={handleResetEmailChange} 
                        placeholder="jean.dupont@example.com"
                        className="h-12 rounded-xl bg-input border-border focus:border-primary focus:ring-primary text-foreground"
                      />
                    </div>

                    <Button type="submit" className="w-full h-12 text-base font-medium rounded-xl bg-gradient-neon hover:shadow-neon transition-all duration-300" disabled={loading}>
                      {loading ? 'Envoi en cours...' : 'Envoyer le code'}
                    </Button>
                  </form>
                </div>
              )}

              {resetStep === 'code' && (
                <div className="space-y-6">
                  <div className="text-center space-y-2 mb-6">
                    <h3 className="text-xl font-semibold text-card-foreground">Vérification</h3>
                    <p className="text-sm text-muted-foreground">
                      Saisissez le code de 6 chiffres envoyé à votre email
                    </p>
                  </div>

                  <form onSubmit={handlePasswordReset} className="space-y-6">
                    {error && <Alert variant="destructive" className="rounded-xl bg-destructive/10 border-destructive/20">
                        <AlertDescription className="text-destructive-foreground">{error}</AlertDescription>
                      </Alert>}

                    <div className="space-y-2">
                      <Label htmlFor="reset-code" className="text-sm font-medium text-card-foreground">Code de vérification</Label>
                      <Input 
                        id="reset-code" 
                        name="resetCode"
                        type="text" 
                        required 
                        value={formData.resetCode} 
                        onChange={handleInputChange} 
                        placeholder="123456"
                        className="h-12 text-center text-lg font-mono rounded-xl bg-input border-border focus:border-primary focus:ring-primary text-foreground"
                        maxLength={6}
                      />
                    </div>

                    <Button type="submit" className="w-full h-12 text-base font-medium rounded-xl bg-gradient-neon hover:shadow-neon transition-all duration-300" disabled={loading}>
                      {loading ? 'Vérification...' : 'Vérifier le code'}
                    </Button>
                  </form>
                </div>
              )}

              {resetStep === 'password' && (
                <div className="space-y-6">
                  <div className="text-center space-y-2 mb-6">
                    <h3 className="text-xl font-semibold text-card-foreground">Nouveau mot de passe</h3>
                    <p className="text-sm text-muted-foreground">
                      Saisissez votre nouveau mot de passe
                    </p>
                  </div>

                  <form onSubmit={handlePasswordReset} className="space-y-6">
                    {error && <Alert variant="destructive" className="rounded-xl bg-destructive/10 border-destructive/20">
                        <AlertDescription className="text-destructive-foreground">{error}</AlertDescription>
                      </Alert>}

                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="text-sm font-medium text-card-foreground">Nouveau mot de passe</Label>
                      <div className="relative">
                        <Input 
                          id="new-password"
                          name="password" 
                          type={showPassword ? 'text' : 'password'} 
                          required 
                          value={formData.password} 
                          onChange={handleInputChange} 
                          placeholder="••••••••" 
                          className="pr-12 h-12 rounded-xl bg-input border-border focus:border-primary focus:ring-primary text-foreground"
                          minLength={6}
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" 
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-sm font-medium text-card-foreground">Confirmer le mot de passe</Label>
                      <div className="relative">
                        <Input 
                          id="confirm-password"
                          name="confirmPassword" 
                          type={showConfirmPassword ? 'text' : 'password'} 
                          required 
                          value={formData.confirmPassword} 
                          onChange={handleInputChange} 
                          placeholder="••••••••" 
                          className="pr-12 h-12 rounded-xl bg-input border-border focus:border-primary focus:ring-primary text-foreground"
                          minLength={6}
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" 
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                        </Button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-12 text-base font-medium rounded-xl bg-gradient-neon hover:shadow-neon transition-all duration-300" disabled={loading}>
                      {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                    </Button>
                  </form>
                </div>
              )}

              <div className="mt-8 text-center">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setResetStep(null);
                    setError(null);
                    setFormData({
                      email: '',
                      password: '',
                      firstName: '',
                      lastName: '',
                      confirmPassword: '',
                      resetCode: ''
                    });
                  }}
                  className="text-sm text-muted-foreground hover:text-primary hover:bg-white/5 rounded-lg transition-all duration-300"
                >
                  ← Retour à la connexion
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark-animated flex relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0">
        <div className="fluid-blob fluid-blob-1 animate-pulse"></div>
        <div className="fluid-blob fluid-blob-2 animate-pulse"></div>
        <div className="fluid-blob fluid-blob-3 animate-pulse"></div>
      </div>

      {/* Côté gauche - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-neon relative">
        <div className="flex flex-col justify-center px-12 py-16 text-white relative z-10">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 shadow-neon">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">GestionPro</h1>
            </div>
            <p className="text-xl font-medium mb-4 text-blue-100">Gestion Intelligente SaaS</p>
            <p className="text-blue-200 text-lg leading-relaxed mb-8">
              Gérez vos clients, suivez vos paiements et générez vos rapports financiers en toute simplicité avec notre solution moderne.
            </p>
          </div>
          
          <div className="space-y-4 text-blue-100 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-gradient-to-r from-primary to-accent rounded-full shadow-glow animate-pulse"></div>
              <span>Tableau de bord intuitif</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-gradient-to-r from-primary to-accent rounded-full shadow-glow animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <span>Gestion automatisée des paiements</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-gradient-to-r from-primary to-accent rounded-full shadow-glow animate-pulse" style={{ animationDelay: '1s' }}></div>
              <span>Rapports détaillés en temps réel</span>
            </div>
          </div>

          {/* 3D Illustrations */}
          <div className="relative">
            <div className="absolute -top-20 -right-10 opacity-30 hover:opacity-50 transition-opacity duration-500">
              <img 
                src={financialDashboard} 
                alt="3D Financial Dashboard" 
                className="w-40 h-40 object-contain drop-shadow-2xl animate-pulse"
              />
            </div>
            <div className="absolute -bottom-10 -left-5 opacity-40 hover:opacity-60 transition-opacity duration-500">
              <img 
                src={paymentAutomation} 
                alt="3D Payment Automation" 
                className="w-32 h-32 object-contain drop-shadow-2xl animate-pulse" 
                style={{ animationDelay: '1.5s' }}
              />
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Côté droit - Formulaire */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Back button */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="group flex items-center gap-2 text-white hover:text-primary transition-all duration-300 hover:shadow-neon p-2 rounded-xl hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Retour</span>
            </Button>
          </div>

          <div className="text-center mb-8">
            <div className="lg:hidden flex justify-center mb-4">
              <div className="bg-gradient-neon rounded-xl p-3 shadow-neon">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Bienvenue sur GestionPro</h2>
            <p className="text-muted-foreground">Connectez-vous pour accéder à votre espace</p>
          </div>

          <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-large border border-white/10 p-8">
            <Tabs 
              value={activeTab} 
              onValueChange={(value) => {
                setActiveTab(value);
                setError(null);
                setFormData({
                  email: '',
                  password: '',
                  firstName: '',
                  lastName: '',
                  confirmPassword: '',
                  resetCode: ''
                });
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 h-12 rounded-xl bg-secondary/50 p-1 backdrop-blur-sm">
                <TabsTrigger 
                  value="login"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-neon rounded-lg font-medium transition-all duration-300"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Connexion
                </TabsTrigger>
                <TabsTrigger 
                  value="register"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-neon rounded-lg font-medium transition-all duration-300"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Inscription
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                {error && (
                  <Alert variant="destructive" className="mb-6 rounded-xl bg-destructive/10 border-destructive/20">
                    <AlertDescription className="text-destructive-foreground">{error}</AlertDescription>
                  </Alert>
                )}

                <TabsContent value="login" className="space-y-6 mt-0">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-card-foreground">Email</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        autoComplete="email" 
                        required 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        placeholder="jean.dupont@example.com"
                        className="h-12 rounded-xl bg-input border-border focus:border-primary focus:ring-primary text-foreground"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-card-foreground">Mot de passe</Label>
                      <div className="relative">
                        <Input 
                          id="password" 
                          name="password" 
                          type={showPassword ? 'text' : 'password'} 
                          autoComplete="current-password" 
                          required 
                          value={formData.password} 
                          onChange={handleInputChange} 
                          placeholder="••••••••"
                          className="pr-12 h-12 rounded-xl bg-input border-border focus:border-primary focus:ring-primary text-foreground"
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" 
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <Button
                          type="button"
                          variant="ghost"
                          className="p-0 h-auto text-primary hover:text-accent hover:bg-transparent transition-colors duration-300"
                          onClick={() => setResetStep('email')}
                        >
                          Mot de passe oublié ?
                        </Button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={loading} 
                      className="w-full h-12 text-base font-medium rounded-xl bg-gradient-neon hover:shadow-neon transition-all duration-300"
                    >
                      {loading ? 'Connexion...' : 'Se connecter'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="space-y-6 mt-0">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-medium text-card-foreground">Prénom</Label>
                        <Input 
                          id="firstName" 
                          name="firstName" 
                          type="text" 
                          autoComplete="given-name" 
                          required 
                          value={formData.firstName} 
                          onChange={handleInputChange} 
                          placeholder="Jean"
                          className="h-12 rounded-xl bg-input border-border focus:border-primary focus:ring-primary text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-medium text-card-foreground">Nom</Label>
                        <Input 
                          id="lastName" 
                          name="lastName" 
                          type="text" 
                          autoComplete="family-name" 
                          required 
                          value={formData.lastName} 
                          onChange={handleInputChange} 
                          placeholder="Dupont"
                          className="h-12 rounded-xl bg-input border-border focus:border-primary focus:ring-primary text-foreground"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-card-foreground">Email</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        autoComplete="email" 
                        required 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        placeholder="jean.dupont@example.com"
                        className="h-12 rounded-xl bg-input border-border focus:border-primary focus:ring-primary text-foreground"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-card-foreground">Mot de passe</Label>
                      <div className="relative">
                        <Input 
                          id="password" 
                          name="password" 
                          type={showPassword ? 'text' : 'password'} 
                          autoComplete="new-password" 
                          required 
                          value={formData.password} 
                          onChange={handleInputChange} 
                          placeholder="••••••••"
                          className="pr-12 h-12 rounded-xl bg-input border-border focus:border-primary focus:ring-primary text-foreground"
                          minLength={6}
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" 
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-card-foreground">Confirmer le mot de passe</Label>
                      <div className="relative">
                        <Input 
                          id="confirmPassword" 
                          name="confirmPassword" 
                          type={showConfirmPassword ? 'text' : 'password'} 
                          autoComplete="new-password" 
                          required 
                          value={formData.confirmPassword} 
                          onChange={handleInputChange} 
                          placeholder="••••••••"
                          className="pr-12 h-12 rounded-xl bg-input border-border focus:border-primary focus:ring-primary text-foreground"
                          minLength={6}
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" 
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                        </Button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={loading} 
                      className="w-full h-12 text-base font-medium rounded-xl bg-gradient-neon hover:shadow-neon transition-all duration-300"
                    >
                      {loading ? 'Inscription...' : 'S\'inscrire'}
                    </Button>
                  </form>
                </TabsContent>
              </div>
            </Tabs>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                En vous connectant, vous acceptez nos{' '}
                <Link to="/mentions-legales" className="text-primary hover:text-accent transition-colors duration-300">
                  conditions d'utilisation
                </Link>{' '}
                et notre politique de confidentialité.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}