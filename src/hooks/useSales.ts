
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sale, SaleFormData } from "@/types/sale";
import { useAuth } from "./useAuth";

export const useSales = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["sales", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching sales:", error);
        throw error;
      }
      
      return data.map(sale => ({
        id: sale.id,
        numericId: sale.numeric_id,
        type: sale.type as Sale["type"],
        clientName: sale.client_name,
        phoneNumber: sale.phone_number,
        pnr: sale.pnr,
        buyingPrice: Number(sale.buying_price),
        sellingPrice: Number(sale.selling_price),
        system: sale.system as Sale["system"],
        agent: sale.agent as Sale["agent"],
        departureDate: new Date(sale.departure_date),
        departureTime: sale.departure_time,
        destination: sale.destination,
        notes: sale.notes,
        createdAt: new Date(sale.created_at),
        profit: Number(sale.profit),
        cashedIn: sale.cashed_in || false,
        cashedInAt: sale.cashed_in_at ? new Date(sale.cashed_in_at) : undefined,
        cashedInBy: sale.cashed_in_by,
      })) as Sale[];
    },
    enabled: !!user,
  });
};

export const useAddSale = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (saleData: SaleFormData) => {
      if (!user) throw new Error("User not authenticated");

      // Prepare the basic sale data
      const saleInsertData: any = {
        user_id: user.id,
        type: saleData.type,
        client_name: saleData.clientName,
        phone_number: saleData.phoneNumber,
        buying_price: Number(saleData.buyingPrice),
        selling_price: Number(saleData.sellingPrice),
        system: saleData.system,
        agent: saleData.agent,
        notes: saleData.notes || null,
        destination: saleData.destination || null,
      };

      // Only add flight-specific fields for "Flight Confirmed" sales
      if (saleData.type === "Flight Confirmed") {
        saleInsertData.pnr = saleData.pnr || null;
        saleInsertData.departure_date = saleData.departureDate.toISOString().split('T')[0];
        saleInsertData.departure_time = saleData.departureTime;
      } else {
        // For other types, set default values or null
        saleInsertData.pnr = null;
        saleInsertData.departure_date = new Date().toISOString().split('T')[0]; // Default to today
        saleInsertData.departure_time = "00:00:00"; // Default time
      }

      const { data, error } = await supabase
        .from("sales")
        .insert(saleInsertData)
        .select()
        .single();

      if (error) {
        console.error("Error adding sale:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["sales-daily"] });
      queryClient.invalidateQueries({ queryKey: ["sales-by-type"] });
    },
  });
};

export const useSalesDaily = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["sales-daily", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .rpc("get_sales_daily_aggregates");
      
      if (error) {
        console.error("Error fetching daily sales:", error);
        throw error;
      }
      
      return data.map(item => ({
        day: new Date(item.day).toLocaleDateString('fr-FR', { 
          day: '2-digit', 
          month: 'short',
          year: 'numeric'
        }),
        sales: Number(item.sales),
        revenue: Number(item.revenue),
        profit: Number(item.profit)
      }));
    },
    enabled: !!user,
  });
};

export const useSalesByType = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["sales-by-type", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .rpc("get_sales_by_type_aggregates");
      
      if (error) {
        console.error("Error fetching sales by type:", error);
        throw error;
      }
      
      const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];
      
      return data.map((item, index) => ({
        type: item.type,
        count: Number(item.count),
        revenue: Number(item.revenue),
        color: colors[index % colors.length]
      }));
    },
    enabled: !!user,
  });
};

export const useTopServicesCurrentMonth = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["top-services-current-month", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      
      const { data, error } = await supabase
        .from("sales")
        .select("type, profit")
        .gte("created_at", `${currentMonth}-01`)
        .lt("created_at", `${currentMonth === '2025-12' ? '2026-01' : currentMonth.slice(0, 4) + '-' + String(parseInt(currentMonth.slice(5)) + 1).padStart(2, '0')}-01`)
        .order("profit", { ascending: false });
      
      if (error) {
        console.error("Error fetching top services:", error);
        throw error;
      }
      
      // Group by type and sum profits
      const groupedData = data.reduce((acc, sale) => {
        if (!acc[sale.type]) {
          acc[sale.type] = { totalProfit: 0, count: 0 };
        }
        acc[sale.type].totalProfit += Number(sale.profit);
        acc[sale.type].count += 1;
        return acc;
      }, {} as Record<string, { totalProfit: number; count: number }>);
      
      // Convert to array and sort by total profit
      const sortedServices = Object.entries(groupedData)
        .map(([type, data]) => ({
          type,
          totalProfit: data.totalProfit,
          count: data.count
        }))
        .sort((a, b) => b.totalProfit - a.totalProfit)
        .slice(0, 3);
      
      const colors = ["#10B981", "#F59E0B", "#EF4444"];
      
      return sortedServices.map((item, index) => ({
        type: item.type,
        totalProfit: item.totalProfit,
        count: item.count,
        color: colors[index] || "#8B5CF6"
      }));
    },
    enabled: !!user,
  });
};
