import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Team } from '../types';

export class TeamService {
  static async getAll(orgId: string = '00000000-0000-0000-0000-000000000001'): Promise<Team[]> {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        dept:departments(name),
        lead:profiles!teams_team_lead_id_fkey(full_name, avatar_url),
        members:team_members(count)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching teams from Supabase:', error);
      return [];
    }

    return (data || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      code: t.code,
      shortTag: t.short_tag,
      department: t.dept?.name || 'Engineering',
      leadName: t.lead?.full_name || 'Unassigned',
      leadAvatar: t.lead?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      membersCount: t.members?.[0]?.count || 3,
      activeProjectsCount: 2,
      completionRatePct: 92,
      status: (t.status as any) || 'Active',
      focusArea: t.focus_area || t.description || 'Enterprise platform delivery',
    }));
  }

  static async create(
    team: Partial<Team>, 
    deptId: string = '10000000-0000-0000-0000-000000000001',
    orgId: string = '00000000-0000-0000-0000-000000000001'
  ): Promise<Team | null> {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('teams')
      .insert({
        organization_id: orgId,
        department_id: deptId,
        name: team.name,
        code: team.code || `TM-${Math.floor(Math.random() * 900 + 100)}`,
        short_tag: team.shortTag || 'TM',
        description: team.focusArea,
        focus_area: team.focusArea,
        status: (team.status as any) || 'Active',
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
      department: team.department || 'Engineering',
      leadName: team.leadName || 'Unassigned',
      leadAvatar: team.leadAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      membersCount: 1,
      activeProjectsCount: 0,
      completionRatePct: 100,
      status: data.status,
      focusArea: data.focus_area || '',
    };
  }
}
