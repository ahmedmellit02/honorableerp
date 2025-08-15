import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/ui/navigation";
import { format } from "date-fns";
import { Plane, Hotel, MapPin, LuggageIcon, Shield, SailboatIcon, Undo2Icon, ArrowLeft } from "lucide-react";
import { useSales } from "@/hooks/useSales";
import { Link } from "react-router-dom";

const AllSales = () => {
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
        <div className="mb-8 flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Toutes les ventes
            </h1>
            <p className="text-muted-foreground">
              {sales.length} vente{sales.length > 1 ? 's' : ''} au total
            </p>
          </div>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Liste complète des ventes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sales.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Aucune vente enregistrée</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        ID
                      </th>
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
                        Système
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Prix d'achat
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Prix de vente
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Bénéfice
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Date de départ
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Date de création
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale) => (
                      <tr key={sale.id} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <span className="text-xs font-mono text-muted-foreground">
                            {sale.id.slice(0, 8)}...
                          </span>
                        </td>
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
                            {sale.pnr && (
                              <div className="text-xs text-muted-foreground">
                                PNR: {sale.pnr}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-sm text-foreground">{sale.agent}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-sm text-foreground">{sale.system}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-sm text-foreground">
                            {sale.buyingPrice.toLocaleString()} DH
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-sm font-medium text-foreground">
                            {sale.sellingPrice.toLocaleString()} DH
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`text-sm font-medium ${sale.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {sale.profit >= 0 ? '+' : ''}{sale.profit.toLocaleString()} DH
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <div>
                            <div className="text-sm text-foreground">
                              {format(sale.departureDate, "dd/MM/yyyy")}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {sale.departureTime}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-sm text-muted-foreground">
                            {format(sale.createdAt, "dd/MM/yyyy HH:mm")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AllSales;