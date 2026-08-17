import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Team } from '../types';
import { DepartmentService } from './department.service';

export class TeamService {
  static async getAll(): Promise<Team[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      // Join with departments to get department_name
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          departments(id, name)
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
        shortTag: t.short_tag || t.name.substring(0, 2).toUpperCase(),
        department: t.departments?.name || t.department_name || 'Unassigned',
        teamLeadId: t.team_lead_id || undefined,
        leadName: 'Unassigned',
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

    let finalDeptId = deptId;
    if (!finalDeptId && team.department) {
      finalDeptId = await DepartmentService.getOrCreateByName(team.department);
    }

    const newId = crypto.randomUUID();
    const { data, error } = await supabase
      .from('teams')
      .insert({
        id: newId,
        organization_id: '00000000-0000-0000-0000-000000000001',
        department_id: finalDeptId || null,
        team_lead_id: leadId || null,
        name: team.name,
        code: team.code || `TM-${team.name?.substring(0, 3).toUpperCase()}`,
        short_tag: team.shortTag || team.name?.substring(0, 2).toUpperCase(),
        description: team.focusArea || '',
        focus_area: team.focusArea || '',
        status: team.status || 'Active',
      })
      .select(`*, departments(id, name)`)
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
      department: (data as any).departments?.name || team.department || 'Unassigned',
      teamLeadId: data.team_lead_id || leadId || undefined,
      leadName: team.leadName || 'Unassigned',
      leadAvatar: team.leadAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      membersCount: 0,
      activeProjectsCount: 0,
      completionRatePct: 0,
      status: data.status || 'Active',
      focusArea: data.focus_area || '',
    };
  }

  static async update(id: string, updates: Partial<Team>, deptId?: string, leadId?: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;

    let finalDeptId = deptId;
    if (!finalDeptId && updates.department) {
      finalDeptId = await DepartmentService.getOrCreateByName(updates.department);
    }

    const dbUpdates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.code !== undefined) dbUpdates.code = updates.code;
    if (updates.shortTag !== undefined) dbUpdates.short_tag = updates.shortTag;
    if (updates.focusArea !== undefined) {
      dbUpdates.description = updates.focusArea;
      dbUpdates.focus_area = updates.focusArea;
    }
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (finalDeptId) dbUpdates.department_id = finalDeptId;
    if (leadId !== undefined) dbUpdates.team_lead_id = leadId || null;

    const { error } = await supabase
      .from('teams')
      .update(dbUpdates)
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
