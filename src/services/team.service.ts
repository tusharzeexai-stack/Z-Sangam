import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Team } from '../types';

export class TeamService {
  static async getAll(): Promise<Team[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching teams from Supabase:', error);
        return [];
      }

      return (data || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        code: t.code,
        shortTag: t.short_tag || t.name.substring(0, 2).toUpperCase(),
        department: t.department_name || 'Engineering & Technology',
        leadName: t.lead_name || 'Unassigned',
        leadAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        membersCount: t.members_count || 0,
        activeProjectsCount: t.active_projects_count || 0,
        completionRatePct: t.completion_rate_pct || 0,
        status: (t.status as any) || 'Active',
        focusArea: t.focus_area || t.description || 'Enterprise execution squad',
      }));
    } catch (err) {
      console.error('TeamService.getAll exception:', err);
      return [];
    }
  }

  static async create(
    team: Partial<Team>, 
    deptId?: string,
    leadId?: string
  ): Promise<Team | null> {
    if (!isSupabaseConfigured()) return null;

    const newId = crypto.randomUUID();
    const { data, error } = await supabase
      .from('teams')
      .insert({
        id: newId,
        organization_id: '00000000-0000-0000-0000-000000000001',
        department_id: deptId || null,
        name: team.name,
        code: team.code || `TM-${team.name?.substring(0, 3).toUpperCase()}`,
        short_tag: team.shortTag || team.name?.substring(0, 2).toUpperCase(),
        description: team.focusArea || '',
        focus_area: team.focusArea || '',
        status: team.status || 'Active',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating team in Supabase:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      code: data.code,
      shortTag: data.short_tag,
      department: team.department || 'Engineering & Technology',
      leadName: team.leadName || 'Unassigned',
      leadAvatar: team.leadAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      membersCount: 1,
      activeProjectsCount: 0,
      completionRatePct: 100,
      status: data.status || 'Active',
      focusArea: data.focus_area || '',
    };
  }

  static async update(id: string, updates: Partial<Team>, leadId?: string, deptId?: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;

    const { error } = await supabase
      .from('teams')
      .update({
        name: updates.name,
        code: updates.code,
        short_tag: updates.shortTag,
        description: updates.focusArea,
        focus_area: updates.focusArea,
        status: updates.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating team:', error);
      throw error;
    }
    return true;
  }

  static async delete(id: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;

    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting team:', error);
      throw error;
    }
    return true;
  }
}
