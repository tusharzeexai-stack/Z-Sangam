import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User } from '../types';

export class MemberService {
  static async getAll(orgId: string = '00000000-0000-0000-0000-000000000001'): Promise<User[]> {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching members from Supabase:', error);
      return [];
    }

    return (data || []).map((p: any) => ({
      id: p.id,
      name: p.full_name || 'Specialist',
      email: p.email,
      role: (p.role as any) || 'Member',
      avatar: p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      department: p.department_name || 'Engineering & Technology',
      team: p.team_name || 'Frontend Engineering',
      status: (p.status as any) || 'Active',
      skills: p.skills || ['TypeScript', 'Architecture'],
      projectsCount: 2,
      lastActive: 'Just now',
      location: p.location || 'San Francisco, CA',
      phone: p.phone,
      bio: p.bio,
    }));
  }

  static async invite(
    member: Partial<User>, 
    orgId: string = '00000000-0000-0000-0000-000000000001'
  ): Promise<User | null> {
    if (!isSupabaseConfigured()) return null;

    const pseudoId = crypto.randomUUID();
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: pseudoId,
        organization_id: orgId,
        full_name: member.name || 'Specialist',
        email: member.email || `specialist-${Date.now()}@zsangam.enterprise`,
        role: member.role || 'Member',
        department_name: member.department || 'Engineering & Technology',
        team_name: member.team || 'Frontend Engineering',
        avatar_url: member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        status: member.status || 'Active',
        skills: member.skills || ['Enterprise Solutions'],
        location: member.location || 'San Francisco, CA',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating member in Supabase:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.full_name,
      email: data.email,
      role: data.role,
      avatar: data.avatar_url,
      department: data.department_name,
      team: data.team_name,
      status: data.status,
      skills: data.skills || [],
      projectsCount: 1,
      lastActive: 'Just now',
      location: data.location || 'San Francisco, CA',
    };
  }

  static async updateStatus(userId: string, status: 'Active' | 'Away' | 'Offline' | 'Deactivated'): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;

    const { error } = await supabase
      .from('profiles')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', userId);

    return !error;
  }

  static async update(userId: string, updates: Partial<User>): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;

    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) payload.full_name = updates.name;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.role !== undefined) payload.role = updates.role;
    if (updates.department !== undefined) payload.department_name = updates.department;
    if (updates.team !== undefined) payload.team_name = updates.team;
    if (updates.avatar !== undefined) payload.avatar_url = updates.avatar;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.skills !== undefined) payload.skills = updates.skills;
    if (updates.location !== undefined) payload.location = updates.location;

    const { error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId);

    if (error) {
      console.error('Error updating member profile in Supabase:', error);
      throw error;
    }
    return true;
  }

  static async delete(userId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting member profile in Supabase:', error);
      throw error;
    }
    return true;
  }
}
