import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PelerinPayment {
  id: string;
  pelerin_id: string;
  amount: number;
  payment_date: string;
  description: string | null;
  created_by: string;
  created_at: string;
}

export interface CreatePaymentData {
  pelerin_id: string;
  amount: number;
  description?: string;
}

export function usePelerinPayments(pelerinId: string) {
  return useQuery({
    queryKey: ['pelerin-payments', pelerinId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pelerin_payments')
        .select('*')
        .eq('pelerin_id', pelerinId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data as PelerinPayment[];
    },
    enabled: !!pelerinId,
  });
}

export function useProgramPayments(programId: string) {
  return useQuery({
    queryKey: ['program-payments', programId],
    queryFn: async () => {
      // First get all pelerins for this program
      const { data: pelerins, error: pelerinsError } = await supabase
        .from('pelerins')
        .select('id')
        .eq('program_id', programId);

      if (pelerinsError) throw pelerinsError;
      if (!pelerins || pelerins.length === 0) return [];

      const pelerinIds = pelerins.map(p => p.id);

      // Then get all payments for these pelerins
      const { data, error } = await supabase
        .from('pelerin_payments')
        .select('*')
        .in('pelerin_id', pelerinIds)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data as PelerinPayment[];
    },
    enabled: !!programId,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentData: CreatePaymentData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('pelerin_payments')
        .insert([{
          ...paymentData,
          created_by: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      // Update pelerin's updated_at to move it to top of the list
      await supabase
        .from('pelerins')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', paymentData.pelerin_id);

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pelerin-payments', data.pelerin_id] });
      queryClient.invalidateQueries({ queryKey: ['program-payments'] });
      queryClient.invalidateQueries({ queryKey: ['pelerins'] });
    },
  });
}
