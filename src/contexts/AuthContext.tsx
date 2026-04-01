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

export interface MemberInfo {
  member_id: string;
  member_first_name: string;
  member_last_name: string | null;
  member_photo_url: string | null;
  member_role_name: string;
  member_permissions: Record<string, any>;
  company_id: string;
  company_name: string;
  company_logo_url: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  userRole: UserRole | null;
  memberInfo: MemberInfo | null;
  isEmployee: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any; isAdmin?: boolean }>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: any; needsConfirmation?: boolean; user?: User }>;
  signOut: () => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
  setMemberInfo: (info: MemberInfo | null) => void;
  hasPermission: (module: string, action?: string) => boolean;
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
  const [memberInfo, setMemberInfoState] = useState<MemberInfo | null>(() => {
    try {
      const stored = localStorage.getItem('stocknix_member');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  const isAdmin = userRole?.role === 'admin';
  const isEmployee = !!memberInfo;

  const setMemberInfo = (info: MemberInfo | null) => {
    setMemberInfoState(info);
    if (info) {
      localStorage.setItem('stocknix_member', JSON.stringify(info));
    } else {
      localStorage.removeItem('stocknix_member');
    }
  };

  const hasPermission = (module: string, action: string = 'read'): boolean => {
    // Admin owner has all permissions
    if (!isEmployee) return true;
    if (!memberInfo?.member_permissions) return false;
    const perms = memberInfo.member_permissions;
    // Check for "all" permission (Manager role) — but respect explicit false
    if (perms.all === true) {
      if (module === 'settings') return false;
      return true;
    }
    // CRM permission hierarchy: customers includes customers_basic and customers_minimal
    if (module === 'customers_basic' || module === 'customers_minimal') {
      if (perms.customers === true) return true;
    }
    if (module === 'customers_minimal') {
      if (perms.customers_basic === true) return true;
    }
    // Check module-level boolean (legacy format: { pos: true })
    if (perms[module] === true) return true;
    // Check array format: { stock: ["read", "create"] }
    if (Array.isArray(perms[module])) {
      return perms[module].includes(action);
    }
    return false;
  };

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

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to avoid Supabase deadlock on auth state change
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
          
          // Don't auto-redirect from onAuthStateChange — let the login/signup handlers do it
          // This prevents race conditions and double navigations
        } else {
          setProfile(null);
          setUserRole(null);
          setMemberInfo(null);
        }
        
        setLoading(false);
      }
    );

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
    
    if (data?.user && !data.user.email_confirmed_at) {
      return { 
        error: new Error('Votre compte n\'est pas encore confirmé. Vérifiez votre email pour le lien de confirmation.') 
      };
    }
    
    if (data?.user && !error) {
      // Fetch role to determine redirect target
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .maybeSingle();
      
      localStorage.setItem('theme', 'light');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      
      // Return redirect target instead of navigating here
      const isAdminUser = roleData?.role === 'admin';
      return { error: null, isAdmin: isAdminUser };
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      const confirmationUrl = `${window.location.origin}/auth/confirm`;
      
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
        const needsConfirmation = !data.user.email_confirmed_at;
        console.log('✅ Inscription réussie pour:', email, needsConfirmation ? '(confirmation requise)' : '(compte actif)');
        return { error: null, needsConfirmation, user: data.user };
      }
      
      return { error: new Error('Aucun utilisateur créé'), needsConfirmation: false };
    } catch (err: any) {
      console.error('Erreur inattendue lors de l\'inscription:', err);
      return { error: err, needsConfirmation: false };
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      setSession(null);
      setProfile(null);
      setUserRole(null);
      setMemberInfo(null);
      
      const { error } = await supabase.auth.signOut();
      if (error) console.error('Erreur lors de la déconnexion:', error);
      
      window.location.href = '/auth';
    } catch (error) {
      console.error('Erreur inattendue lors de la déconnexion:', error);
      localStorage.clear();
      window.location.href = '/auth';
    }
  };

  const value = {
    user,
    session,
    profile,
    userRole,
    memberInfo,
    isEmployee,
    signIn,
    signUp,
    signOut,
    loading,
    isAdmin,
    refreshProfile,
    setMemberInfo,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
