import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Department } from '../types';

export class DepartmentService {
  static async getAll(orgId: string = '00000000-0000-0000-0000-000000000001'): Promise<Department[]> {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('departments')
      .select(`
        *,
        head:profiles!departments_head_id_fkey(full_name, avatar_url, email),
        teams:teams(count),
        projects:projects(count)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching departments from Supabase:', error);
      return [];
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      name: d.name,
      code: d.code,
      description: d.description || '',
      headName: d.head?.full_name || 'Unassigned',
      headAvatar: d.head?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      teamsCount: d.teams?.[0]?.count || 0,
      membersCount: 8,
      activeProjectsCount: d.projects?.[0]?.count || 0,
      resourceAllocationPct: 80,
      status: d.status || 'ON TRACK',
      leadEmail: d.head?.email || 'lead@zsangam.enterprise',
      accentColor: d.accent_color || '#3b82f6',
      category: d.category || 'Core Engineering',
    }));
  }

  static async create(dept: Partial<Department>, orgId: string = '00000000-0000-0000-0000-000000000001'): Promise<Department | null> {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('departments')
      .insert({
        organization_id: orgId,
        name: dept.name,
        code: dept.code,
        description: dept.description,
        status: (dept.status as any) || 'ON TRACK',
        accent_color: dept.accentColor || '#3b82f6',
        category: (dept.category as any) || 'Core Engineering',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating department in Supabase:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      code: data.code,
      description: data.description || '',
      headName: dept.headName || 'Unassigned',
      headAvatar: dept.headAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      teamsCount: 0,
      membersCount: 0,
      activeProjectsCount: 0,
      resourceAllocationPct: 60,
      status: data.status,
      leadEmail: dept.leadEmail || 'dept@zsangam.enterprise',
      accentColor: data.accent_color || '#3b82f6',
      category: data.category,
    };
  }

  static async update(id: string, updates: Partial<Department>): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;

    const { error } = await supabase
      .from('departments')
      .update({
        name: updates.name,
        code: updates.code,
        description: updates.description,
        status: updates.status as any,
        accent_color: updates.accentColor,
        category: updates.category as any,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating department:', error);
      throw error;
    }
    return true;
  }
}
