
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useSalesYearly } from "@/hooks/useSales";

const SalesChart = () => {
  const { data: yearlyData = [], isLoading } = useSalesYearly();

  if (isLoading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Ventes et bénéfices annuels
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

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Ventes et bénéfices annuels
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={yearlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))"
              }}
              formatter={(value, name) => [
                name === "sales" ? `${value} ventes` : `${Number(value).toLocaleString()} DH`,
                name === "sales" ? "Nombre de ventes" : "Bénéfice"
              ]}
            />
            <Bar 
              dataKey="sales" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]}
              name="sales"
            />
            <Bar 
              dataKey="profit" 
              fill="hsl(var(--accent))" 
              radius={[4, 4, 0, 0]}
              name="profit"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SalesChart;
