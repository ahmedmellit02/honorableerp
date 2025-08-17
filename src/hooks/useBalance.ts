import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface BalanceRecord {
  id: string;
  user_id: string;
  system: string;
  amount: number;
  type: 'addition' | 'deduction';
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface SystemBalance {
  system: string;
  current_balance: number;
}

export const useSystemBalances = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["system-balances", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .rpc("get_all_system_balances");
      
      if (error) {
        console.error("Error fetching system balances:", error);
        throw error;
      }
      
      return data as SystemBalance[];
    },
    enabled: !!user,
  });
};

export const useBalanceRecords = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["balance-records", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("balance_records")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching balance records:", error);
        throw error;
      }
      
      return data.map(record => ({
        ...record,
        amount: Number(record.amount),
        created_at: new Date(record.created_at),
        updated_at: new Date(record.updated_at),
      })) as BalanceRecord[];
    },
    enabled: !!user,
  });
};

export const useAddBalance = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      system, 
      amount, 
      description 
    }: { 
      system: string; 
      amount: number; 
      description?: string; 
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("balance_records")
        .insert({
          user_id: user.id,
          system,
          amount: Number(amount),
          type: 'addition',
          description: description || `Ajout de solde pour ${system}`,
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding balance:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance-records"] });
      queryClient.invalidateQueries({ queryKey: ["system-balances"] });
    },
  });
};