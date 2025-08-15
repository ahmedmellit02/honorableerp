import MetricCard from "@/components/dashboard/MetricCard";
import SalesChart from "@/components/dashboard/SalesChart";
import BookingTypePieChart from "@/components/dashboard/BookingTypePieChart";
import RecentSalesTable from "@/components/dashboard/RecentSalesTable";
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
import { mockSales, agentStats, bookingTypeData } from "@/data/mockData";

const Dashboard = () => {
  // Calculate metrics
  const totalSales = mockSales.length;
  const totalRevenue = mockSales.reduce((sum, sale) => sum + sale.sellingPrice, 0);
  const totalProfit = mockSales.reduce((sum, sale) => sum + sale.profit, 0);
  const avgSaleValue = totalRevenue / totalSales;

  const flightBookings = bookingTypeData.find(b => b.type === "Flight Booking")?.count || 0;
  const hotelBookings = bookingTypeData.find(b => b.type === "Hotel Booking")?.count || 0;
  const voyageBookings = bookingTypeData.find(b => b.type === "Voyage Organisé")?.count || 0;

  const topAgent = Object.entries(agentStats).reduce((a, b) => 
    agentStats[a[0] as keyof typeof agentStats].revenue > agentStats[b[0] as keyof typeof agentStats].revenue ? a : b
  );

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
            // change="+12% par rapport au mois dernier"
            // changeType="positive"
            icon={TrendingUp}
            gradient="bg-gradient-ocean"
          />
          <MetricCard
            title="Revenu total"
            value={`${totalRevenue.toLocaleString()} DH`}
            // change="+8.2% par rapport au mois dernier"
            // changeType="positive"
            icon={DollarSign}
            gradient="bg-gradient-tropical"
          />
          <MetricCard
            title="Bénéfice total"
            value={`${totalProfit.toLocaleString()} DH`}
            // change="+15.3% par rapport au mois dernier"
            // changeType="positive"
            icon={Target}
            gradient="bg-gradient-sunset"
          />
          <MetricCard
            title="Valeur moyenne"
            value={`${Math.round(avgSaleValue).toLocaleString()} DH`}
            // change="+5.1% par rapport au mois dernier"
            // changeType="positive"
            icon={Calendar}
            gradient="bg-gradient-ocean"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <SalesChart />
          <BookingTypePieChart />
        </div>

        {/* Service per Type */}
        <h2 className="text-xl font-semibold text-foreground mb-4">Services par type</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <MetricCard
            title="Réservations de vol"
            value={flightBookings.toString()}
            change="Service le plus populaire"
            changeType="neutral"
            icon={Plane}
            gradient="bg-gradient-ocean"
          />
          <MetricCard
            title="Réservations d'hôtel"
            value={hotelBookings.toString()}
            change="Segment en croissance"
            changeType="positive"
            icon={Hotel}
            gradient="bg-gradient-tropical"
          />
          <MetricCard
            title="Circuits organisés"
            value={voyageBookings.toString()}
            change="Ventes à haute valeur"
            changeType="positive"
            icon={MapPin}
            gradient="bg-gradient-sunset"
          />
        </div>

        {/* Agent Performance */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Performance des agents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(agentStats).map(([agent, stats]) => (
              <MetricCard
                key={agent}
                title={agent}
                value={`${stats.revenue.toLocaleString()} DH`}
                change={`${stats.sales} ventes • ${Math.round((stats.revenue / stats.target) * 100)}% de l'objectif`}
                changeType={stats.revenue >= stats.target ? "positive" : "neutral"}
                icon={Users}
                gradient={agent === topAgent[0] ? "bg-gradient-sunset" : "bg-gradient-ocean"}
              />
            ))}
          </div>
        </div>

        {/* Recent Sales Table */}
        <RecentSalesTable />
      </div>
    </div>
  );
};

export default Dashboard;