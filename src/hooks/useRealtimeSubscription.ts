
/**
 * Realtime Subscription Hook - Mock
 * 
 * Hook giả lập theo dõi các thay đổi theo thời gian thực
 */
import { useState, useEffect } from 'react';

export interface SubscriptionOptions {
  channel: string;
  event: string;
  filter?: string;
}

export function useRealtimeSubscription<T>(
  options: SubscriptionOptions,
  callback: (payload: T) => void
): { isSubscribed: boolean } {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Giả lập đăng ký
    console.log(`[MOCK] Subscribing to ${options.channel}:${options.event}`, 
      options.filter ? `with filter ${options.filter}` : '');
    
    setIsSubscribed(true);
    
    // Giả lập dữ liệu nhận được
    const timeout = setTimeout(() => {
      const mockData = { 
        type: 'INSERT',
        table: options.channel,
        record: { id: 'mock-id', updated_at: new Date().toISOString() }
      } as unknown as T;
      
      callback(mockData);
    }, 2000);
    
    return () => {
      // Giả lập hủy đăng ký
      console.log(`[MOCK] Unsubscribing from ${options.channel}:${options.event}`);
      setIsSubscribed(false);
      clearTimeout(timeout);
    };
  }, [options.channel, options.event, options.filter]);

  return { isSubscribed };
}

export default useRealtimeSubscription;
