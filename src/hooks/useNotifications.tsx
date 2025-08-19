import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Notification {
  id: string;
  user_id: string;
  sale_id: string;
  client_name: string;
  notification_type: 'flight' | 'rw';
  message: string;
  trigger_time: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()) // Last 2 days
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user,
    refetchInterval: 5 * 60 * 1000, // Poll every 5 minutes
  });
}

export function useUnreadNotificationsCount() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['unread-notifications-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
    refetchInterval: 5 * 60 * 1000, // Poll every 5 minutes
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase.rpc('mark_notification_read', {
        notification_id: notificationId
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count', user?.id] });
    },
  });
}