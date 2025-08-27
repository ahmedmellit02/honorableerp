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
      const { data, error } = await supabase
        .rpc("get_expenses_daily_total");

      if (error) throw error;

      console.log('Daily expenses query result:', data);
      const totalExpenses = data?.[0]?.total_expenses ? Number(data[0].total_expenses) : 0;
      console.log('Total daily approved expenses:', totalExpenses);
      
      return { totalExpenses };
    },
  });
};

export const useExpensesMonthly = () => {
  return useQuery({
    queryKey: ["expenses-monthly"],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_expenses_monthly_total");

      if (error) throw error;

      console.log('Monthly expenses query result:', data);
      const totalExpenses = data?.[0]?.total_expenses ? Number(data[0].total_expenses) : 0;
      console.log('Total monthly approved expenses:', totalExpenses);
      
      return { totalExpenses };
    },
  });
};

export const useUnapprovedExpensesDaily = () => {
  return useQuery({
    queryKey: ["unapproved-expenses-daily"],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_unapproved_expenses_daily_count");

      if (error) throw error;
      
      return { count: data?.[0]?.count ? Number(data[0].count) : 0 };
    },
  });
};

export const useUnapprovedExpensesMonthly = () => {
  return useQuery({
    queryKey: ["unapproved-expenses-monthly"],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_unapproved_expenses_monthly_count");

      if (error) throw error;
      
      return { count: data?.[0]?.count ? Number(data[0].count) : 0 };
    },
  });
};