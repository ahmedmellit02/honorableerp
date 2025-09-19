
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useSalesByTypeYearly } from "@/hooks/useSales";

const BookingTypePieChart = () => {
  const { data: bookingTypeData = [], isLoading } = useSalesByTypeYearly();

  const renderCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-card">
          <p className="text-sm font-medium text-foreground">{data.type}</p>
          <p className="text-sm text-muted-foreground">Nombre: {data.count}</p>
          <p className="text-sm text-muted-foreground">Bénéfice: {Number(data.profit).toLocaleString()} DH</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Ventes par type ({new Date().getFullYear()})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (bookingTypeData.length === 0) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Ventes par type ({new Date().getFullYear()})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Aucune donnée disponible</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Ventes par type ({new Date().getFullYear()})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={bookingTypeData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              dataKey="count"
              stroke="none"
            >
              {bookingTypeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={renderCustomTooltip} />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              formatter={(value, entry: any) => (
                <span style={{ color: entry.color }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default BookingTypePieChart;
