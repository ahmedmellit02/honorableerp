import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DebtRecord {
  id: string;
  user_id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  created_at: string;
  updated_at: string;
}

export interface DebtBalance {
  current_balance: number;
}

// Hook to fetch all debt records
export const useDebtRecords = () => {
  return useQuery({
    queryKey: ['debt-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('debt_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DebtRecord[];
    },
  });
};

// Hook to fetch current debt balance
export const useDebtBalance = () => {
  return useQuery({
    queryKey: ['debt-balance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_current_debt_balance');

      if (error) throw error;
      return data?.[0] as DebtBalance;
    },
  });
};

// Hook to add a new debt record
export const useAddDebtRecord = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newRecord: {
      amount: number;
      type: 'credit' | 'debit';
      description: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('debt_records')
        .insert({
          ...newRecord,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as DebtRecord;
    },
    onSuccess: () => {
      // Invalidate and refetch debt records and balance
      queryClient.invalidateQueries({ queryKey: ['debt-records'] });
      queryClient.invalidateQueries({ queryKey: ['debt-balance'] });
      toast({
        title: "Succès",
        description: "Enregistrement de crédit/dette ajouté avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout de l'enregistrement: " + error.message,
        variant: "destructive",
      });
    },
  });
};