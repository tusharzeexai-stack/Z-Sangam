import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

export class NotificationService {
  static async getUserNotifications(userId?: string): Promise<NotificationItem[]> {
    if (!isSupabaseConfigured() || !userId) {
      return [
        {
          id: 'notif-1',
          title: 'System Initialized',
          message: 'Welcome to Z-Sangam Enterprise Project Orchestration.',
          type: 'info',
          isRead: false,
          createdAt: new Date().toISOString(),
        }
      ];
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching notifications:', error.message);
      return [];
    }

    return (data || []).map((n: any) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.is_read,
      createdAt: n.created_at,
    }));
  }

  static async markAsRead(id: string): Promise<void> {
    if (!isSupabaseConfigured()) return;
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  }

  static async markAllAsRead(userId: string): Promise<void> {
    if (!isSupabaseConfigured()) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
  }
}
