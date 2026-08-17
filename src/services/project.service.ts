import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Project } from '../types';

export class ProjectService {

  /** Fetch all projects with their teams and members from Supabase */
  static async getAll(): Promise<Project[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      // Fetch projects with nested relations
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) {
        console.error('Error fetching projects from Supabase:', projectsError);
        return [];
      }

      // Fetch project_teams with team details
      const { data: ptData } = await supabase
        .from('project_teams')
        .select('project_id, teams(id, name)');

      // Fetch project_members with profile details
      const { data: pmData } = await supabase
        .from('project_members')
        .select('project_id, user_id, role, profiles(id, name, avatar_url, role)');

      // Fetch project_milestones
      const { data: msData } = await supabase
        .from('project_milestones')
        .select('*')
        .order('position', { ascending: true });

      // Index relations by project_id
      const teamsByProject: Record<string, string[]> = {};
      for (const pt of (ptData || [])) {
        const pid = pt.project_id;
        const teamName = (pt as any).teams?.name;
        if (!teamName) continue;
        if (!teamsByProject[pid]) teamsByProject[pid] = [];
        teamsByProject[pid].push(teamName);
      }

      const membersByProject: Record<string, Array<{id: string; name: string; avatar: string; role: string}>> = {};
      for (const pm of (pmData || [])) {
        const pid = pm.project_id;
        const profile = (pm as any).profiles;
        if (!profile) continue;
        if (!membersByProject[pid]) membersByProject[pid] = [];
        membersByProject[pid].push({
          id: profile.id,
          name: profile.name || 'Team Member',
          avatar: profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          role: pm.role || profile.role || 'Contributor',
        });
      }

      const milestonesByProject: Record<string, any[]> = {};
      for (const ms of (msData || [])) {
        const pid = ms.project_id;
        if (!milestonesByProject[pid]) milestonesByProject[pid] = [];
        milestonesByProject[pid].push({
          id: ms.id,
          title: ms.name,
          targetDate: ms.due_date || '2026-12-31',
          status: ms.status === 'completed' ? 'Completed' : ms.status === 'in_progress' ? 'In Progress' : 'Pending',
          completionDate: ms.completion_date || undefined,
        });
      }

