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
export default function Auth() {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
                  lastName: ''
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
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
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
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
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