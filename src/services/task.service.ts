import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Task } from '../types';

export class TaskService {
  static async getAll(orgId: string = '00000000-0000-0000-0000-000000000001'): Promise<Task[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      // Simple query without complex joins that may not exist
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks from Supabase:', error);
        return [];
      }

      return (data || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        projectCode: 'ZS-PROJ',
        projectName: 'Enterprise Project',
        department: 'Engineering',
        team: 'Backend Systems',
        assigneeName: 'Unassigned',
        assigneeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        priority: (t.priority === 'high' ? 'High' : t.priority === 'low' ? 'Low' : 'Medium') as any,
        status: (
          t.status === 'completed' ? 'Completed' :
          t.status === 'in_progress' ? 'In Progress' :
          t.status === 'review' ? 'Review' : 'To Do'
        ) as any,
        dueDate: t.due_date || new Date().toISOString().split('T')[0],
        estimatedHours: Number(t.estimated_hours || 8),
        tags: t.tags || [],
      }));
    } catch (err) {
      console.error('TaskService.getAll exception:', err);
      return [];
    }
  }

  static async create(
    task: Partial<Task>,
    projectId?: string,
    orgId: string = '00000000-0000-0000-0000-000000000001'
  ): Promise<Task | null> {
    if (!isSupabaseConfigured()) return null;

    // We need a valid project_id; if none provided, skip Supabase save
    if (!projectId) {
      console.warn('TaskService.create: no projectId provided, skipping Supabase insert');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          organization_id: orgId,
          project_id: projectId,
          title: task.title || 'New Task Assignment',
          description: `Work item assigned via Z-Sangam Enterprise`,
          status: 'todo',
          priority: (task.priority?.toLowerCase() as any) || 'medium',
          due_date: task.dueDate || new Date().toISOString().split('T')[0],
          estimated_hours: task.estimatedHours || 8,
          tags: task.tags || [],
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
        dueDate: data.due_date || new Date().toISOString().split('T')[0],
        estimatedHours: Number(data.estimated_hours || 8),
        tags: data.tags || [],
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

    const mappedStatus =
      status === 'Completed' ? 'completed' :
      status === 'In Progress' ? 'in_progress' :
      status === 'Review' ? 'review' : 'todo';

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
