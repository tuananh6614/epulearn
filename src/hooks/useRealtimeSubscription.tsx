
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export type SubscriptionEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface UseRealtimeSubscriptionProps {
  table: string;
  event?: SubscriptionEvent;
  schema?: string;
  filter?: string;
  userId?: string;
  onDataChange?: (payload: any) => void;
}

export function useRealtimeSubscription({
  table,
  event = '*',
  schema = 'public',
  filter,
  userId,
  onDataChange,
}: UseRealtimeSubscriptionProps) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [lastPayload, setLastPayload] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!table) return;

    // Tạo filter dựa trên userId nếu được cung cấp
    let filterConfig = filter ? { filter } : undefined;
    if (userId && !filter) {
      // Cấu hình filter cho các bảng liên quan đến user
      if (table === 'user_lesson_progress' || table === 'user_courses' || table === 'user_test_results') {
        filterConfig = { filter: `user_id=eq.${userId}` };
      }
    }

    console.log(`[Realtime] Subscribing to ${schema}.${table} for ${event} events`, filterConfig);

    try {
      // Tạo channel mới với ID duy nhất
      const channelId = `${table}_${Date.now()}`;
      
      // Create the channel first
      const newChannel = supabase.channel(channelId);
      
      // Configure the channel with postgres_changes events using the correct type pattern
      // TypeScript expects a specific format for the event listener
      newChannel.on(
        'postgres_changes' as any, 
        { 
          event, 
          schema, 
          table, 
          ...(filterConfig || {}) 
        }, 
        (payload) => {
          // Fix: Access the event property correctly from the payload
          // The payload structure from postgres_changes doesn't have eventType
          console.log(`[Realtime] Received ${payload.event} for ${table}:`, payload);
          setLastPayload(payload);
          if (onDataChange) {
            onDataChange(payload);
          }
        }
      );

      // Subscribe to the channel after configuration
      const subscribedChannel = newChannel.subscribe((status) => {
        console.log(`[Realtime] Channel ${table} status:`, status);
        if (status === 'CHANNEL_ERROR') {
          setError(new Error(`Failed to subscribe to ${table}`));
        }
      });

      setChannel(subscribedChannel);

      // Cleanup function
      return () => {
        console.log(`[Realtime] Unsubscribing from ${table}`);
        subscribedChannel.unsubscribe();
      };
    } catch (err) {
      console.error(`[Realtime] Error subscribing to ${table}:`, err);
      setError(err instanceof Error ? err : new Error('Unknown error subscribing to realtime'));
      return undefined;
    }
  }, [table, event, schema, filter, userId, onDataChange]);

  return { lastPayload, error };
}
