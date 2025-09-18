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
        const {
          error: signInError
        } = await signIn(storedEmail, formData.password);
        if (signInError) {
          // Si la connexion automatique échoue, rediriger vers la page de connexion
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
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex relative">
        {/* Clean gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-800/30 to-slate-900/40"></div>

        {/* Côté gauche - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative">
          <div className="flex flex-col justify-center px-12 py-16 text-white relative z-10">
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                  <BarChart3 className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white">Stocknix</h1>
              </div>
              <p className="text-xl font-semibold mb-6 text-blue-100">Gestion Intelligente SaaS</p>
              <p className="text-blue-100 text-lg leading-relaxed">
                Gérez vos clients, suivez vos paiements et générez vos rapports financiers en toute simplicité avec notre solution moderne.
              </p>
            </div>
            
            <div className="space-y-4 text-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full opacity-80"></div>
                <span className="text-lg">Tableau de bord intuitif</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full opacity-80"></div>
                <span className="text-lg">Gestion automatisée des paiements</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full opacity-80"></div>
                <span className="text-lg">Rapports détaillés en temps réel</span>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        {/* Côté droit - Formulaire */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-12 relative z-10">
          <div className="w-full max-w-md">
            {/* Back button */}
            <div className="mb-6">
              <Button variant="ghost" onClick={() => setResetStep(null)} className="group flex items-center gap-2 text-white hover:text-white hover:bg-white/10 transition-all duration-200 p-3 rounded-xl">
                <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                <span className="text-sm font-medium">Retour</span>
              </Button>
            </div>

            <div className="text-center mb-8">
              <div className="lg:hidden flex justify-center mb-4">
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">Réinitialisation du mot de passe</h2>
              <p className="text-white/70 text-lg">Suivez les étapes pour récupérer votre accès</p>
            </div>

            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8">
              {resetStep === 'email' && <div className="space-y-6">
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
                      <Input id="reset-email" type="email" required value={resetEmail} onChange={handleResetEmailChange} placeholder="jean.dupont@example.com" className="h-12 rounded-xl bg-input border-border focus:border-primary focus:ring-primary text-foreground" />
                    </div>

                    <Button type="submit" className="w-full h-12 text-base font-medium rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-200 shadow-lg hover:shadow-xl" disabled={loading}>
                      {loading ? 'Envoi en cours...' : 'Envoyer le code'}
                    </Button>
                  </form>
                </div>}

              {resetStep === 'code' && <div className="space-y-6">
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
                      <Input id="reset-code" name="resetCode" type="text" required value={formData.resetCode} onChange={handleInputChange} placeholder="123456" className="h-12 text-center text-lg font-mono rounded-xl bg-input border-border focus:border-primary focus:ring-primary text-foreground" maxLength={6} />
                    </div>

                    <Button type="submit" className="w-full h-12 text-base font-medium rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-200 shadow-lg hover:shadow-xl" disabled={loading}>
                      {loading ? 'Vérification...' : 'Vérifier le code'}
                    </Button>
                  </form>
                </div>}

              {resetStep === 'password' && <div className="space-y-6">
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
                        <Input id="new-password" name="password" type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={handleInputChange} placeholder="••••••••" className="pr-12 h-12 rounded-xl bg-input border-border focus:border-primary focus:ring-primary text-foreground" minLength={6} />
                        <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-sm font-medium text-card-foreground">Confirmer le mot de passe</Label>
                      <div className="relative">
                        <Input id="confirm-password" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required value={formData.confirmPassword} onChange={handleInputChange} placeholder="••••••••" className="pr-12 h-12 rounded-xl bg-input border-border focus:border-primary focus:ring-primary text-foreground" minLength={6} />
                        <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                          {showConfirmPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                        </Button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-12 text-base font-medium rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-200 shadow-lg hover:shadow-xl" disabled={loading}>
                      {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                    </Button>
                  </form>
                </div>}

              <div className="mt-8 text-center">
                <Button variant="ghost" onClick={() => {
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
              }} className="text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 px-3 py-2">
                  ← Retour à la connexion
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen relative overflow-hidden">
      {/* Ultra modern animated gradient background with 8K depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/50 via-purple-900/30 to-indigo-950/50 animate-pulse"></div>
      
      {/* Professional floating geometric shapes for 3D depth */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full blur-xl animate-float"></div>
      <div className="absolute top-60 right-32 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-full blur-lg animate-float-delayed"></div>
      <div className="absolute bottom-40 left-32 w-40 h-40 bg-gradient-to-br from-indigo-500/15 to-purple-600/15 rounded-full blur-2xl animate-float-slow"></div>
      <div className="absolute bottom-20 right-20 w-28 h-28 bg-gradient-to-br from-cyan-400/15 to-blue-500/15 rounded-full blur-lg animate-float"></div>

      {/* Premium grid overlay for ultra-modern depth */}
      <div className="absolute inset-0 opacity-10" style={{
      backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
      backgroundSize: '50px 50px'
    }}></div>

      <div className="relative z-10 min-h-screen flex">
        {/* Côté gauche - Ultra-premium branding avec effets 3D */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          {/* Multi-layer gradient overlay with premium depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-purple-900/70 to-slate-900/90 backdrop-blur-sm"></div>
          
          {/* Professional 3D geometric decorations */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-32 left-16 w-20 h-20 border-2 border-cyan-400/30 rotate-45 animate-spin-slow"></div>
            <div className="absolute bottom-40 right-20 w-16 h-16 border-2 border-purple-400/30 rotate-12 animate-pulse"></div>
            <div className="absolute top-1/2 left-8 w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg rotate-45 animate-float"></div>
          </div>

          <div className="relative z-10 flex flex-col justify-center px-16 py-20 text-white">
            <div className="mb-16">
              <div className="flex items-center gap-6 mb-8">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-3xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-cyan-500/20 to-purple-600/20 backdrop-blur-xl rounded-3xl p-5 border border-white/10">
                    <BarChart3 className="h-12 w-12 text-cyan-300" />
                  </div>
                </div>
                <div>
                  <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-indigo-300 tracking-tight">Stocknix</h1>
                  <div className="h-1 w-32 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full mt-2"></div>
                </div>
              </div>
              
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white/95 leading-tight">
                  Plateforme de Gestion
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300"> Ultra-Moderne</span>
                </h2>
                <p className="text-xl text-cyan-100/80 leading-relaxed">
                  Révolutionnez votre gestion d'entreprise avec notre solution de nouvelle génération, Gérez vos clients, suivez vos paiements et générez vos rapports financiers en toute simplicité . Intelligence artificielle, automatisation et design futuriste en ultra-haute définition
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              {[{
              text: "Tableau de bord intuitif",
              gradient: "from-cyan-400 to-blue-500"
            }, {
              text: "Gestion automatisée des paiements",
              gradient: "from-purple-400 to-pink-500"
            }, {
              text: "Rapports détaillés en temps réel",
              gradient: "from-indigo-400 to-purple-500"
            }, {
              text: "Performance & Vitesse Optimales",
              gradient: "from-cyan-400 to-purple-500"
            }, {
              text: "IA Intégrée & Automatisation",
              gradient: "from-emerald-400 to-cyan-500"
            }].map((feature, index) => <div key={index} className="flex items-center gap-4 group cursor-pointer">
                  <div className="relative">
                    <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300`}></div>
                    <div className={`relative w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10`}>
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <span className="text-lg font-medium text-white/90 group-hover:text-white transition-colors">
                    {feature.text}
                  </span>
                </div>)}
            </div>
          </div>
        </div>

        {/* Côté droit - Formulaire ultra-premium avec glassmorphism */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-16 relative">
          {/* Back button avec effet néon premium */}
          <div className="absolute top-8 left-8">
            <Button variant="ghost" onClick={() => navigate('/')} className="group flex items-center gap-3 text-white/80 hover:text-white hover:bg-white/5 transition-all duration-300 p-4 rounded-2xl border border-white/10 hover:border-cyan-400/30 backdrop-blur-sm hover:shadow-lg hover:shadow-cyan-500/20">
              <div className="relative">
                <ArrowLeft className="h-5 w-5 transition-all duration-300 group-hover:-translate-x-1 group-hover:text-cyan-300" />
                <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <span className="text-sm font-semibold tracking-wide">Retour</span>
            </Button>
          </div>

          <div className="w-full max-w-lg">
            {/* Header avec effet de profondeur 8K */}
            <div className="text-center mb-12">
              <div className="lg:hidden flex justify-center mb-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-3xl blur-lg opacity-75"></div>
                  <div className="relative bg-gradient-to-br from-cyan-500/20 to-purple-600/20 backdrop-blur-xl rounded-3xl p-4 border border-white/10">
                    <BarChart3 className="h-10 w-10 text-cyan-300" />
                  </div>
                </div>
              </div>
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-200 mb-4 tracking-tight">
                Bienvenue
              </h2>
              <p className="text-xl font-medium text-slate-50">
                Accédez à votre espace professionnel ultra-moderne
              </p>
            </div>

            {/* Formulaire avec glassmorphism 8K ultra-premium */}
            <div className="relative group">
              {/* Glow effect background avec profondeur extrême */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-indigo-500/20 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-10 shadow-2xl">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-10 bg-white/5 rounded-2xl p-2 backdrop-blur-sm border border-white/10 py-0 px-0">
                    <TabsTrigger value="login" className="rounded-xl text-sm font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-white/70 hover:text-white/90 px-0 my-0 py-[10px]">
                      <LogIn className="w-4 h-4 mr-2" />
                      Connexion
                    </TabsTrigger>
                    <TabsTrigger value="register" className="rounded-xl text-sm font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-white/70 hover:text-white/90 px-0 py-[10px]">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Inscription
                    </TabsTrigger>
                  </TabsList>

                  {error && <Alert variant="destructive" className="mb-8 rounded-2xl bg-red-500/10 border-red-500/20 backdrop-blur-sm">
                      <AlertDescription className="text-red-200">{error}</AlertDescription>
                    </Alert>}

                  <TabsContent value="login" className="space-y-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-sm font-semibold text-white/90 tracking-wide">Adresse email</Label>
                        <Input id="email" name="email" type="email" required value={formData.email} onChange={handleInputChange} placeholder="jean.dupont@example.com" className="h-14 rounded-2xl bg-white/5 border-white/10 focus:border-cyan-400/50 focus:ring-cyan-400/20 text-white placeholder:text-white/40 backdrop-blur-sm transition-all duration-300 hover:bg-white/10" />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="password" className="text-sm font-semibold text-white/90 tracking-wide">Mot de passe</Label>
                        <div className="relative">
                          <Input id="password" name="password" type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={handleInputChange} placeholder="••••••••" className="pr-14 h-14 rounded-2xl bg-white/5 border-white/10 focus:border-cyan-400/50 focus:ring-cyan-400/20 text-white placeholder:text-white/40 backdrop-blur-sm transition-all duration-300 hover:bg-white/10" />
                          <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-4 hover:bg-transparent text-white/60 hover:text-white" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </Button>
                        </div>
                      </div>

                      <div className="text-right">
                        <button type="button" onClick={() => setResetStep('email')} className="text-sm text-cyan-300 hover:text-cyan-200 font-semibold transition-colors tracking-wide">
                          Mot de passe oublié ?
                        </button>
                      </div>

                      <Button type="submit" className="w-full h-16 text-lg font-bold rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white transition-all duration-300 shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-[1.02] relative overflow-hidden group" disabled={loading}>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <span className="relative z-10 tracking-wide">
                          {loading ? 'Connexion...' : 'Se connecter'}
                        </span>
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="register" className="space-y-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="firstName" className="text-sm font-semibold text-white/90 tracking-wide">Prénom</Label>
                          <Input id="firstName" name="firstName" type="text" required value={formData.firstName} onChange={handleInputChange} placeholder="Jean" className="h-14 rounded-2xl bg-white/5 border-white/10 focus:border-cyan-400/50 focus:ring-cyan-400/20 text-white placeholder:text-white/40 backdrop-blur-sm transition-all duration-300 hover:bg-white/10" />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="lastName" className="text-sm font-semibold text-white/90 tracking-wide">Nom</Label>
                          <Input id="lastName" name="lastName" type="text" required value={formData.lastName} onChange={handleInputChange} placeholder="Dupont" className="h-14 rounded-2xl bg-white/5 border-white/10 focus:border-cyan-400/50 focus:ring-cyan-400/20 text-white placeholder:text-white/40 backdrop-blur-sm transition-all duration-300 hover:bg-white/10" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="email-register" className="text-sm font-semibold text-white/90 tracking-wide">Adresse email</Label>
                        <Input id="email-register" name="email" type="email" required value={formData.email} onChange={handleInputChange} placeholder="jean.dupont@example.com" className="h-14 rounded-2xl bg-white/5 border-white/10 focus:border-cyan-400/50 focus:ring-cyan-400/20 text-white placeholder:text-white/40 backdrop-blur-sm transition-all duration-300 hover:bg-white/10" />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="password-register" className="text-sm font-semibold text-white/90 tracking-wide">Mot de passe</Label>
                        <div className="relative">
                          <Input id="password-register" name="password" type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={handleInputChange} placeholder="••••••••" className="pr-14 h-14 rounded-2xl bg-white/5 border-white/10 focus:border-cyan-400/50 focus:ring-cyan-400/20 text-white placeholder:text-white/40 backdrop-blur-sm transition-all duration-300 hover:bg-white/10" minLength={6} />
                          <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-4 hover:bg-transparent text-white/60 hover:text-white" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="confirm-password" className="text-sm font-semibold text-white/90 tracking-wide">Confirmer le mot de passe</Label>
                        <div className="relative">
                          <Input id="confirm-password" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required value={formData.confirmPassword} onChange={handleInputChange} placeholder="••••••••" className="pr-14 h-14 rounded-2xl bg-white/5 border-white/10 focus:border-cyan-400/50 focus:ring-cyan-400/20 text-white placeholder:text-white/40 backdrop-blur-sm transition-all duration-300 hover:bg-white/10" />
                          <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-4 hover:bg-transparent text-white/60 hover:text-white" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </Button>
                        </div>
                      </div>

                      <Button type="submit" className="w-full h-16 text-lg font-bold rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white transition-all duration-300 shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-[1.02] relative overflow-hidden group" disabled={loading}>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <span className="relative z-10 tracking-wide">
                          {loading ? 'Inscription...' : 'Créer un compte'}
                        </span>
                      </Button>
                    </form>

                    <p className="text-xs text-white/60 text-center mt-8 leading-relaxed">
                      En créant un compte, vous acceptez nos{' '}
                      <Link to="/mentions-legales" className="text-cyan-300 hover:text-cyan-200 font-semibold transition-colors">
                        conditions d'utilisation
                      </Link>{' '}
                      et notre{' '}
                      <Link to="/mentions-legales" className="text-cyan-300 hover:text-cyan-200 font-semibold transition-colors">
                        politique de confidentialité
                      </Link>.
                    </p>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
}