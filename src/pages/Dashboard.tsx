import MetricCard from "@/components/dashboard/MetricCard";
import SalesChart from "@/components/dashboard/SalesChart";
import BookingTypePieChart from "@/components/dashboard/BookingTypePieChart";
import RecentSalesTable from "@/components/dashboard/RecentSalesTable";
import { ChatBot } from "@/components/ChatBot";

import { useSimpleRole } from "@/hooks/useSimpleRole";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  Plane,
  Hotel,
  MapPin,
  Target
} from "lucide-react";
import { useSales, useSalesDaily, useSalesByType, useTopServicesCurrentMonth } from "@/hooks/useSales";
import { useSystemBalances } from "@/hooks/useBalance";
import { useAuth } from "@/hooks/useAuth";
import { useExpensesDaily, useExpensesMonthly, useUnapprovedExpensesDaily, useUnapprovedExpensesMonthly } from "@/hooks/useExpenses";

const Dashboard = () => {
  const { user } = useAuth();
  const { userRole, canViewMonthlyStats, canViewDashboard, loading: roleLoading } = useSimpleRole();
  const { data: sales = [], isLoading: salesLoading } = useSales();
  const { data: dailyData = [], isLoading: dailyLoading } = useSalesDaily();
  const { data: typeData = [], isLoading: typeLoading } = useSalesByType();
  const { data: topServices = [], isLoading: topServicesLoading } = useTopServicesCurrentMonth();
  const { data: systemBalances = [], isLoading: balanceLoading } = useSystemBalances();
  const { data: dailyExpenses, isLoading: dailyExpensesLoading } = useExpensesDaily();
  const { data: monthlyExpenses, isLoading: monthlyExpensesLoading } = useExpensesMonthly();
  const { data: dailyUnapproved, isLoading: dailyUnapprovedLoading } = useUnapprovedExpensesDaily();
  const { data: monthlyUnapproved, isLoading: monthlyUnapprovedLoading } = useUnapprovedExpensesMonthly();

  console.log('Dashboard render:', { userRole, canViewDashboard: canViewDashboard() });

  // Get current month's start and end dates
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Filter sales for current month
  const currentMonthSales = sales.filter(sale => {
    const saleDate = new Date(sale.createdAt);
    return saleDate >= currentMonthStart && saleDate <= currentMonthEnd;
  });

  // Calculate monthly metrics from current month data
  const totalSales = currentMonthSales.length;
  const totalRevenue = currentMonthSales.reduce((sum, sale) => sum + sale.sellingPrice, 0);
  const totalProfit = currentMonthSales.reduce((sum, sale) => sum + sale.profit, 0);
  const monthlyExpensesAmount = monthlyExpenses?.totalExpenses || 0;
  const monthlyNetProfit = totalProfit - monthlyExpensesAmount;

  // Calculate daily metrics (today's sales only)
  const today = new Date().toDateString();
  const todaySales = sales.filter(sale => sale.createdAt.toDateString() === today);
  const dailySalesCount = todaySales.length;
  const dailyRevenue = todaySales.reduce((sum, sale) => sum + sale.sellingPrice, 0);
  const dailyProfit = todaySales.reduce((sum, sale) => sum + sale.profit, 0);
  const dailyExpensesAmount = dailyExpenses?.totalExpenses || 0;
  const dailyNetProfit = dailyProfit - dailyExpensesAmount;

  // Calculate agent stats from current month data
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
  
  const hotelBookings = typeData.find(item => 
    item.type === "Hotel Booking"
  )?.count || 0;
  
  const organizedTravel = typeData.find(item => 
    item.type === "Organized Travel"
  )?.count || 0;

  const isLoading = salesLoading || dailyLoading || typeLoading || topServicesLoading || balanceLoading || roleLoading || dailyExpensesLoading || monthlyExpensesLoading || dailyUnapprovedLoading || monthlyUnapprovedLoading;

  // Check permissions for different dashboard sections  
  const showMonthlyStats = canViewMonthlyStats();
  const showDashboard = canViewDashboard();

  // Prepare comprehensive agency data for ChatBot
  const agencyData = {
    // Daily Metrics
    dailyMetrics: {
      salesCount: dailySalesCount,
      revenue: dailyRevenue,
      profit: dailyProfit,
      expenses: dailyExpensesAmount,
      netProfit: dailyNetProfit,
      date: today
    },
    // Monthly Metrics
    monthlyMetrics: {
      salesCount: totalSales,
      revenue: totalRevenue,
      profit: totalProfit,
      expenses: monthlyExpensesAmount,
      netProfit: monthlyNetProfit,
      month: now.getMonth() + 1,
      year: now.getFullYear()
    },
    // Agent Performance Analysis
    agentPerformance: Object.entries(agentStats).map(([agent, stats]) => ({
      name: agent,
      salesCount: stats.sales,
      profit: stats.profit,
      profitPercentage: totalProfit > 0 ? ((stats.profit / totalProfit) * 100).toFixed(1) : "0",
      avgProfitPerSale: stats.sales > 0 ? (stats.profit / stats.sales).toFixed(0) : "0"
    })).sort((a, b) => b.profit - a.profit),
    // Service Performance
    serviceTypes: typeData.map(type => ({
      name: type.type,
      count: type.count,
      revenue: type.revenue,
      profit: type.profit,
      avgTicket: type.count > 0 ? (type.revenue / type.count).toFixed(0) : "0",
      profitMargin: type.revenue > 0 ? ((type.profit / type.revenue) * 100).toFixed(1) : "0"
    })),
    // Top Services
    topServices: topServices.map((service, index) => ({
      rank: index + 1,
      type: service.type,
      count: service.count,
      totalProfit: service.totalProfit,
      profitPercentage: totalProfit > 0 ? ((service.totalProfit / totalProfit) * 100).toFixed(1) : "0"
    })),
    // System Balances
    systemBalances: systemBalances.map(balance => ({
      system: balance.system,
      balance: balance.current_balance,
      status: balance.current_balance >= 0 ? 'positive' : 'negative'
    })),
    // Booking Types
    bookingTypes: {
      flights: flightBookings,
      hotels: hotelBookings,
      organizedTravel: organizedTravel,
      total: flightBookings + hotelBookings + organizedTravel
    },
    // Recent Sales (last 10)
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
    // Financial KPIs
    kpis: {
      dailyProfitMargin: dailyRevenue > 0 ? ((dailyProfit / dailyRevenue) * 100).toFixed(1) : "0",
      monthlyProfitMargin: totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : "0",
      avgDailySales: totalSales > 0 ? (totalSales / new Date().getDate()).toFixed(1) : "0",
      avgTicketDaily: dailySalesCount > 0 ? (dailyRevenue / dailySalesCount).toFixed(0) : "0",
      avgTicketMonthly: totalSales > 0 ? (totalRevenue / totalSales).toFixed(0) : "0",
      topAgent: Object.entries(agentStats).length > 0 ? 
        Object.entries(agentStats).reduce((a, b) => a[1].profit > b[1].profit ? a : b)[0] : null
    },
    // Unapproved expenses
    unapprovedExpenses: {
      daily: dailyUnapproved?.count || 0,
      monthly: monthlyUnapproved?.count || 0
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Tableau de bord 
          </h1>
          <p className="text-muted-foreground">
            Suivez les performances des ventes et gérez les réservations
          </p>
        </div>

        {/* Daily Metrics Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Statistiques du jour</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Ventes aujourd'hui"
              value={dailySalesCount.toString()}
              icon={TrendingUp}
              gradient="bg-gradient-tropical"
            />
            <MetricCard
              title="Charges du jour"
              value={`${dailyExpensesAmount.toLocaleString()} DH`}
              icon={DollarSign}
              gradient="bg-gradient-sunset"
              unapprovedCount={dailyUnapproved?.count}
            />
            <MetricCard
              title="Bénéfice du jour"
              value={`${dailyProfit.toLocaleString()} DH`}
              icon={Target}
              gradient="bg-gradient-ocean"
            />
            <MetricCard
              title="Bénéfices net du jour"
              value={`${Math.round(dailyNetProfit).toLocaleString()} DH`}
              icon={Calendar}
              gradient="bg-gradient-tropical"
              unapprovedCount={dailyUnapproved?.count}
            />
          </div>
        </div>

        {/* Monthly Metrics Grid - Only for specific users */}
        {showMonthlyStats && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Statistiques du mois</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Ventes totales"
                value={totalSales.toString()}
                icon={TrendingUp}
                gradient="bg-gradient-ocean"
              />
              <MetricCard
                title="Charges du mois"
                value={`${monthlyExpensesAmount.toLocaleString()} DH`}
                icon={DollarSign}
                gradient="bg-gradient-tropical"
                unapprovedCount={monthlyUnapproved?.count}
              />
              <MetricCard
                title="Bénéfice total"
                value={`${totalProfit.toLocaleString()} DH`}
                icon={Target}
                gradient="bg-gradient-sunset"
              />
              <MetricCard
                title="Bénéfices net du mois"
                value={`${Math.round(monthlyNetProfit).toLocaleString()} DH`}
                icon={Calendar}
                gradient="bg-gradient-ocean"
                unapprovedCount={monthlyUnapproved?.count}
              />
            </div>
          </div>
        )}
    
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <SalesChart />
          <BookingTypePieChart />
        </div>

        {/* Balance Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Solde Théorique</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {systemBalances.map((balance) => (
              <MetricCard
                key={balance.system}
                title={balance.system}
                value={`${new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'MAD'
                }).format(balance.current_balance)}`}
                icon={DollarSign}
                gradient="bg-gradient-ocean"
              />
            ))}
          </div>
        </div>

        {/* Top 3 Services du mois courant */}
        <h2 className="text-xl font-semibold text-foreground mb-4">Top 3 services du mois courant</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {topServices.length > 0 ? (
            topServices.map((service, index) => {
              const profitPercentage = totalProfit > 0 ? ((service.totalProfit / totalProfit) * 100).toFixed(1) : 0;
              return (
                <MetricCard
                  key={service.type}
                  title={service.type}
                  value={`${profitPercentage}%`}
                  change={`${service.count} ventes`}
                  changeType={index === 0 ? "positive" : "neutral"}
                  icon={index === 0 ? Target : index === 1 ? TrendingUp : DollarSign}
                  gradient={index === 0 ? "bg-gradient-ocean" : index === 1 ? "bg-gradient-tropical" : "bg-gradient-sunset"}
                />
              );
            })
          ) : (
            <div className="col-span-full text-center text-muted-foreground py-8">
              Aucune vente ce mois-ci
            </div>
          )}
        </div>

        {/* Agent Performance */}
        {Object.keys(agentStats).length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Performance des agents au mois courant</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {Object.entries(agentStats).map(([agent, stats]) => {
                const profitPercentage = totalProfit > 0 ? ((stats.profit / totalProfit) * 100).toFixed(1) : 0;
                return (
                  <MetricCard
                    key={agent}
                    title={agent}
                    value={`${profitPercentage}%`}
                    change={`${stats.sales} ventes`}
                    changeType="neutral"
                    icon={Users}
                    gradient="bg-gradient-ocean"
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Sales Table */}
        <RecentSalesTable />

        {/* Business Analyst ChatBot with comprehensive data */}
        <ChatBot agencyData={agencyData} />

      </div>
    </div>
  );
};

export default Dashboard;
