import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type UserRole = 'agent' | 'cashier';

export function useUserRole() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data?.role || 'agent';
    },
    enabled: !!user,
  });
}

export function useSetUserRole() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (role: UserRole) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-role'] });
    },
  });
}

export function useCashInSale() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (saleId: string) => {
      const { error } = await supabase.rpc('cash_in_sale', {
        sale_id: saleId
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
}