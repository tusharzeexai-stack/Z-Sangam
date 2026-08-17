import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface OrganizationData {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
}

export interface DashboardMetrics {
  totalProjects: number;
  activeProjects: number;
  totalDepartments: number;
  totalTeams: number;
  totalMembers: number;
  totalTasks: number;
  completedTasks: number;
  avgProgress: number;
}

export class OrganizationService {
  static async getOrganization(orgId: string = '00000000-0000-0000-0000-000000000001'): Promise<OrganizationData | null> {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single();

    if (error) {
      console.warn('Error fetching organization:', error.message);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      logoUrl: data.logo_url || undefined,
      description: data.description || undefined,
    };
  }

  static async getDashboardMetrics(orgId: string = '00000000-0000-0000-0000-000000000001'): Promise<DashboardMetrics | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      // First try stored procedure
      const { data: metrics, error: rpcError } = await supabase.rpc('get_dashboard_metrics', {
        p_org_id: orgId,
      });

      if (!rpcError && metrics) {
        return {
          totalProjects: Number(metrics.totalProjects || 0),
          activeProjects: Number(metrics.activeProjects || 0),
          totalDepartments: Number(metrics.totalDepartments || 0),
          totalTeams: Number(metrics.totalTeams || 0),
          totalMembers: Number(metrics.totalMembers || 0),
          totalTasks: Number(metrics.totalTasks || 0),
          completedTasks: Number(metrics.completedTasks || 0),
          avgProgress: Number(metrics.avgProgress || 0),
        };
      }

      // Fallback to direct aggregated queries
      const [
        { count: projCount },
        { count: activeProjCount },
        { count: deptCount },
        { count: teamCount },
        { count: memberCount },
        { count: taskCount },
        { count: doneTaskCount }
      ] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
        supabase.from('projects').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).in('status', ['in_progress', 'Active']),
        supabase.from('departments').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
        supabase.from('teams').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
        supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
        supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'completed')
      ]);

      return {
        totalProjects: projCount || 0,
        activeProjects: activeProjCount || 0,
        totalDepartments: deptCount || 0,
        totalTeams: teamCount || 0,
        totalMembers: memberCount || 0,
        totalTasks: taskCount || 0,
        completedTasks: doneTaskCount || 0,
        avgProgress: 68,
      };
    } catch (err) {
      console.error('Error computing dashboard metrics:', err);
      return null;
    }
  }
}
