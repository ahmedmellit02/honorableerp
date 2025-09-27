import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { NotificationBell } from "@/components/ui/notifications";
import { ChatBot } from "@/components/ChatBot";
import { useSimpleRole } from "@/hooks/useSimpleRole";
import { useSales, useSalesDaily, useSalesByType, useTopServicesCurrentMonth } from "@/hooks/useSales";
import { useSystemBalances } from "@/hooks/useBalance";
import { useExpensesDaily, useExpensesMonthly, useUnapprovedExpensesDaily, useUnapprovedExpensesMonthly } from "@/hooks/useExpenses";
import Dashboard from './pages/Dashboard';
import AddSale from './pages/AddSale';
import AllSales from './pages/AllSales';
import HonorableCRM from './pages/HonorableCRM';
import Facturation from './pages/Facturation';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import BalanceControl from './pages/BalanceControl';
import DebtControl from './pages/DebtControl';
import SupplierDashboard from './pages/SupplierDashboard';
import ExpenseControl from './pages/ExpenseControl';
import DeviceManagement from './pages/DeviceManagement';
import OmraManagement from './pages/OmraManagement';
import { BannedDeviceBanner } from './components/BannedDeviceBanner';

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, loading, deviceBanned } = useAuth();
  const { userRole } = useSimpleRole();
  
  // Fetch comprehensive data for ChatBot
  const { data: sales = [], isLoading: salesLoading } = useSales();
  const { data: dailyData = [], isLoading: dailyLoading } = useSalesDaily();
  const { data: typeData = [], isLoading: typeLoading } = useSalesByType();
  const { data: topServices = [], isLoading: topServicesLoading } = useTopServicesCurrentMonth();
  const { data: systemBalances = [], isLoading: balanceLoading } = useSystemBalances();
  const { data: dailyExpenses, isLoading: dailyExpensesLoading } = useExpensesDaily();
  const { data: monthlyExpenses, isLoading: monthlyExpensesLoading } = useExpensesMonthly();
  const { data: dailyUnapproved, isLoading: dailyUnapprovedLoading } = useUnapprovedExpensesDaily();
  const { data: monthlyUnapproved, isLoading: monthlyUnapprovedLoading } = useUnapprovedExpensesMonthly();

  // Calculate comprehensive agency data for ChatBot
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const today = new Date().toDateString();

  // Filter sales for current month
  const currentMonthSales = sales.filter(sale => {
    const saleDate = new Date(sale.createdAt);
    return saleDate >= currentMonthStart && saleDate <= currentMonthEnd;
  });

  // Calculate metrics
  const todaySales = sales.filter(sale => sale.createdAt.toDateString() === today);
  const totalSales = currentMonthSales.length;
  const totalRevenue = currentMonthSales.reduce((sum, sale) => sum + sale.sellingPrice, 0);
  const totalProfit = currentMonthSales.reduce((sum, sale) => sum + sale.profit, 0);
  const dailySalesCount = todaySales.length;
  const dailyRevenue = todaySales.reduce((sum, sale) => sum + sale.sellingPrice, 0);
  const dailyProfit = todaySales.reduce((sum, sale) => sum + sale.profit, 0);
  const monthlyExpensesAmount = monthlyExpenses?.totalExpenses || 0;
  const dailyExpensesAmount = dailyExpenses?.totalExpenses || 0;
  const monthlyNetProfit = totalProfit - monthlyExpensesAmount;
  const dailyNetProfit = dailyProfit - dailyExpensesAmount;

  // Calculate agent stats
  const agentStats = currentMonthSales.reduce((acc, sale) => {
    if (!acc[sale.agent]) {
      acc[sale.agent] = { sales: 0, profit: 0 };
    }
    acc[sale.agent].sales += 1;
    acc[sale.agent].profit += sale.profit;
    return acc;
  }, {} as Record<string, { sales: number; profit: number }>);

  // Get service counts by type
  const flightBookings = typeData.find(item => 
    item.type === "Flight Confirmed" || item.type === "Flight On Hold"
  )?.count || 0;
  const hotelBookings = typeData.find(item => item.type === "Hotel Booking")?.count || 0;
  const organizedTravel = typeData.find(item => item.type === "Organized Travel")?.count || 0;

  // Comprehensive agency data for ChatBot
  const agencyData = {
    dailyMetrics: {
      salesCount: dailySalesCount,
      revenue: dailyRevenue,
      profit: dailyProfit,
      expenses: dailyExpensesAmount,
      netProfit: dailyNetProfit,
      date: today
    },
    monthlyMetrics: {
      salesCount: totalSales,
      revenue: totalRevenue,
      profit: totalProfit,
      expenses: monthlyExpensesAmount,
      netProfit: monthlyNetProfit,
      month: now.getMonth() + 1,
      year: now.getFullYear()
    },
    agentPerformance: Object.entries(agentStats).map(([agent, stats]) => ({
      name: agent,
      salesCount: stats.sales,
      profit: stats.profit,
      profitPercentage: totalProfit > 0 ? ((stats.profit / totalProfit) * 100).toFixed(1) : "0",
      avgProfitPerSale: stats.sales > 0 ? (stats.profit / stats.sales).toFixed(0) : "0"
    })).sort((a, b) => b.profit - a.profit),
    serviceTypes: typeData.map(type => ({
      name: type.type,
      count: type.count,
      revenue: type.revenue,
      profit: type.profit,
      avgTicket: type.count > 0 ? (type.revenue / type.count).toFixed(0) : "0",
      profitMargin: type.revenue > 0 ? ((type.profit / type.revenue) * 100).toFixed(1) : "0"
    })),
    topServices: topServices.map((service, index) => ({
      rank: index + 1,
      type: service.type,
      count: service.count,
      totalProfit: service.totalProfit,
      profitPercentage: totalProfit > 0 ? ((service.totalProfit / totalProfit) * 100).toFixed(1) : "0"
    })),
    systemBalances: systemBalances.map(balance => ({
      system: balance.system,
      balance: balance.current_balance,
      status: balance.current_balance >= 0 ? 'positive' : 'negative'
    })),
    bookingTypes: {
      flights: flightBookings,
      hotels: hotelBookings,
      organizedTravel: organizedTravel,
      total: flightBookings + hotelBookings + organizedTravel
    },
    recentSales: sales.slice(0, 10).map(sale => ({
      id: sale.numericId,
      type: sale.type,
      client: sale.clientName,
      agent: sale.agent,
      sellingPrice: sale.sellingPrice,
      profit: sale.profit,
      profitMargin: sale.sellingPrice > 0 ? ((sale.profit / sale.sellingPrice) * 100).toFixed(1) : "0",
      system: sale.system,
      date: sale.createdAt.toLocaleDateString(),
      cashedIn: sale.cashedIn
    })),
    kpis: {
      dailyProfitMargin: dailyRevenue > 0 ? ((dailyProfit / dailyRevenue) * 100).toFixed(1) : "0",
      monthlyProfitMargin: totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : "0",
      avgDailySales: totalSales > 0 ? (totalSales / new Date().getDate()).toFixed(1) : "0",
      avgTicketDaily: dailySalesCount > 0 ? (dailyRevenue / dailySalesCount).toFixed(0) : "0",
      avgTicketMonthly: totalSales > 0 ? (totalRevenue / totalSales).toFixed(0) : "0",
      topAgent: Object.entries(agentStats).length > 0 ? 
        Object.entries(agentStats).reduce((a, b) => a[1].profit > b[1].profit ? a : b)[0] : null
    },
    unapprovedExpenses: {
      daily: dailyUnapproved?.count || 0,
      monthly: monthlyUnapproved?.count || 0
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (deviceBanned) {
    return <BannedDeviceBanner />;
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="sticky top-0 z-50 h-12 flex items-center justify-between border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger />
            <NotificationBell />
          </header>
          <div className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/add-sale" element={<AddSale />} />
              <Route path="/sales" element={<AllSales />} />
              <Route path="/crm" element={<HonorableCRM />} />
              <Route path="/facturation" element={<Facturation />} />
              <Route path="/supplier-dashboard" element={<SupplierDashboard />} />
              <Route path="/balance-control" element={<BalanceControl />} />
              <Route path="/debt-control" element={<DebtControl />} />
              <Route path="/expense-control" element={<ExpenseControl />} />
              <Route path="/device-management" element={<DeviceManagement />} />
              <Route path="/omra-management" element={<OmraManagement />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
      </div>
      
      {/* ChatBot for managers and super_agents - available on all pages */}
      {(userRole === 'manager' || userRole === 'super_agent') && <ChatBot agencyData={agencyData} />}
    </SidebarProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
