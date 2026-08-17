import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ActivityEvent } from '../types';

export class ActivityService {
  static async getAll(orgId: string = '00000000-0000-0000-0000-000000000001'): Promise<ActivityEvent[]> {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        actor:profiles!activity_logs_actor_id_fkey(full_name, avatar_url, role)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Error fetching activity logs:', error);
      return [];
    }

    return (data || []).map((a: any) => ({
      id: a.id,
      userName: a.actor?.full_name || 'System Operator',
      userAvatar: a.actor?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      userRole: a.actor?.role || 'Administrator',
      action: a.action,
      target: a.metadata?.name || a.metadata?.project_code || 'Resource',
      targetType: (a.entity_type as any) || 'system',
      timestamp: a.created_at,
      relativeTime: 'Recent',
      dateGroup: 'TODAY',
      details: a.metadata?.details || undefined,
    }));
  }

  static async log(
    action: string,
    entityType: string,
    entityId?: string,
    metadata: any = {},
    orgId: string = '00000000-0000-0000-0000-000000000001'
  ): Promise<void> {
    if (!isSupabaseConfigured()) return;

    await supabase.from('activity_logs').insert({
      organization_id: orgId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
    });
  }
}
