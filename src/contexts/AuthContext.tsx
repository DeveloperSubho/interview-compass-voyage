
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  is_admin: boolean;
  tier?: string;
}

interface UserSubscription {
  tier: string;
  status: string;
  expires_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  subscription: UserSubscription | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, firstName?: string, lastName?: string, username?: string, phone?: string) => Promise<{ error: any }>;
  signIn: (emailOrUsername: string, password: string) => Promise<{ error: any }>;
  signInWithPhone: (phone: string) => Promise<{ error: any }>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInWithProvider: (provider: 'google' | 'github' | 'facebook' | 'twitter' | 'linkedin_oidc') => Promise<{ error: any }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  changePassword: (newPassword: string) => Promise<{ error: any }>;
  hasAccess: (requiredTier: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const tierLevels = {
  'Explorer': 1,
  'Voyager': 2,
  'Innovator': 3
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchSubscription = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('tier, status, expires_at')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();
      
      if (!error && data) {
        setSubscription(data);
      } else {
        // Default to Explorer if no subscription found
        setSubscription({ tier: 'Explorer', status: 'active' });
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setSubscription({ tier: 'Explorer', status: 'active' });
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
            fetchSubscription(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setSubscription(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchSubscription(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string, username?: string, phone?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
          username: username,
          phone: phone,
        }
      }
    });
    return { error };
  };

  const signIn = async (emailOrUsername: string, password: string) => {
    const isEmail = emailOrUsername.includes('@');
    
    if (isEmail) {
      const { error } = await supabase.auth.signInWithPassword({
        email: emailOrUsername,
        password,
      });
      return { error };
    } else {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', emailOrUsername)
          .maybeSingle();

        if (profileError || !profileData) {
          return { error: { message: 'Username not found' } };
        }

        // Get user email from auth.users via RPC or edge function
        // For now, we'll return an error asking user to use email
        return { error: { message: 'Please use your email address to sign in' } };
      } catch (error) {
        return { error: { message: 'Login failed. Please try again.' } };
      }
    }
  };

  const signInWithPhone = async (phone: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      phone: phone,
    });
    return { error };
  };

  const verifyPhoneOtp = async (phone: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      phone: phone,
      token: token,
      type: 'sms',
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const signInWithProvider = async (provider: 'google' | 'github' | 'facebook' | 'twitter' | 'linkedin_oidc') => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
      }
    });
    return { error };
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: { message: 'No user logged in' } };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (!error) {
        setProfile(prev => prev ? { ...prev, ...updates } : null);
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const changePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    return { error };
  };

  const hasAccess = (requiredTier: string): boolean => {
    if (!subscription) return false;
    
    const userTierLevel = tierLevels[subscription.tier as keyof typeof tierLevels] || 1;
    const requiredTierLevel = tierLevels[requiredTier as keyof typeof tierLevels] || 1;
    
    return userTierLevel >= requiredTierLevel;
  };

  const value = {
    user,
    session,
    profile,
    subscription,
    loading,
    isAdmin: profile?.is_admin || false,
    signUp,
    signIn,
    signInWithPhone,
    verifyPhoneOtp,
    signOut,
    signInWithProvider,
    updateProfile,
    changePassword,
    hasAccess,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
