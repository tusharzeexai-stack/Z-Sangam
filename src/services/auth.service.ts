import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User } from '../types';

export interface AuthSessionUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  role: string;
  organizationId?: string;
}

export class AuthService {
  /**
   * Signs in a user with corporate email and password via Supabase Auth.
   */
  static async signIn(email: string, pass: string): Promise<{ user: User | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      // In offline/demo mode, return demo response
      return { user: null, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user data returned from authentication.');

      // Fetch profile from profiles table
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileErr && profileErr.code !== 'PGRST116') {
        console.warn('Profile fetch warning:', profileErr.message);
      }

      const mappedUser: User = {
        id: data.user.id,
        name: profile?.full_name || data.user.user_metadata?.full_name || email.split('@')[0],
        email: data.user.email || email,
        role: (profile?.role as any) || 'Super Admin',
        avatar: profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        department: profile?.department_name || 'Engineering',
        team: profile?.team_name || 'Frontend Engineering',
        status: (profile?.status as any) || 'Active',
        skills: profile?.skills || ['Enterprise Architecture', 'Leadership', 'TypeScript'],
        projectsCount: 3,
        lastActive: 'Just now',
        location: profile?.location || 'San Francisco, CA',
        phone: profile?.phone || '+1 (555) 234-5678',
        bio: profile?.bio || 'Enterprise Administrator',
      };

      return { user: mappedUser, error: null };
    } catch (err: any) {
      console.error('Supabase Auth error:', err);
      return { user: null, error: err };
    }
  }

  /**
   * Signs up a new user and provisions their profile record.
   */
  static async signUp(
    email: string, 
    pass: string, 
    fullName: string, 
    orgId?: string
  ): Promise<{ user: User | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { user: null, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            full_name: fullName,
            organization_id: orgId || '00000000-0000-0000-0000-000000000001',
          },
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error('Sign up failed: no user returned.');

      // Insert profile if trigger doesn't exist
      await supabase.from('profiles').upsert({
        id: data.user.id,
        organization_id: orgId || '00000000-0000-0000-0000-000000000001',
        full_name: fullName,
        email: email,
        role: 'member',
        status: 'Active',
      });

      const mappedUser: User = {
        id: data.user.id,
        name: fullName,
        email: email,
        role: 'Member',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        department: 'Engineering',
        team: 'Frontend Engineering',
        status: 'Active',
        skills: ['Software Engineering'],
        projectsCount: 0,
        lastActive: 'Just now',
        location: 'Headquarters',
      };

      return { user: mappedUser, error: null };
    } catch (err: any) {
      return { user: null, error: err };
    }
  }

  /**
   * Signs out current user and clears session tokens.
   */
  static async signOut(): Promise<void> {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
  }

  /**
   * Sends password reset email.
   */
  static async resetPassword(email: string): Promise<{ success: boolean; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { success: true, error: null };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err };
    }
  }
}
