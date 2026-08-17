import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Project } from '../types';

export class ProjectService {
  static async getAll(orgId: string = '00000000-0000-0000-0000-000000000001'): Promise<Project[]> {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        dept:departments(name),
        lead:profiles!projects_project_lead_id_fkey(id, full_name, avatar_url, role),
        project_members:project_members(
          user:profiles(id, full_name, avatar_url, role)
        ),
        project_teams:project_teams(
          team:teams(name)
        ),
        tasks:tasks(count),
        completed_tasks:tasks(count),
        milestones:project_milestones(*)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects from Supabase:', error);
      return [];
    }

    return (data || []).map((p: any) => {
      const membersList = (p.project_members || []).map((pm: any) => ({
        id: pm.user?.id || 'usr-1',
        name: pm.user?.full_name || 'Team Member',
        avatar: pm.user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: pm.user?.role || 'Contributor',
      }));

      const teamsList = (p.project_teams || []).map((pt: any) => pt.team?.name || 'Frontend Engineering');

      const milestonesList = (p.milestones || []).map((m: any) => ({
        id: m.id,
        title: m.name,
        targetDate: m.due_date,
        status: (m.status === 'completed' ? 'Completed' : m.status === 'in_progress' ? 'In Progress' : 'Pending') as any,
        completionDate: m.completion_date,
      }));

      return {
        id: p.id,
        code: p.project_code,
        name: p.name,
        description: p.description || '',
        status: (p.status === 'in_progress' ? 'In Progress' : p.status === 'planning' ? 'Planning' : p.status === 'completed' ? 'Completed' : 'On Hold') as any,
        priority: (p.priority ? p.priority.charAt(0).toUpperCase() + p.priority.slice(1) : 'High') as any,
        department: p.dept?.name || 'Engineering',
        teams: teamsList.length > 0 ? teamsList : ['Frontend Engineering', 'Backend Systems'],
        leadName: p.lead?.full_name || 'Enterprise Lead',
        leadAvatar: p.lead?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        members: membersList.length > 0 ? membersList : [
          { id: 'usr-1', name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', role: 'Lead Architect' }
        ],
        startDate: p.start_date || 'Aug 20, 2023',
        targetEndDate: p.end_date || 'Nov 30, 2023',
        progressPct: p.progress || 0,
        completedTasks: 4,
        totalTasks: 12,
        tags: p.tags || ['Enterprise', 'Q3_Initiative'],
        blockersCount: 0,
        commits7dCount: 18,
        sprintPhaseRemainingDays: 24,
        milestones: milestonesList.length > 0 ? milestonesList : [
          { id: `m-${p.id}-1`, title: 'Core Architecture Freeze', targetDate: 'Sep 01, 2023', status: 'Completed' },
          { id: `m-${p.id}-2`, title: 'Production Security Gate', targetDate: 'Oct 15, 2023', status: 'In Progress' },
        ],
      };
    });
  }

  static async create(
    projectData: Partial<Project>,
    orgId: string = '00000000-0000-0000-0000-000000000001',
    deptId?: string
  ): Promise<Project | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      // 1. Insert Project into public.projects
      const { data: proj, error } = await supabase
        .from('projects')
        .insert({
          organization_id: orgId,
          name: projectData.name || 'Untitled Enterprise Initiative',
          project_code: projectData.code || `ZS-PROJ-${Math.floor(Math.random() * 900 + 100)}`,
          description: projectData.description || 'Synchronized enterprise initiative.',
          status: 'in_progress',
          priority: (projectData.priority?.toLowerCase() as any) || 'high',
          department_id: deptId || '10000000-0000-0000-0000-000000000001',
          progress: projectData.progressPct || 0,
          tags: projectData.tags || ['Enterprise'],
        })
        .select()
        .single();

      if (error) throw error;

      // 2. Insert milestones if present
      if (projectData.milestones && projectData.milestones.length > 0) {
        const msRows = projectData.milestones.map((m, idx) => ({
          project_id: proj.id,
          name: m.title,
          status: (m.status === 'Completed' ? 'completed' : m.status === 'In Progress' ? 'in_progress' : 'pending'),
          due_date: new Date().toISOString().split('T')[0],
          position: idx,
        }));
        await supabase.from('project_milestones').insert(msRows as any);
      }

      // 3. Log Activity
      await supabase.from('activity_logs').insert({
        organization_id: orgId,
        action: 'created a new project',
        entity_type: 'project',
        entity_id: proj.id,
        metadata: { project_code: proj.project_code, name: proj.name },
      });

      return {
        id: proj.id,
        code: proj.project_code,
        name: proj.name,
        description: proj.description,
        status: 'In Progress',
        priority: projectData.priority || 'High',
        department: projectData.department || 'Engineering',
        teams: projectData.teams || ['Frontend Engineering'],
        leadName: projectData.leadName || 'Enterprise Lead',
        leadAvatar: projectData.leadAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        members: projectData.members || [],
        startDate: proj.start_date || 'Today',
        targetEndDate: proj.end_date || 'Nov 30, 2023',
        progressPct: proj.progress || 0,
        completedTasks: 0,
        totalTasks: 10,
        tags: proj.tags || [],
        blockersCount: 0,
        commits7dCount: 0,
        sprintPhaseRemainingDays: 30,
        milestones: projectData.milestones || [],
      };
    } catch (err) {
      console.error('Error in ProjectService.create:', err);
      throw err;
    }
  }

  static async update(id: string, updates: Partial<Project>): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;

    const { error } = await supabase
      .from('projects')
      .update({
        name: updates.name,
        description: updates.description,
        status: updates.status ? (updates.status.toLowerCase().replace(' ', '_') as any) : undefined,
        priority: updates.priority ? (updates.priority.toLowerCase() as any) : undefined,
        progress: updates.progressPct,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    return !error;
  }
}
