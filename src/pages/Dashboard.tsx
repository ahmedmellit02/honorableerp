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
            Travel Agency Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track your sales performance and manage bookings
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Sales"
            value={totalSales.toString()}
            change="+12% from last month"
            changeType="positive"
            icon={TrendingUp}
            gradient="bg-gradient-ocean"
          />
          <MetricCard
            title="Total Revenue"
            value={`${totalRevenue.toLocaleString()} DH`}
            change="+8.2% from last month"
            changeType="positive"
            icon={DollarSign}
            gradient="bg-gradient-tropical"
          />
          <MetricCard
            title="Total Profit"
            value={`${totalProfit.toLocaleString()} DH`}
            change="+15.3% from last month"
            changeType="positive"
            icon={Target}
            gradient="bg-gradient-sunset"
          />
          <MetricCard
            title="Avg Sale Value"
            value={`${Math.round(avgSaleValue).toLocaleString()} DH`}
            change="+5.1% from last month"
            changeType="positive"
            icon={Calendar}
            gradient="bg-gradient-ocean"
          />
        </div>

        {/* Booking Type Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Flight Bookings"
            value={flightBookings.toString()}
            change="Most popular service"
            changeType="neutral"
            icon={Plane}
            gradient="bg-gradient-ocean"
          />
          <MetricCard
            title="Hotel Bookings"
            value={hotelBookings.toString()}
            change="Growing segment"
            changeType="positive"
            icon={Hotel}
            gradient="bg-gradient-tropical"
          />
          <MetricCard
            title="Organized Tours"
            value={voyageBookings.toString()}
            change="High value sales"
            changeType="positive"
            icon={MapPin}
            gradient="bg-gradient-sunset"
          />
        </div>

        {/* Agent Performance */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Agent Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(agentStats).map(([agent, stats]) => (
              <MetricCard
                key={agent}
                title={agent}
                value={`${stats.revenue.toLocaleString()} DH`}
                change={`${stats.sales} sales • ${Math.round((stats.revenue / stats.target) * 100)}% of target`}
                changeType={stats.revenue >= stats.target ? "positive" : "neutral"}
                icon={Users}
                gradient={agent === topAgent[0] ? "bg-gradient-sunset" : "bg-gradient-ocean"}
              />
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <SalesChart />
          <BookingTypePieChart />
        </div>

        {/* Recent Sales Table */}
        <RecentSalesTable />
      </div>
    </div>
  );
};

export default Dashboard;