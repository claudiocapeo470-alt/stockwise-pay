import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BarChart3, Eye, EyeOff, LogIn, UserPlus, ArrowLeft, Sparkles, Shield, Zap, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { z } from 'zod';

// Schemas de validation
const loginSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères')
});

const signupSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  password: z.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

const passwordResetEmailSchema = z.object({
  email: z.string().email('Adresse email invalide')
});

const passwordResetCodeSchema = z.object({
  resetCode: z.string().length(6, 'Le code doit contenir exactement 6 chiffres').regex(/^\d{6}$/, 'Le code doit contenir uniquement des chiffres')
});

const newPasswordSchema = z.object({
  password: z.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [resetStep, setResetStep] = useState<'email' | 'code' | 'password' | null>(null);
  const [resetEmail, setResetEmail] = useState('');

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/app');
    }
  }, [user, navigate]);

  // Gérer les paramètres d'URL pour la confirmation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('confirmed') === 'true') {
      // S'assurer que l'utilisateur est sur l'onglet de connexion
      setActiveTab('login');
      toast({
        title: 'Compte confirmé !',
        description: 'Votre compte a été activé avec succès. Vous pouvez maintenant vous connecter.',
        duration: 5000
      });
      // Nettoyer l'URL
      window.history.replaceState({}, '', '/auth');
    }
  }, [toast]);

  // Générer un code de réinitialisation de 6 chiffres
  const generateResetCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});
    setLoading(true);

    try {
      if (resetStep === 'email') {
        // Validation de l'email
        const validationResult = passwordResetEmailSchema.safeParse({ email: resetEmail });
        if (!validationResult.success) {
          const errors: Record<string, string> = {};
          validationResult.error.errors.forEach((err) => {
            errors[err.path[0] as string] = err.message;
          });
          setValidationErrors(errors);
          setLoading(false);
          return;
        }

        const response = await fetch(`https://fsdfzzhbydlmuiblgkvb.supabase.co/functions/v1/send-password-reset`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzZGZ6emhieWRsbXVpYmxna3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MTE5NjUsImV4cCI6MjA3MjQ4Nzk2NX0.NlfYPNMEpTAqXbJsLpBM3ubw0U2o5S63NVveVzLUT4w`
          },
          body: JSON.stringify({ email: resetEmail })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de l\'envoi de l\'email');
        }

        localStorage.setItem('resetEmail', resetEmail);
        setResetStep('code');
        toast({
          title: 'Code envoyé',
          description: 'Vérifiez votre email pour le code de vérification'
        });
      } else if (resetStep === 'code') {
        // Validation du code
        const validationResult = passwordResetCodeSchema.safeParse({ resetCode: formData.resetCode });
        if (!validationResult.success) {
          const errors: Record<string, string> = {};
          validationResult.error.errors.forEach((err) => {
            errors[err.path[0] as string] = err.message;
          });
          setValidationErrors(errors);
          setLoading(false);
          return;
        }

        localStorage.setItem('resetCode', formData.resetCode);
        setResetStep('password');
        toast({
          title: 'Code vérifié',
          description: 'Vous pouvez maintenant saisir votre nouveau mot de passe'
        });
      } else if (resetStep === 'password') {
        // Validation du nouveau mot de passe
        const validationResult = newPasswordSchema.safeParse({
          password: formData.password,
          confirmPassword: formData.confirmPassword
        });
        if (!validationResult.success) {
          const errors: Record<string, string> = {};
          validationResult.error.errors.forEach((err) => {
            errors[err.path[0] as string] = err.message;
          });
          setValidationErrors(errors);
          setLoading(false);
          return;
        }

        const storedEmail = localStorage.getItem('resetEmail');
        const storedCode = localStorage.getItem('resetCode');
        
        if (!storedEmail || !storedCode) {
          setError('Session expirée. Veuillez recommencer.');
          setResetStep('email');
          return;
        }

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

        localStorage.removeItem('resetCode');
        localStorage.removeItem('resetEmail');

        // Toujours rediriger vers la page de connexion après réinitialisation
        setResetStep(null);
        setActiveTab('login');
        setFormData({
          ...formData,
          email: storedEmail,
          password: '',
          confirmPassword: '',
          resetCode: ''
        });
        toast({
          title: 'Mot de passe réinitialisé avec succès !',
          description: 'Veuillez vous connecter avec votre nouveau mot de passe.',
          duration: 6000
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
    setValidationErrors({});
    setLoading(true);

    try {
      if (activeTab === 'login') {
        // Validation des données de connexion
        const validationResult = loginSchema.safeParse({
          email: formData.email,
          password: formData.password
        });
        
        if (!validationResult.success) {
          const errors: Record<string, string> = {};
          validationResult.error.errors.forEach((err) => {
            errors[err.path[0] as string] = err.message;
          });
          setValidationErrors(errors);
          setLoading(false);
          return;
        }

        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          if (error.message?.includes('Invalid login credentials')) {
            setError('Email ou mot de passe incorrect. Vérifiez vos identifiants.');
          } else if (error.message?.includes('Email not confirmed') || error.message?.includes('pas encore confirmé')) {
            setError('Votre compte n\'est pas encore confirmé. Vérifiez votre email et cliquez sur le lien de confirmation.');
          } else if (error.message?.includes('Invalid email')) {
            setError('Format d\'email invalide.');
          } else if (error.message?.includes('Too many requests')) {
            setError('Trop de tentatives de connexion. Veuillez patienter avant de réessayer.');
          } else {
            setError(error.message || 'Erreur de connexion. Veuillez réessayer.');
          }
        } else {
          toast({
            title: 'Connexion réussie !',
            description: 'Bienvenue dans Stocknix !'
          });
        }
      } else {
        // Validation des données d'inscription
        const validationResult = signupSchema.safeParse({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        });
        
        if (!validationResult.success) {
          const errors: Record<string, string> = {};
          validationResult.error.errors.forEach((err) => {
            errors[err.path[0] as string] = err.message;
          });
          setValidationErrors(errors);
          setLoading(false);
          return;
        }
        
        const { error, needsConfirmation, user } = await signUp(
          formData.email,
          formData.password,
          formData.firstName,
          formData.lastName
        );
        
        if (error) {
          if (error.message?.includes('User already registered')) {
            setError('Un utilisateur avec cet email existe déjà. Essayez de vous connecter.');
          } else if (error.message?.includes('Invalid email')) {
            setError('Adresse email invalide');
          } else if (error.message?.includes('Password should be at least')) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
          } else if (error.message?.includes('Signup is disabled')) {
            setError('Les inscriptions sont temporairement désactivées');
          } else {
            console.error('Erreur d\'inscription:', error);
            setError('Erreur lors de l\'inscription. Veuillez réessayer.');
          }
        } else if (user) {
          // Inscription réussie - confirmation d'email TOUJOURS nécessaire
          const successMessage = needsConfirmation 
            ? 'Compte créé avec succès ! Vérifiez votre email pour confirmer votre compte avant de vous connecter.'
            : 'Compte créé et confirmé ! Vous pouvez maintenant vous connecter.';
          
          toast({
            title: 'Inscription réussie !',
            description: successMessage,
            duration: 8000
          });
          
          if (needsConfirmation) {
            // Rester sur l'onglet inscription avec un message clair
            setActiveTab('login');
            setFormData(prev => ({
              ...prev,
              email: formData.email,
              password: '',
              firstName: '',
              lastName: '',
              confirmPassword: ''
            }));
            setValidationErrors({});
          } else {
            // Si pas de confirmation nécessaire, basculer vers la connexion
            setTimeout(() => {
              setActiveTab('login');
              setFormData(prev => ({
                ...prev,
                email: formData.email,
                password: '',
                firstName: '',
                lastName: '',
                confirmPassword: ''
              }));
              setValidationErrors({});
            }, 2000);
          }
        }
      }
    } catch (err) {
      setError('Une erreur inattendue est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Nettoyer l'erreur de validation pour ce champ quand l'utilisateur tape
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleResetEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResetEmail(e.target.value);
    // Nettoyer l'erreur de validation pour l'email
    if (validationErrors.email) {
      setValidationErrors(prev => ({
        ...prev,
        email: ''
      }));
    }
  };

  // Fonction utilitaire pour afficher les erreurs de validation
  const getFieldError = (fieldName: string) => {
    return validationErrors[fieldName] || '';
  };

  // Password Reset UI
  if (resetStep) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-r from-accent/20 to-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-20 w-72 h-72 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setResetStep(null)} 
              className="group flex items-center gap-2 text-foreground hover:bg-accent transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Retour à la connexion
            </Button>
          </div>

          <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Réinitialisation</h2>
              <p className="text-muted-foreground">Récupérez l'accès à votre compte</p>
            </div>

            {resetStep === 'email' && (
              <form onSubmit={handlePasswordReset} className="space-y-6">
                {error && (
                  <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="reset-email">Adresse email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={handleResetEmailChange}
                    placeholder="votre@email.com"
                    className={`h-12 rounded-2xl ${getFieldError('email') ? 'border-red-500' : ''}`}
                  />
                  {getFieldError('email') && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError('email')}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200" 
                  disabled={loading}
                >
                  {loading ? 'Envoi...' : 'Envoyer le code'}
                </Button>
              </form>
            )}

            {resetStep === 'code' && (
              <form onSubmit={handlePasswordReset} className="space-y-6">
                {error && (
                  <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

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
                    className={`h-12 text-center text-lg font-mono rounded-2xl ${getFieldError('resetCode') ? 'border-red-500' : ''}`}
                    maxLength={6}
                  />
                  {getFieldError('resetCode') && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError('resetCode')}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200" 
                  disabled={loading}
                >
                  {loading ? 'Vérification...' : 'Vérifier le code'}
                </Button>
              </form>
            )}

            {resetStep === 'password' && (
              <form onSubmit={handlePasswordReset} className="space-y-6">
                {error && (
                  <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
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
                        className={`h-12 rounded-2xl pr-12 ${getFieldError('password') ? 'border-red-500' : ''}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {getFieldError('password') && (
                      <p className="text-sm text-red-500 mt-1">{getFieldError('password')}</p>
                    )}
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
                        className={`h-12 rounded-2xl pr-12 ${getFieldError('confirmPassword') ? 'border-red-500' : ''}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {getFieldError('confirmPassword') && (
                      <p className="text-sm text-red-500 mt-1">{getFieldError('confirmPassword')}</p>
                    )}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200" 
                  disabled={loading}
                >
                  {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main Auth UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex relative overflow-hidden">
      {/* Bouton de retour discret et responsive */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/')} 
          className="group p-2 rounded-full bg-card/60 backdrop-blur-md border border-border/30 shadow-md hover:shadow-lg hover:bg-card/80 transition-all duration-300 text-muted-foreground hover:text-primary"
          aria-label="Retour à l'accueil"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        </Button>
      </div>

      {/* Modern animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-r from-accent/20 to-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-72 h-72 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-card/50 via-primary/10 to-accent/10 backdrop-blur-sm"></div>
        
        {/* Floating elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-16 w-16 h-16 border border-primary/30 rounded-2xl rotate-12 animate-float"></div>
          <div className="absolute bottom-32 right-20 w-12 h-12 bg-gradient-to-br from-accent/30 to-primary/30 rounded-full animate-float-delayed"></div>
          <div className="absolute top-1/2 left-12 w-8 h-8 bg-secondary/40 rounded-lg rotate-45 animate-pulse"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 py-20">
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                  <BarChart3 className="h-10 w-10 text-primary" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary tracking-tight">
                  Stocknix
                </h1>
                <div className="h-1 w-24 bg-gradient-to-r from-primary to-accent rounded-full mt-1"></div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground leading-tight">
                Accédez à votre espace
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent"> professionnel</span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Révolutionnez votre gestion d'entreprise avec notre solution de nouvelle génération. 
                Gérez vos clients, suivez vos paiements et générez vos rapports financiers en toute simplicité.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {[
              { icon: TrendingUp, text: "Tableau de bord intuitif", gradient: "from-blue-500 to-cyan-500" },
              { icon: Zap, text: "Gestion automatisée", gradient: "from-purple-500 to-pink-500" },
              { icon: Sparkles, text: "Rapports en temps réel", gradient: "from-amber-500 to-orange-500" },
              { icon: Shield, text: "Sécurité avancée", gradient: "from-emerald-500 to-teal-500" }
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-4 group cursor-pointer">
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300`}></div>
                  <div className={`relative w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <span className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-3">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Stocknix
              </h1>
            </div>
            <p className="text-muted-foreground">Votre plateforme de gestion moderne</p>
          </div>

          <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 backdrop-blur-sm rounded-2xl p-1">
                <TabsTrigger 
                  value="login" 
                  className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white font-medium transition-all duration-200"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Connexion
                </TabsTrigger>
                <TabsTrigger 
                  value="register"
                  className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white font-medium transition-all duration-200"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Inscription
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-6">
                <div className="text-center space-y-2 mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Bon retour !</h2>
                  <p className="text-muted-foreground">Connectez-vous à votre compte</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive" className="border-destructive/50 bg-destructive/10 rounded-2xl">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Adresse email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="votre@email.com"
                        className={`h-12 rounded-2xl ${getFieldError('email') ? 'border-red-500' : ''}`}
                      />
                      {getFieldError('email') && (
                        <p className="text-sm text-red-500 mt-1">{getFieldError('email')}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Mot de passe</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          className={`h-12 rounded-2xl pr-12 ${getFieldError('password') ? 'border-red-500' : ''}`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {getFieldError('password') && (
                        <p className="text-sm text-red-500 mt-1">{getFieldError('password')}</p>
                      )}
                    </div>
                  </div>

                    <div className="flex items-center justify-between">
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => setResetStep('email')}
                        className="p-0 h-auto text-primary hover:text-primary/80"
                      >
                        Mot de passe oublié ?
                      </Button>
                      
                      <Button
                        type="button"
                        variant="link"
                        onClick={async () => {
                          if (!formData.email) {
                            setError('Veuillez saisir votre email pour renvoyer la confirmation.');
                            return;
                          }
                          try {
                            setLoading(true);
                            const { error } = await supabase.auth.resend({
                              type: 'signup',
                              email: formData.email,
                              options: {
                                emailRedirectTo: `${window.location.origin}/auth/confirm`
                              }
                            });
                            if (error) {
                              setError('Erreur lors du renvoi de l\'email de confirmation.');
                            } else {
                              toast({
                                title: 'Email renvoyé',
                                description: 'Vérifiez votre boîte mail pour le nouveau lien de confirmation.'
                              });
                            }
                          } catch (err) {
                            setError('Erreur lors du renvoi de l\'email.');
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="p-0 h-auto text-muted-foreground hover:text-foreground text-xs"
                      >
                        Renvoyer la confirmation
                      </Button>
                    </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200" 
                    disabled={loading}
                  >
                    {loading ? 'Connexion...' : 'Se connecter'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-6">
                <div className="text-center space-y-2 mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Créer un compte</h2>
                  <p className="text-muted-foreground">Rejoignez-nous dès aujourd'hui</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive" className="border-destructive/50 bg-destructive/10 rounded-2xl">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Prénom</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          required
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="Jean"
                          className={`h-12 rounded-2xl ${getFieldError('firstName') ? 'border-red-500' : ''}`}
                        />
                        {getFieldError('firstName') && (
                          <p className="text-sm text-red-500 mt-1">{getFieldError('firstName')}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nom</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          required
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Dupont"
                          className={`h-12 rounded-2xl ${getFieldError('lastName') ? 'border-red-500' : ''}`}
                        />
                        {getFieldError('lastName') && (
                          <p className="text-sm text-red-500 mt-1">{getFieldError('lastName')}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email">Adresse email</Label>
                      <Input
                        id="register-email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="votre@email.com"
                        className={`h-12 rounded-2xl ${getFieldError('email') ? 'border-red-500' : ''}`}
                      />
                      {getFieldError('email') && (
                        <p className="text-sm text-red-500 mt-1">{getFieldError('email')}</p>
                      )}
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
                          className="h-12 rounded-2xl pr-12"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          className="h-12 rounded-2xl pr-12"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200" 
                    disabled={loading}
                  >
                    {loading ? 'Création...' : 'Créer mon compte'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-8 pt-6 border-t border-border/50 text-center">
              <p className="text-sm text-muted-foreground">
                En continuant, vous acceptez nos{' '}
                <Link to="/mentions-legales" className="text-primary hover:text-primary/80 transition-colors">
                  conditions d'utilisation
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