      return (projectsData || []).map((p: any) => ({
        id: p.id,
        code: p.project_code || 'PROJ-01',
        name: p.name,
        description: p.description || '',
        status: (
          p.status === 'in_progress' ? 'In Progress' :
          p.status === 'planning'    ? 'Planning' :
          p.status === 'completed'   ? 'Completed' :
          p.status === 'on_hold'     ? 'On Hold' : 'In Progress'
        ) as any,
        priority: (p.priority ? p.priority.charAt(0).toUpperCase() + p.priority.slice(1) : 'High') as any,
        department: p.department || 'Engineering',
        teams:    teamsByProject[p.id]    || [],
        members:  membersByProject[p.id]  || [],
        milestones: milestonesByProject[p.id] || [],
        leadName:   p.lead_name   || 'Enterprise Lead',
        leadAvatar: p.lead_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        progressPct: p.progress || 0,
        startDate:   p.start_date || new Date().toISOString().split('T')[0],
        targetEndDate: p.end_date || '2026-12-31',
        completedTasks: 0,
        totalTasks: 0,
        tags: p.tags || [],
        blockersCount: 0,
        commits7dCount: 0,
        sprintPhaseRemainingDays: 30,
      }));
    } catch (err) {
      console.error('ProjectService.getAll exception:', err);
      return [];
    }
  }

  /** Create a new project in Supabase */
  static async create(project: Partial<Project>): Promise<Project | null> {
    if (!isSupabaseConfigured()) return null;

    const newId = crypto.randomUUID();
    const code = project.code || `PRJ-${Math.floor(100 + Math.random() * 900)}`;

    const dbStatus =
      project.status === 'In Progress' ? 'in_progress' :
      project.status === 'Planning'    ? 'planning' :
      project.status === 'Completed'   ? 'completed' :
      project.status === 'On Hold'     ? 'on_hold' : 'in_progress';

    const dbPriority = project.priority ? project.priority.toLowerCase() : 'high';

    const { data, error } = await supabase
      .from('projects')
      .insert({
        id: newId,
        organization_id: '00000000-0000-0000-0000-000000000001',
        name: project.name,
        project_code: code,
        description: project.description || '',
        status: dbStatus as any,
        priority: dbPriority as any,
        progress: project.progressPct || 0,
        start_date: project.startDate || new Date().toISOString().split('T')[0],
        end_date: project.targetEndDate || '2026-12-31',
        tags: project.tags || [],
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project in Supabase:', error);
      throw error;
    }

    return {
      id: data.id,
      code: data.project_code,
      name: data.name,
      description: data.description || '',
      status: (data.status === 'in_progress' ? 'In Progress' : data.status === 'planning' ? 'Planning' : data.status === 'completed' ? 'Completed' : 'In Progress') as any,
      priority: project.priority || 'High',
      department: project.department || 'Engineering',
      teams: [],
      members: [],
      milestones: [],
      leadName: project.leadName || 'Enterprise Lead',
      leadAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      progressPct: data.progress || 0,
      startDate: data.start_date,
      targetEndDate: data.end_date,
      completedTasks: 0,
      totalTasks: 0,
      tags: data.tags || [],
      blockersCount: 0,
      commits7dCount: 0,
      sprintPhaseRemainingDays: 30,
    };
  }

  /** Assign a team (by name) to a project in project_teams */
  static async assignTeam(projectId: string, teamName: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      // Look up team id by name
      const { data: teamRow, error: tErr } = await supabase
        .from('teams')
        .select('id')
        .eq('name', teamName)
        .maybeSingle();

      if (tErr || !teamRow) {
        console.error('assignTeam: team not found:', teamName, tErr);
        return false;
      }

      const { error } = await supabase
        .from('project_teams')
        .upsert({ project_id: projectId, team_id: teamRow.id }, { onConflict: 'project_id,team_id' });

      if (error) {
        console.error('assignTeam upsert error:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('assignTeam exception:', err);
      return false;
    }
  }

  /** Remove a team assignment from a project */
  static async removeTeam(projectId: string, teamName: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const { data: teamRow } = await supabase
        .from('teams')
        .select('id')
        .eq('name', teamName)
        .maybeSingle();

      if (!teamRow) return false;

      await supabase
        .from('project_teams')
        .delete()
        .eq('project_id', projectId)
        .eq('team_id', teamRow.id);

      return true;
    } catch (err) {
      console.error('removeTeam exception:', err);
      return false;
    }
  }

  /** Assign a member (by user_id) to a project in project_members */
  static async assignMember(projectId: string, userId: string, role: string = 'Contributor'): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase
        .from('project_members')
        .upsert({ project_id: projectId, user_id: userId, role }, { onConflict: 'project_id,user_id' });

      if (error) {
        console.error('assignMember upsert error:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('assignMember exception:', err);
      return false;
    }
  }

  /** Remove a member from a project */
  static async removeMember(projectId: string, userId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      await supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId);
      return true;
    } catch (err) {
      console.error('removeMember exception:', err);
      return false;
    }
  }

  /** Update core project fields (not teams/members - those use dedicated methods) */
  static async update(id: string, updates: Partial<Project>): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;

    const dbUpdates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.status) {
      dbUpdates.status =
        updates.status === 'In Progress' ? 'in_progress' :
        updates.status === 'Planning'    ? 'planning' :
        updates.status === 'Completed'   ? 'completed' : 'on_hold';
    }
    if (updates.priority) dbUpdates.priority = updates.priority.toLowerCase();
    if (updates.progressPct !== undefined) dbUpdates.progress = updates.progressPct;
    if (updates.targetEndDate) dbUpdates.end_date = updates.targetEndDate;

    const { error } = await supabase.from('projects').update(dbUpdates).eq('id', id);
    if (error) {
      console.error('Error updating project:', error);
      return false;
    }
    return true;
  }

  static async updateStatus(id: string, status: Project['status']): Promise<boolean> {
    return this.update(id, { status });
  }
}
