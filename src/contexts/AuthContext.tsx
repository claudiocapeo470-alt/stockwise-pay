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
      // Inscription simplifiée avec confirmation d'email
      const confirmationUrl = `${window.location.origin}/auth?confirmed=true`;
      
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

      if (data?.user && !error) {
        // L'utilisateur est créé, email de confirmation automatique par Supabase
        const needsConfirmation = !data.user.email_confirmed_at;
        
        // Tentative d'envoi d'email personnalisé (optionnel, ne bloque pas l'inscription)
        if (needsConfirmation && firstName && lastName) {
          try {
            fetch(`https://fsdfzzhbydlmuiblgkvb.supabase.co/functions/v1/send-confirmation-email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzZGZ6emhieWRsbXVpYmxna3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MTE5NjUsImV4cCI6MjA3MjQ4Nzk2NX0.NlfYPNMEpTAqXbJsLpBM3ubw0U2o5S63NVveVzLUT4w`
              },
              body: JSON.stringify({
                email,
                firstName,
                lastName,
                confirmationUrl
              })
            }).catch(() => {
              // Ignore les erreurs d'email personnalisé
            });
          } catch (emailError) {
            // Ignore les erreurs d'email personnalisé
          }
        }

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
      
      // Forcer une redirection vers la page d'accueil
      window.location.href = '/';
    } catch (error) {
      console.error('Erreur inattendue lors de la déconnexion:', error);
      // En cas d'erreur, forcer quand même le nettoyage local
      localStorage.clear();
      window.location.href = '/';
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