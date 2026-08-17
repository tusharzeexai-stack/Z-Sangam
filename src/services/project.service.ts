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
        status: (p.status === 'in_progress' ? 'In Progress' : p.status === 'planning' ? 'Planning' : p.status === 'completed' ? 'Completed' : 'On Hold') as any,
        priority: (p.priority ? p.priority.charAt(0).toUpperCase() + p.priority.slice(1) : 'High') as any,
        department: p.department_name || 'Engineering & Technology',
        teams: p.teams || ['Frontend Engineering', 'Backend Systems'],
        leadName: p.lead_name || 'Enterprise Lead',
        leadAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        members: [],
        progressPct: p.progress_pct || 65,
        startDate: p.start_date || '2026-01-01',
        targetEndDate: p.due_date || '2026-12-31',
        budget: p.budget || '$120,000',
        spent: '$45,000',
        riskLevel: (p.risk_level?.toUpperCase() as any) || 'LOW',
        tasksCount: 12,
        completedTasksCount: 8,
        milestones: []
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

    const { data, error } = await supabase
      .from('projects')
      .insert({
        id: newId,
        organization_id: '00000000-0000-0000-0000-000000000001',
        name: project.name,
        project_code: code,
        description: project.description || '',
        status: (project.status === 'In Progress' ? 'in_progress' : project.status === 'Planning' ? 'planning' : project.status === 'Completed' ? 'completed' : 'in_progress') as any,
        priority: (project.priority ? project.priority.toLowerCase() : 'high') as any,
        budget: project.budget || '$100,000',
        progress_pct: project.progressPct || 0,
        start_date: project.startDate || new Date().toISOString().split('T')[0],
        due_date: project.targetEndDate || '2026-12-31',
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
      status: (data.status === 'in_progress' ? 'In Progress' : data.status === 'planning' ? 'Planning' : 'In Progress') as any,
      priority: project.priority || 'High',
      department: project.department || 'Engineering',
      teams: project.teams || ['Frontend Engineering'],
      leadName: project.leadName || 'Enterprise Lead',
      leadAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      members: project.members || [],
      progressPct: data.progress_pct || 0,
      startDate: data.start_date,
      targetEndDate: data.due_date,
      budget: data.budget || '$100,000',
      spent: '$0',
      riskLevel: 'LOW',
      tasksCount: 0,
      completedTasksCount: 0,
      milestones: []
    };
  }

  static async updateStatus(id: string, status: Project['status']): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;

    const mappedStatus = status === 'In Progress' ? 'in_progress' : status === 'Planning' ? 'planning' : status === 'Completed' ? 'completed' : 'on_hold';

    const { error } = await supabase
      .from('projects')
      .update({
        status: mappedStatus as any,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating project status:', error);
      throw error;
    }
    return true;
  }
}
