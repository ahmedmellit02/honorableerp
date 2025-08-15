
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Plane, Hotel, MapPin, LuggageIcon, Shield, SailboatIcon, Undo2Icon } from "lucide-react";
import { useSales } from "@/hooks/useSales";

const RecentSalesTable = () => {
  const { data: sales = [], isLoading } = useSales();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Flight Confirmed":
      case "Flight On Hold":
      case "Flight Changing":
        return <Plane className="h-4 w-4" />;
      case "Hotel Booking":
        return <Hotel className="h-4 w-4" />;
      case "Organized Travel":
        return <MapPin className="h-4 w-4" />;
      case "Boat Booking":
        return <SailboatIcon className="h-4 w-4" />;
      case "Travel Insurance":
        return <Shield className="h-4 w-4" />;
      case "Extra Baggage":
        return <LuggageIcon className="h-4 w-4" />;
      case "RW 1":
      case "RW 2":
        return <Undo2Icon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // const getTypeColor = (type: string) => {
  //   switch (type) {
  //     case "Flight Confirmed":
  //     case "Flight On Hold":
  //     case "Flight Changing":
  //       return "bg-blue-100 text-blue-800 border-blue-200";
  //     case "Hotel Booking":
  //       return "bg-green-100 text-green-800 border-green-200";
  //     case "Organized Travel":
  //       return "bg-orange-100 text-orange-800 border-orange-200";
  //     case "Boat Booking":
  //       return "bg-purple-100 text-purple-800 border-purple-200";
  //     case "Travel Insurance":
  //       return "bg-red-100 text-red-800 border-red-200";
  //     case "RW 1":
  //     case "RW 2":
  //       return "bg-red-100 text-red-800 border-red-200";
  //     case "Extra Baggage":
  //       return "bg-green-100 text-green-800 border-green-200";
  //     default:
  //       return "bg-gray-100 text-gray-800 border-gray-200";
  //   }
  // };

  const recentSales = sales.slice(0, 5);

  if (isLoading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Ventes récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recentSales.length === 0) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Ventes récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Aucune vente enregistrée</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Ventes récentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                  Type
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                  Client
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                  Agent
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                  Prix de vente
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                  Bénéfice
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map((sale) => (
                <tr key={sale.id} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="py-3 px-2">
                    <Badge 
                      variant="outline" 
                      className={`flex items-center gap-1 w-fit`}
                    >
                      {getTypeIcon(sale.type)}
                      <span className="text-xs">{sale.type}</span>
                    </Badge>
                  </td>
                  <td className="py-3 px-2">
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {sale.clientName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {sale.phoneNumber}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-sm text-foreground">{sale.agent}</span>
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-sm font-medium text-foreground">
                      {sale.sellingPrice.toLocaleString()} DH
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-sm font-medium text-success">
                      +{sale.profit.toLocaleString()} DH
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-sm text-muted-foreground">
                      {format(sale.createdAt, "dd MMM")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentSalesTable;
