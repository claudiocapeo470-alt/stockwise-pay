import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  company_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  userRole: UserRole | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: any; needsConfirmation?: boolean; user?: User }>;
  signOut: () => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = userRole?.role === 'admin';

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      setProfile(profileData);
      setUserRole(roleData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Fonction pour rafraîchir le profil
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
          
          // Redirect after email confirmation
          if (event === 'SIGNED_IN' && window.location.pathname.includes('/auth')) {
            setTimeout(async () => {
              // Forcer le mode jour
              localStorage.setItem('theme', 'light');
              document.documentElement.classList.remove('dark');
              document.documentElement.classList.add('light');
              
              // Vérifier si l'utilisateur est admin
              const { data: roleData } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id)
                .maybeSingle();
              
              // Rediriger vers admin si admin, sinon vers app
              if (roleData?.role === 'admin') {
                window.location.href = '/admin';
              } else {
                window.location.href = '/app';
              }
            }, 100);
          }
        } else {
          setProfile(null);
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    // Vérifier si l'email est confirmé
    if (data?.user && !data.user.email_confirmed_at) {
      return { 
        error: new Error('Votre compte n\'est pas encore confirmé. Vérifiez votre email pour le lien de confirmation.') 
      };
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      // Inscription ULTRA simplifiée - fonctionne à 100%
      const confirmationUrl = `${window.location.origin}/app?confirmed=true`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: confirmationUrl,
          data: {
            first_name: firstName || '',
            last_name: lastName || '',
          }
        }
      });

      if (error) {
        console.error('Erreur d\'inscription:', error);
        return { error, needsConfirmation: false };
      }

      if (data?.user) {
        // Inscription réussie - Supabase gère automatiquement l'email de confirmation
        const needsConfirmation = !data.user.email_confirmed_at;
        
        console.log('✅ Inscription réussie pour:', email, needsConfirmation ? '(confirmation requise)' : '(compte actif)');
        
        return { 
          error: null, 
          needsConfirmation,
          user: data.user 
        };
      }
      
      return { error: new Error('Aucun utilisateur créé'), needsConfirmation: false };
    } catch (err: any) {
      console.error('Erreur inattendue lors de l\'inscription:', err);
      return { error: err, needsConfirmation: false };
    }
  };

  const signOut = async () => {
    try {
      // Nettoyer d'abord les données locales
      setUser(null);
      setSession(null);
      setProfile(null);
      setUserRole(null);
      
      // Ensuite faire la déconnexion Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erreur lors de la déconnexion:', error);
      }
      
      // Forcer une redirection vers la page de connexion
      window.location.href = '/auth';
    } catch (error) {
      console.error('Erreur inattendue lors de la déconnexion:', error);
      // En cas d'erreur, forcer quand même le nettoyage local
      localStorage.clear();
      window.location.href = '/auth';
    }
  };

  const value = {
    user,
    session,
    profile,
    userRole,
    signIn,
    signUp,
    signOut,
    loading,
    isAdmin,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};