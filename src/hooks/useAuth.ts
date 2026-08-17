import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AuthService } from '../services/auth.service';
import { User } from '../types';
import { CURRENT_USER } from '../data/mockData';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(CURRENT_USER);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  // Initialize session listener on mount
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      if (!isSupabaseConfigured()) {
        setUser(CURRENT_USER);
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const mappedUser: User = {
            id: session.user.id,
            name: profile?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            role: (profile?.role as any) || 'Super Admin',
            avatar: profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            department: profile?.department_name || 'Engineering',
            team: profile?.team_name || 'Frontend Engineering',
            status: 'Active',
            skills: profile?.skills || ['Enterprise Solutions'],
            projectsCount: 3,
            lastActive: 'Just now',
            location: profile?.location || 'Headquarters',
          };

          setUser(mappedUser);
          setIsAuthenticated(true);
        } else if (isMounted) {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth state changes if Supabase is configured
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, pass?: string) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured() && pass) {
        const { user: authedUser, error } = await AuthService.signIn(email, pass);
        if (error) throw error;
        if (authedUser) {
          setUser(authedUser);
          setIsAuthenticated(true);
          return true;
        }
      }
      // Demo / fallback login
      setUser({
        ...CURRENT_USER,
        email: email || CURRENT_USER.email,
        name: email.includes('admin') ? 'Enterprise Super Admin' : CURRENT_USER.name,
      });
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await AuthService.signOut();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return {
    user,
    setUser,
    loading,
    isAuthenticated,
    login,
    logout,
  };
};
