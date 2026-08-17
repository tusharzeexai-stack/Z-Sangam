import { useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface RealtimeConfig {
  table: string;
  schema?: string;
  filter?: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
}

export const useRealtime = ({
  table,
  schema = 'public',
  filter,
  onInsert,
  onUpdate,
  onDelete,
}: RealtimeConfig) => {
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const channelName = `realtime_${table}_${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema,
          table,
          filter,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' && onInsert) {
            onInsert(payload.new);
          } else if (payload.eventType === 'UPDATE' && onUpdate) {
            onUpdate(payload.new);
          } else if (payload.eventType === 'DELETE' && onDelete) {
            onDelete(payload.old);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, schema, filter, onInsert, onUpdate, onDelete]);
};
