
import MetricCard from "@/components/dashboard/MetricCard";
import SalesChart from "@/components/dashboard/SalesChart";
import BookingTypePieChart from "@/components/dashboard/BookingTypePieChart";
import RecentSalesTable from "@/components/dashboard/RecentSalesTable";
import FacturationTable from "@/components/dashboard/FacturationTable";
import Navigation from "@/components/ui/navigation";
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

const Dashboard = () => {
  const { user } = useAuth();
  const { userRole, canViewMonthlyStats, canViewDashboard, loading: roleLoading } = useSimpleRole();
  const { data: sales = [], isLoading: salesLoading } = useSales();
  const { data: dailyData = [], isLoading: dailyLoading } = useSalesDaily();
  const { data: typeData = [], isLoading: typeLoading } = useSalesByType();
  const { data: topServices = [], isLoading: topServicesLoading } = useTopServicesCurrentMonth();
  const { data: systemBalances = [], isLoading: balanceLoading } = useSystemBalances();

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
  const avgProfitPerSale = totalSales > 0 ? totalProfit / totalSales : 0;

  // Calculate daily metrics (today's sales only)
  const today = new Date().toDateString();
  const todaySales = sales.filter(sale => sale.createdAt.toDateString() === today);
  const dailySalesCount = todaySales.length;
  const dailyRevenue = todaySales.reduce((sum, sale) => sum + sale.sellingPrice, 0);
  const dailyProfit = todaySales.reduce((sum, sale) => sum + sale.profit, 0);
  const dailyAvgProfitPerSale = dailySalesCount > 0 ? dailyProfit / dailySalesCount : 0;

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

  const isLoading = salesLoading || dailyLoading || typeLoading || topServicesLoading || balanceLoading || roleLoading;

  // Check permissions for different dashboard sections  
  const showMonthlyStats = canViewMonthlyStats();
  const showDashboard = canViewDashboard();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <Navigation />
      
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
              title="Revenu du jour"
              value={`${dailyRevenue.toLocaleString()} DH`}
              icon={DollarSign}
              gradient="bg-gradient-sunset"
            />
            <MetricCard
              title="Bénéfice du jour"
              value={`${dailyProfit.toLocaleString()} DH`}
              icon={Target}
              gradient="bg-gradient-ocean"
            />
            <MetricCard
              title="Valeur moyenne du jour (bénéfice)"
              value={`${Math.round(dailyAvgProfitPerSale).toLocaleString()} DH`}
              icon={Calendar}
              gradient="bg-gradient-tropical"
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
                title="Revenu total"
                value={`${totalRevenue.toLocaleString()} DH`}
                icon={DollarSign}
                gradient="bg-gradient-tropical"
              />
              <MetricCard
                title="Bénéfice total"
                value={`${totalProfit.toLocaleString()} DH`}
                icon={Target}
                gradient="bg-gradient-sunset"
              />
              <MetricCard
                title="Valeur moyenne (bénéfice)"
                value={`${Math.round(avgProfitPerSale).toLocaleString()} DH`}
                icon={Calendar}
                gradient="bg-gradient-ocean"
              />
            </div>
          </div>
        )}

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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <SalesChart />
          <BookingTypePieChart />
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

        {/* Facturation Table - Only for Manager, Cashier, and Super Agent */}
        {(userRole === 'manager' || userRole === 'cashier' || userRole === 'super_agent') && (
          <div className="mt-8">
            <FacturationTable />
          </div>
        )}
      </div>
      
      {/* Chatbot for managers */}
      {userRole === 'manager' && (
        <ChatBot 
          salesData={{
            dailySales: { totalSales: dailySalesCount, totalRevenue: dailyRevenue, totalProfit: dailyProfit },
            monthlySales: { totalSales, totalRevenue, totalProfit, avgProfitPerSale },
            agentPerformance: agentStats,
            bookingTypes: { flightBookings, hotelBookings, organizedTravel },
            systemBalances: systemBalances || [],
            topServices: topServices || []
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
