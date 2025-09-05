import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { BarChart3, Eye, EyeOff, LogIn, UserPlus, CreditCard, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
    
    // Check for payment success or cancellation
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      handlePaymentReturn();
    } else if (paymentStatus === 'cancelled') {
      toast({
        title: "Paiement annulé",
        description: "Vous pouvez réessayer le paiement quand vous voulez.",
        variant: "destructive",
      });
      // Clean URL
      navigate('/auth', { replace: true });
    }
  }, [user, navigate, searchParams]);

  const handlePaymentReturn = async () => {
    setProcessingPayment(true);
    try {
      const reference = searchParams.get('reference');
      const trxref = searchParams.get('trxref'); // Paystack also sends trxref
      const paymentRef = reference || trxref;
      
      if (paymentRef && formData.email) {
        const { data, error } = await supabase.functions.invoke('process-payment', {
          body: { reference: paymentRef, email: formData.email }
        });
        
        if (error) throw error;
        
        toast({
          title: "Paiement réussi",
          description: "Votre abonnement est maintenant actif !",
        });
        
        // Clear payment success from URL and redirect to main app
        navigate('/', { replace: true });
      } else {
        throw new Error("Référence de paiement manquante");
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      toast({
        title: "Erreur de paiement",
        description: "Une erreur s'est produite lors du traitement du paiement.",
        variant: "destructive",
      });
      navigate('/auth', { replace: true });
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCreateSubscription = async () => {
    if (!formData.email || !formData.firstName || !formData.lastName) {
      setError('Veuillez remplir tous les champs requis');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }
      });

      if (error) throw error;

      // Redirect to Paystack payment page
      window.location.href = data.authorization_url;
    } catch (error) {
      console.error('Subscription creation error:', error);
      setError('Erreur lors de la création de l\'abonnement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          if (error.message?.includes('Invalid login credentials')) {
            setError('Email ou mot de passe incorrect');
          } else {
            setError(error.message || 'Erreur de connexion');
          }
        } else {
          toast({
            title: 'Connexion réussie',
            description: 'Bienvenue dans GestionPro !',
          });
        }
      } else {
        // For new users, show payment form first
        if (!showPayment) {
          if (formData.password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
          }
          setShowPayment(true);
          setLoading(false);
          return;
        }

        // If payment form is shown, create account after successful payment
        const { error } = await signUp(
          formData.email, 
          formData.password, 
          formData.firstName, 
          formData.lastName
        );
        
        if (error) {
          if (error.message?.includes('User already registered')) {
            setError('Un utilisateur avec cet email existe déjà');
          } else {
            setError(error.message || 'Erreur lors de l\'inscription');
          }
        } else {
          toast({
            title: 'Inscription réussie',
            description: 'Vérifiez votre email pour confirmer votre compte',
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
      [e.target.name]: e.target.value,
    }));
  };

  const handleBackToForm = () => {
    setShowPayment(false);
    setError(null);
  };

  if (processingPayment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Traitement du paiement en cours...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-primary rounded-lg p-3">
              <BarChart3 className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">GestionPro</h1>
          <p className="text-sm text-muted-foreground">
            Gestion complète pour PME/TPE
          </p>
        </div>

        {/* Auth Form */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">
              {showPayment ? 'Abonnement mensuel' : (isLogin ? 'Connexion' : 'Créer un compte')}
            </CardTitle>
            <CardDescription className="text-center">
              {showPayment 
                ? 'Payez votre abonnement de 9999 FCFA/mois'
                : (isLogin 
                  ? 'Connectez-vous à votre espace de gestion'
                  : 'Créez votre compte pour commencer'
                )}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {showPayment ? (
              <div className="space-y-4">
                <div className="bg-gradient-subtle rounded-lg p-4 border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Abonnement mensuel</span>
                    <span className="text-lg font-bold">9999 FCFA</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Accès complet à toutes les fonctionnalités de GestionPro
                  </p>
                  <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                    <li>• Gestion des stocks illimitée</li>
                    <li>• Suivi des ventes et paiements</li>
                    <li>• Rapports détaillés</li>
                    <li>• Support client</li>
                  </ul>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <Button
                    onClick={handleCreateSubscription}
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      'Redirection...'
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Payer avec Paystack
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBackToForm}
                    className="w-full"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour au formulaire
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {!isLogin && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Jean"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Dupont"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="jean.dupont@example.com"
                  />
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
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                {!isLogin && (
                  <Alert>
                    <CreditCard className="h-4 w-4" />
                    <AlertDescription>
                      Un abonnement de <strong>9999 FCFA/mois</strong> est requis pour accéder à l'application.
                      Vous serez redirigé vers le paiement après avoir rempli ce formulaire.
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    'Chargement...'
                  ) : isLogin ? (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Se connecter
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Continuer vers le paiement
                    </>
                  )}
                </Button>
              </form>
            )}

            {!showPayment && (
              <div className="mt-6 text-center text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setShowPayment(false);
                    setError(null);
                    setFormData({
                      email: '',
                      password: '',
                      firstName: '',
                      lastName: '',
                    });
                  }}
                  className="text-primary hover:underline"
                >
                  {isLogin 
                    ? "Pas encore de compte ? S'inscrire"
                    : 'Déjà un compte ? Se connecter'
                  }
                </button>
              </div>
            )}

            <div className="mt-4 text-center text-xs text-muted-foreground">
              <Link to="/" className="hover:text-foreground hover:underline">
                ← Retour à l'accueil
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}