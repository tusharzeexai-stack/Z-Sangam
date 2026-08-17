import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Task } from '../types';

export class TaskService {
  static async getAll(orgId: string = '00000000-0000-0000-0000-000000000001'): Promise<Task[]> {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        project:projects(name, project_code, department:departments(name)),
        assignee:profiles!tasks_assigned_to_fkey(full_name, avatar_url, team_name)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks from Supabase:', error);
      return [];
    }

    return (data || []).map((t: any) => ({
      id: t.id,
      title: t.title,
      projectCode: t.project?.project_code || 'ZS-PROJ-01',
      projectName: t.project?.name || 'Enterprise Project',
      department: t.project?.department?.name || 'Engineering',
      team: t.assignee?.team_name || 'Backend Systems',
      assigneeName: t.assignee?.full_name || 'Unassigned',
      assigneeAvatar: t.assignee?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      priority: (t.priority === 'high' ? 'High' : t.priority === 'low' ? 'Low' : 'Medium') as any,
      status: (t.status === 'completed' ? 'Completed' : t.status === 'in_progress' ? 'In Progress' : t.status === 'review' ? 'Review' : 'To Do') as any,
      dueDate: t.due_date || 'Sep 15, 2023',
      estimatedHours: Number(t.estimated_hours || 8),
      tags: t.tags || ['Platform', 'Core'],
    }));
  }

  static async create(
    task: Partial<Task>, 
    projectId?: string,
    orgId: string = '00000000-0000-0000-0000-000000000001'
  ): Promise<Task | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          organization_id: orgId,
          project_id: projectId || '00000000-0000-0000-0000-000000000001',
          title: task.title || 'New Task Assignment',
          description: `Work item for project ${task.projectName || ''}`,
          status: 'todo',
          priority: (task.priority?.toLowerCase() as any) || 'medium',
          due_date: new Date().toISOString().split('T')[0],
          estimated_hours: task.estimatedHours || 8,
          tags: task.tags || ['Task'],
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title,
        projectCode: task.projectCode || 'ZS-PROJ',
        projectName: task.projectName || 'Enterprise Initiative',
        department: task.department || 'Engineering',
        team: task.team || 'Backend Systems',
        assigneeName: task.assigneeName || 'Specialist',
        assigneeAvatar: task.assigneeAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        priority: task.priority || 'Medium',
        status: 'To Do',
        dueDate: data.due_date || 'Soon',
        estimatedHours: Number(data.estimated_hours || 8),
        tags: data.tags || ['Task'],
      };
    } catch (err) {
      console.error('Error creating task in Supabase:', err);
      throw err;
    }
  }

  static async updateStatus(
    taskId: string, 
    status: Task['status']
  ): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;

    const mappedStatus = status === 'Completed' ? 'completed' : status === 'In Progress' ? 'in_progress' : status === 'Review' ? 'review' : 'todo';
    
    const { error } = await supabase
      .from('tasks')
      .update({
        status: mappedStatus,
        completed_at: status === 'Completed' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId);

    return !error;
  }
}
