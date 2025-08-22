import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Expense {
  id: string;
  amount: number;
  description: string;
  created_at: string;
  user_id: string;
  classification?: string;
  approved: boolean;
}

export const useExpenses = () => {
  return useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((expense: any) => ({
        id: expense.id,
        amount: Number(expense.amount),
        description: expense.description,
        created_at: expense.created_at,
        user_id: expense.user_id,
        classification: expense.classification,
        approved: expense.approved || false,
      })) as Expense[];
    },
  });
};

export const useExpensesDaily = () => {
  return useQuery({
    queryKey: ["expenses-daily"],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from("expenses")
        .select("amount")
        .gte("created_at", `${today}T00:00:00`)
        .lt("created_at", `${today}T23:59:59`)
        .eq("approved", true);

      if (error) throw error;

      const totalExpenses = (data || []).reduce((sum, expense) => sum + Number(expense.amount), 0);
      
      return { totalExpenses };
    },
  });
};

export const useExpensesMonthly = () => {
  return useQuery({
    queryKey: ["expenses-monthly"],
    queryFn: async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
      
      const { data, error } = await supabase
        .from("expenses")
        .select("amount")
        .gte("created_at", startOfMonth)
        .lte("created_at", endOfMonth)
        .eq("approved", true);

      if (error) throw error;

      const totalExpenses = (data || []).reduce((sum, expense) => sum + Number(expense.amount), 0);
      
      return { totalExpenses };
    },
  });
};