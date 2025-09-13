import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BarChart3, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
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
        const resetCode = generateResetCode();
        
        // Stocker le code et l'email temporairement (dans une vraie app, ceci devrait être fait côté serveur)
        localStorage.setItem('resetCode', resetCode);
        localStorage.setItem('resetEmail', resetEmail);
        localStorage.setItem('resetCodeTimestamp', Date.now().toString());

        // Envoyer l'email
        const response = await fetch(`https://fsdfzzhbydlmuiblgkvb.supabase.co/functions/v1/send-password-reset`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzZGZ6emhieWRsbXVpYmxna3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MTE5NjUsImV4cCI6MjA3MjQ4Nzk2NX0.NlfYPNMEpTAqXbJsLpBM3ubw0U2o5S63NVveVzLUT4w`
          },
          body: JSON.stringify({
            email: resetEmail,
            resetCode: resetCode
          })
        });

        if (!response.ok) {
          throw new Error('Erreur lors de l\'envoi de l\'email');
        }

        setResetStep('code');
        toast({
          title: 'Code envoyé',
          description: 'Vérifiez votre email pour le code de vérification'
        });
      } else if (resetStep === 'code') {
        // Étape 2: Vérifier le code
        const storedCode = localStorage.getItem('resetCode');
        const storedTimestamp = localStorage.getItem('resetCodeTimestamp');
        
        if (!storedCode || !storedTimestamp) {
          setError('Code expiré. Veuillez recommencer.');
          setResetStep('email');
          return;
        }

        // Vérifier si le code n'est pas expiré (15 minutes)
        const now = Date.now();
        const codeAge = now - parseInt(storedTimestamp);
        if (codeAge > 15 * 60 * 1000) {
          setError('Code expiré. Veuillez recommencer.');
          localStorage.removeItem('resetCode');
          localStorage.removeItem('resetEmail');
          localStorage.removeItem('resetCodeTimestamp');
          setResetStep('email');
          return;
        }

        if (formData.resetCode !== storedCode) {
          setError('Code incorrect');
          return;
        }

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
        if (!storedEmail) {
          setError('Session expirée. Veuillez recommencer.');
          setResetStep('email');
          return;
        }

        // Utiliser la fonction de réinitialisation de Supabase
        const { error } = await supabase.auth.updateUser({
          password: formData.password
        });

        if (error) {
          // Si l'utilisateur n'est pas connecté, utiliser l'approche avec token
          setError('Veuillez vous reconnecter pour changer votre mot de passe');
          setResetStep(null);
          setActiveTab('login');
          return;
        }

        // Nettoyer le localStorage
        localStorage.removeItem('resetCode');
        localStorage.removeItem('resetEmail');
        localStorage.removeItem('resetCodeTimestamp');

        setResetStep(null);
        setActiveTab('login');
        toast({
          title: 'Mot de passe réinitialisé',
          description: 'Vous pouvez maintenant vous connecter avec votre nouveau mot de passe'
        });
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
            description: 'Bienvenue dans Stocknix !'
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        <AnimatedBackground />
        <div className="w-full max-w-md space-y-8 relative z-20">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-primary rounded-lg p-3">
                <BarChart3 className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Stocknix</h1>
            <p className="text-sm text-slate-50">
              Réinitialisation du mot de passe
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              {resetStep === 'email' && (
                <div className="space-y-4">
                  <div className="text-center space-y-2 mb-6">
                    <h2 className="text-xl font-semibold">Mot de passe oublié ?</h2>
                    <p className="text-sm text-muted-foreground">
                      Saisissez votre adresse email pour recevoir un code de vérification
                    </p>
                  </div>

                  <form onSubmit={handlePasswordReset} className="space-y-4">
                    {error && <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>}

                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Adresse email</Label>
                      <Input 
                        id="reset-email" 
                        type="email" 
                        required 
                        value={resetEmail} 
                        onChange={handleResetEmailChange} 
                        placeholder="jean.dupont@example.com"
                        className="h-12"
                      />
                    </div>

                    <Button type="submit" className="w-full h-12 text-base font-medium" disabled={loading}>
                      {loading ? 'Envoi en cours...' : 'Envoyer le code'}
                    </Button>
                  </form>
                </div>
              )}

              {resetStep === 'code' && (
                <div className="space-y-4">
                  <div className="text-center space-y-2 mb-6">
                    <h2 className="text-xl font-semibold">Vérification</h2>
                    <p className="text-sm text-muted-foreground">
                      Saisissez le code de 6 chiffres envoyé à votre email
                    </p>
                  </div>

                  <form onSubmit={handlePasswordReset} className="space-y-4">
                    {error && <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>}

                    <div className="space-y-2">
                      <Label htmlFor="reset-code">Code de vérification</Label>
                      <Input 
                        id="reset-code" 
                        name="resetCode"
                        type="text" 
                        required 
                        value={formData.resetCode} 
                        onChange={handleInputChange} 
                        placeholder="123456"
                        className="h-12 text-center text-lg font-mono"
                        maxLength={6}
                      />
                    </div>

                    <Button type="submit" className="w-full h-12 text-base font-medium" disabled={loading}>
                      {loading ? 'Vérification...' : 'Vérifier le code'}
                    </Button>
                  </form>
                </div>
              )}

              {resetStep === 'password' && (
                <div className="space-y-4">
                  <div className="text-center space-y-2 mb-6">
                    <h2 className="text-xl font-semibold">Nouveau mot de passe</h2>
                    <p className="text-sm text-muted-foreground">
                      Saisissez votre nouveau mot de passe
                    </p>
                  </div>

                  <form onSubmit={handlePasswordReset} className="space-y-4">
                    {error && <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>}

                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nouveau mot de passe</Label>
                      <div className="relative">
                        <Input 
                          id="new-password"
                          name="password" 
                          type={showPassword ? 'text' : 'password'} 
                          required 
                          value={formData.password} 
                          onChange={handleInputChange} 
                          placeholder="••••••••" 
                          className="pr-12 h-12"
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
                      <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                      <div className="relative">
                        <Input 
                          id="confirm-password"
                          name="confirmPassword" 
                          type={showConfirmPassword ? 'text' : 'password'} 
                          required 
                          value={formData.confirmPassword} 
                          onChange={handleInputChange} 
                          placeholder="••••••••" 
                          className="pr-12 h-12"
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

                    <Button type="submit" className="w-full h-12 text-base font-medium" disabled={loading}>
                      {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                    </Button>
                  </form>
                </div>
              )}

              <div className="mt-6 text-center">
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
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  ← Retour à la connexion
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  return <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />
      <div className="w-full max-w-md space-y-8 relative z-20">
        {/* Logo */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-primary rounded-lg p-3">
              <BarChart3 className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Stocknix</h1>
          <p className="text-sm text-slate-50">
            Gestion complète pour PME/TPE
          </p>
        </div>

        {/* Auth Form */}
        <Card>
          <CardContent className="p-0">
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
              <TabsList className="grid w-full grid-cols-2 h-12 rounded-t-lg rounded-b-none bg-muted/30">
                <TabsTrigger 
                  value="login" 
                  className="h-full rounded-t-lg rounded-b-none data-[state=active]:bg-card data-[state=active]:shadow-sm font-medium transition-all duration-200"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Connexion
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  className="h-full rounded-t-lg rounded-b-none data-[state=active]:bg-card data-[state=active]:shadow-sm font-medium transition-all duration-200"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Inscription
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="p-6 m-0 rounded-none space-y-4 animate-fade-in">
                <div className="text-center space-y-2 mb-6">
                  <h2 className="text-xl font-semibold">Bon retour !</h2>
                  <p className="text-sm text-muted-foreground">
                    Connectez-vous à votre espace de gestion
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>}

                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input 
                      id="login-email" 
                      name="email" 
                      type="email" 
                      required 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      placeholder="jean.dupont@example.com"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <div className="relative">
                      <Input 
                        id="login-password"
                        name="password" 
                        type={showPassword ? 'text' : 'password'} 
                        required 
                        value={formData.password} 
                        onChange={handleInputChange} 
                        placeholder="••••••••" 
                        className="pr-12 h-12"
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

                  <Button type="submit" className="w-full h-12 text-base font-medium" disabled={loading}>
                    {loading ? (
                      'Connexion en cours...'
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Se connecter
                      </>
                    )}
                  </Button>

                  <div className="text-center mt-4">
                    <Button 
                      type="button"
                      variant="ghost" 
                      onClick={() => setResetStep('email')}
                      className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                    >
                      Mot de passe oublié ?
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="register" className="p-6 m-0 rounded-none space-y-4 animate-fade-in">
                <div className="text-center space-y-2 mb-6">
                  <h2 className="text-xl font-semibold">Créer un compte</h2>
                  <p className="text-sm text-muted-foreground">
                    Rejoignez Stocknix et commencez dès maintenant
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input 
                        id="firstName" 
                        name="firstName" 
                        type="text" 
                        required
                        value={formData.firstName} 
                        onChange={handleInputChange} 
                        placeholder="Jean"
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input 
                        id="lastName" 
                        name="lastName" 
                        type="text" 
                        required
                        value={formData.lastName} 
                        onChange={handleInputChange} 
                        placeholder="Dupont"
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input 
                      id="register-email" 
                      name="email" 
                      type="email" 
                      required 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      placeholder="jean.dupont@example.com"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Mot de passe</Label>
                    <div className="relative">
                      <Input 
                        id="register-password"
                        name="password" 
                        type={showPassword ? 'text' : 'password'} 
                        required 
                        value={formData.password} 
                        onChange={handleInputChange} 
                        placeholder="••••••••" 
                        className="pr-12 h-12"
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

                  <Button type="submit" className="w-full h-12 text-base font-medium" disabled={loading}>
                    {loading ? (
                      'Création en cours...'
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Créer mon compte
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="px-6 pb-6">
              <div className="text-center text-xs text-muted-foreground">
                <Link to="/" className="hover:text-foreground hover:underline transition-colors">
                  ← Retour à l'accueil
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
}