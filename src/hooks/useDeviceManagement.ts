import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { banDevice } from '@/utils/deviceFingerprinting';

export interface BannedDevice {
  id: string;
  device_fingerprint: string;
  banned_at: string;
  banned_by: string;
  reason?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeviceSession {
  id: string;
  device_fingerprint: string;
  user_id: string;
  ip_address?: string;
  user_agent?: string;
  last_seen_at: string;
  created_at: string;
}

export function useBannedDevices() {
  return useQuery({
    queryKey: ['banned-devices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banned_devices')
        .select('*')
        .order('banned_at', { ascending: false });
      
      if (error) throw error;
      return data as BannedDevice[];
    },
  });
}

export function useDeviceSessions() {
  return useQuery({
    queryKey: ['device-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('device_sessions')
        .select('*')
        .order('last_seen_at', { ascending: false });
      
      if (error) throw error;
      return data as DeviceSession[];
    },
  });
}

export function useBanDevice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      fingerprint, 
      reason 
    }: { 
      fingerprint: string; 
      reason?: string; 
    }) => {
      await banDevice(fingerprint, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banned-devices'] });
      queryClient.invalidateQueries({ queryKey: ['device-sessions'] });
    },
  });
}

export function useUnbanDevice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (deviceId: string) => {
      const { error } = await supabase
        .from('banned_devices')
        .update({ is_active: false })
        .eq('id', deviceId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banned-devices'] });
    },
  });
}