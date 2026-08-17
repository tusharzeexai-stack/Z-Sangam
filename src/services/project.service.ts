import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Project } from '../types';

export class ProjectService {
  static async getAll(): Promise<Project[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects from Supabase:', error);
        return [];
      }

      return (data || []).map((p: any) => ({
        id: p.id,
        code: p.project_code || 'PROJ-01',
        name: p.name,
        description: p.description || '',
        status: (
          p.status === 'in_progress' ? 'In Progress' :
          p.status === 'planning' ? 'Planning' :
          p.status === 'completed' ? 'Completed' :
          p.status === 'on_hold' ? 'On Hold' : 'In Progress'
        ) as any,
        priority: (p.priority ? p.priority.charAt(0).toUpperCase() + p.priority.slice(1) : 'High') as any,
        department: 'Engineering',
        teams: [],
        leadName: 'Enterprise Lead',
        leadAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        members: [],
        progressPct: p.progress || 0,
        startDate: p.start_date || new Date().toISOString().split('T')[0],
        targetEndDate: p.end_date || '2026-12-31',
        completedTasks: 0,
        totalTasks: 0,
        tags: p.tags || [],
        blockersCount: 0,
        commits7dCount: 0,
        sprintPhaseRemainingDays: 30,
        milestones: [],
      }));
    } catch (err) {
      console.error('ProjectService.getAll exception:', err);
      return [];
    }
  }

  static async create(project: Partial<Project>): Promise<Project | null> {
    if (!isSupabaseConfigured()) return null;

    const newId = crypto.randomUUID();
    const code = project.code || `PRJ-${Math.floor(100 + Math.random() * 900)}`;

    // Map status to DB enum values
    const dbStatus =
      project.status === 'In Progress' ? 'in_progress' :
      project.status === 'Planning' ? 'planning' :
      project.status === 'Completed' ? 'completed' :
      project.status === 'On Hold' ? 'on_hold' : 'in_progress';

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
        progress: project.progressPct || 0,         // DB column name is "progress"
        start_date: project.startDate || new Date().toISOString().split('T')[0],
        end_date: project.targetEndDate || '2026-12-31',  // DB column name is "end_date"
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
      teams: project.teams || [],
      leadName: project.leadName || 'Enterprise Lead',
      leadAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      members: project.members || [],
      progressPct: data.progress || 0,
      startDate: data.start_date,
      targetEndDate: data.end_date,
      completedTasks: 0,
      totalTasks: 0,
      tags: data.tags || [],
      blockersCount: 0,
      commits7dCount: 0,
      sprintPhaseRemainingDays: 30,
      milestones: [],
    };
  }

  static async update(id: string, updates: Partial<Project>): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;

    const dbUpdates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.status) {
      dbUpdates.status =
        updates.status === 'In Progress' ? 'in_progress' :
        updates.status === 'Planning' ? 'planning' :
        updates.status === 'Completed' ? 'completed' : 'on_hold';
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
