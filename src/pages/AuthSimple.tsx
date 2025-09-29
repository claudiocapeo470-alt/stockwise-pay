import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

// Schémas de validation ultra-simples
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
  const { user, signIn, signUp, loading } = useAuth();
  
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetStep, setResetStep] = useState<'email' | 'success' | null>(null);
  
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

  // Réinitialisation de mot de passe SIMPLE avec Supabase natif
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

      // Utilisation de la réinitialisation native Supabase
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
      toast.error('❌ Erreur', {
        description: 'Une erreur est survenue'
      });
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
        // LOGIN
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
            toast.error('❌ Connexion échouée', {
              description: 'Email ou mot de passe incorrect'
            });
          } else if (error.message.includes('pas encore confirmé')) {
            toast.error('❌ Compte non confirmé', {
              description: 'Vérifiez votre email pour confirmer votre compte'
            });
          } else {
            toast.error('❌ Erreur de connexion', {
              description: error.message
            });
          }
          return;
        }

        toast.success('✅ Connexion réussie !');
        navigate('/app');
        
      } else {
        // INSCRIPTION
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
            toast.error('❌ Inscription échouée', {
              description: 'Un compte avec cet email existe déjà'
            });
          } else {
            toast.error('❌ Erreur d\'inscription', {
              description: error.message
            });
          }
          return;
        }

        if (needsConfirmation) {
          toast.success('✅ Inscription réussie !', {
            description: 'Vérifiez votre email pour confirmer votre compte'
          });
        } else {
          toast.success('✅ Compte créé et activé !');
          navigate('/app?confirmed=true');
        }
      }
    } catch (error: any) {
      toast.error('❌ Erreur', {
        description: 'Une erreur inattendue est survenue'
      });
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Interface de réinitialisation de mot de passe
  if (resetStep) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              {resetStep === 'success' ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <AlertCircle className="h-6 w-6 text-primary" />
              )}
            </div>
            <CardTitle>
              {resetStep === 'success' ? 'Email envoyé !' : 'Réinitialiser le mot de passe'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {resetStep === 'email' && (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
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
                  {isLoading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
                </Button>
              </form>
            )}
            
            {resetStep === 'success' && (
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Un email avec les instructions a été envoyé à <strong>{resetEmail}</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  Vérifiez aussi votre dossier spam/courrier indésirable
                </p>
              </div>
            )}
            
            <Button 
              variant="outline"
              onClick={() => setResetStep(null)}
              className="w-full"
            >
              Retour à la connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Interface principale d'authentification
  return (
    <div className="min-h-screen flex">
      {/* Partie gauche - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary items-center justify-center p-8">
        <div className="text-center text-white space-y-6">
          <h1 className="text-4xl font-bold">Stocknix</h1>
          <p className="text-xl opacity-90">
            Gérez votre business en toute simplicité
          </p>
          <div className="space-y-4 text-left max-w-md">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-white rounded-full"></div>
              <span>Gestion de stock intelligente</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-white rounded-full"></div>
              <span>Suivi des ventes en temps réel</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-white rounded-full"></div>
              <span>Rapports et analytics</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-white rounded-full"></div>
              <span>Gestion des paiements</span>
            </div>
          </div>
        </div>
      </div>

      {/* Partie droite - Formulaires */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {activeTab === 'login' ? 'Connexion' : 'Créer un compte'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="register">Inscription</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4 mt-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
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
                      <p className="text-sm text-destructive mt-1">{getFieldError('email')}</p>
                    )}
                  </div>
                  
                  <div>
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
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {getFieldError('password') && (
                      <p className="text-sm text-destructive mt-1">{getFieldError('password')}</p>
                    )}
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Connexion...' : 'Se connecter'}
                  </Button>
                </form>
                
                <div className="text-center">
                  <Button 
                    variant="link" 
                    onClick={() => setResetStep('email')}
                    className="text-sm"
                  >
                    Mot de passe oublié ?
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="register" className="space-y-4 mt-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Prénom (optionnel)</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Nom (optionnel)</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  
                  <div>
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
                      <p className="text-sm text-destructive mt-1">{getFieldError('email')}</p>
                    )}
                  </div>
                  
                  <div>
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
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {getFieldError('password') && (
                      <p className="text-sm text-destructive mt-1">{getFieldError('password')}</p>
                    )}
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Création...' : 'Créer mon compte'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}