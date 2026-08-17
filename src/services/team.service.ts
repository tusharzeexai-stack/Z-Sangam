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
      department: t.dept?.name || 'Engineering & Technology',
      leadName: t.lead?.full_name || 'Unassigned',
      leadAvatar: t.lead?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      membersCount: t.members?.[0]?.count || 1,
      activeProjectsCount: 2,
      completionRatePct: 92,
      status: (t.status as any) || 'Active',
      focusArea: t.focus_area || t.description || 'Enterprise platform delivery',
    }));
  }

  static async create(
    team: Partial<Team>, 
    deptId?: string,
    leadId?: string,
    orgId: string = '00000000-0000-0000-0000-000000000001'
  ): Promise<Team | null> {
    if (!isSupabaseConfigured()) return null;

    let targetDeptId = deptId;
    if (!targetDeptId && team.department) {
      const { data: dept } = await supabase
        .from('departments')
        .select('id')
        .eq('name', team.department)
        .maybeSingle();
      if (dept) targetDeptId = dept.id;
    }
    if (!targetDeptId) {
      targetDeptId = '10000000-0000-0000-0000-000000000001';
    }

    const { data, error } = await supabase
      .from('teams')
      .insert({
        organization_id: orgId,
        department_id: targetDeptId,
        team_lead_id: leadId || null,
        name: team.name,
        code: team.code || `${team.name?.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 90 + 10)}`,
        short_tag: team.shortTag || team.name?.substring(0, 2).toUpperCase() || 'TM',
        description: team.focusArea || 'Squad operational focus',
        focus_area: team.focusArea || 'Squad operational focus',
        status: (team.status as any) || 'Active',
      })
      .select(`
        *,
        dept:departments(name),
        lead:profiles!teams_team_lead_id_fkey(full_name, avatar_url)
      `)
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
      department: data.dept?.name || team.department || 'Engineering & Technology',
      leadName: data.lead?.full_name || team.leadName || 'Unassigned',
      leadAvatar: data.lead?.avatar_url || team.leadAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      membersCount: 1,
      activeProjectsCount: 0,
      completionRatePct: 100,
      status: data.status,
      focusArea: data.focus_area || '',
    };
  }

  static async update(teamId: string, updates: Partial<Team>, leadId?: string, deptId?: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;

    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.code !== undefined) payload.code = updates.code;
    if (updates.shortTag !== undefined) payload.short_tag = updates.shortTag;
    if (updates.focusArea !== undefined) {
      payload.focus_area = updates.focusArea;
      payload.description = updates.focusArea;
    }
    if (updates.status !== undefined) payload.status = updates.status;
    if (leadId !== undefined) payload.team_lead_id = leadId;
    if (deptId !== undefined) payload.department_id = deptId;

    const { error } = await supabase
      .from('teams')
      .update(payload)
      .eq('id', teamId);

    if (error) {
      console.error('Error updating team in Supabase:', error);
      throw error;
    }
    return true;
  }

  static async delete(teamId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;

    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (error) {
      console.error('Error deleting team in Supabase:', error);
      throw error;
    }
    return true;
  }
}
