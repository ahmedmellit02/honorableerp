
import MetricCard from "@/components/dashboard/MetricCard";
import SalesChart from "@/components/dashboard/SalesChart";
import BookingTypePieChart from "@/components/dashboard/BookingTypePieChart";
import RecentSalesTable from "@/components/dashboard/RecentSalesTable";
import RoleAssignment from "@/components/RoleAssignment";
import Navigation from "@/components/ui/navigation";
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
import { useSales, useSalesMonthly, useSalesByType, useTopServicesCurrentMonth } from "@/hooks/useSales";

const Dashboard = () => {
  const { data: sales = [], isLoading: salesLoading } = useSales();
  const { data: monthlyData = [], isLoading: monthlyLoading } = useSalesMonthly();
  const { data: typeData = [], isLoading: typeLoading } = useSalesByType();
  const { data: topServices = [], isLoading: topServicesLoading } = useTopServicesCurrentMonth();

  // Calculate metrics from real data
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.sellingPrice, 0);
  const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);
  const avgSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;

  // Calculate agent stats from real data
  const agentStats = sales.reduce((acc, sale) => {
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

  const isLoading = salesLoading || monthlyLoading || typeLoading || topServicesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
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
    <div className="min-h-screen bg-background">
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

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            title="Valeur moyenne"
            value={`${Math.round(avgSaleValue).toLocaleString()} DH`}
            icon={Calendar}
            gradient="bg-gradient-ocean"
          />
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
            topServices.map((service, index) => (
              <MetricCard
                key={service.type}
                title={service.type}
                value={`${service.totalProfit.toLocaleString()} DH`}
                change={`${service.count} ventes`}
                changeType={index === 0 ? "positive" : "neutral"}
                icon={index === 0 ? Target : index === 1 ? TrendingUp : DollarSign}
                gradient={index === 0 ? "bg-gradient-ocean" : index === 1 ? "bg-gradient-tropical" : "bg-gradient-sunset"}
              />
            ))
          ) : (
            <div className="col-span-full text-center text-muted-foreground py-8">
              Aucune vente ce mois-ci
            </div>
          )}
        </div>

        {/* Agent Performance */}
        {Object.keys(agentStats).length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Performance des agents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(agentStats).map(([agent, stats]) => (
                <MetricCard
                  key={agent}
                  title={agent}
                  value={`${stats.profit.toLocaleString()} DH`}
                  change={`${stats.sales} ventes`}
                  changeType="neutral"
                  icon={Users}
                  gradient="bg-gradient-ocean"
                />
              ))}
            </div>
          </div>
        )}

        {/* Role Assignment */}
        <div className="mb-8">
          <RoleAssignment />
        </div>

        {/* Recent Sales Table */}
        <RecentSalesTable />
      </div>
    </div>
  );
};

export default Dashboard;
