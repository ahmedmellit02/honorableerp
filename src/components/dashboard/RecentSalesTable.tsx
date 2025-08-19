
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Plane, Hotel, MapPin, LuggageIcon, Shield, SailboatIcon, Undo2Icon, ExternalLink, Download, Euro, CheckCircle } from "lucide-react";
import { useSales } from "@/hooks/useSales";
import { useUserRole, useCashInSale } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import * as XLSX from 'xlsx';

const RecentSalesTable = () => {
  const { data: sales = [], isLoading } = useSales();
  const { data: userRole } = useUserRole();
  const cashInMutation = useCashInSale();
  const { toast } = useToast();

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

  const handleCashIn = async (saleId: string) => {
    try {
      await cashInMutation.mutateAsync(saleId);
      toast({
        title: "Encaissement réussi",
        description: "La vente a été marquée comme encaissée.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'encaisser cette vente.",
        variant: "destructive",
      });
    }
  };

  const downloadExcel = () => {
    if (sales.length === 0) return;

    const excelData = sales.map(sale => ({
      'ID': sale.numericId,
      'Type': sale.type,
      'Client': sale.clientName,
      'Téléphone': sale.phoneNumber,
      'PNR': sale.pnr || '',
      'Agent': sale.agent,
      'Système': sale.system,
      'Prix d\'achat (DH)': sale.buyingPrice,
      'Prix de vente (DH)': sale.sellingPrice,
      'Bénéfice (DH)': sale.profit,
      'Date de départ': format(sale.departureDate, 'dd/MM/yyyy'),
      'Heure de départ': sale.departureTime,
      'De': sale.fromAirport || '',
      'À': sale.toAirport || '',
      'Enregistrement': sale.hasRegistration ? 'Oui' : 'Non',
      'Date de création': format(sale.createdAt, 'dd/MM/yyyy HH:mm')
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventes');
    
    const fileName = `ventes_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-foreground">
          Ventes récentes
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={downloadExcel}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/sales" className="flex items-center gap-2">
              Voir tout
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
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
                  Prix de vente
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                  Bénéfice
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                  Date
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                  Statut
                </th>
                {userRole === 'cashier' && (
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                    Encaissement
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {recentSales.map((sale) => (
                <tr key={sale.id} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="py-3 px-2">
                    <span className="text-sm font-medium text-foreground">
                      #{sale.numericId}
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
                       {sale.type === "Flight Confirmed" && sale.fromAirport && sale.toAirport && (
                         <div className="text-xs text-muted-foreground">
                           {sale.fromAirport} → {sale.toAirport}
                           {sale.hasRegistration && " • Enregistrement"}
                         </div>
                       )}
                       {sale.type === "RW 1" && sale.rwDate && sale.rwTime && (
                         <div className="text-xs text-muted-foreground">
                           RW: {sale.rwDate.toLocaleDateString()} à {sale.rwTime}
                         </div>
                       )}
                     </div>
                   </td>
                  <td className="py-3 px-2">
                    <span className="text-sm text-foreground">{sale.agent}</span>
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-sm font-medium text-foreground">
                      {sale.sellingPrice.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-sm font-medium text-success">
                      +{sale.profit.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="text-sm">
                      <div className="text-foreground font-medium">
                        {format(sale.departureDate, "dd MMM yyyy")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {sale.departureTime}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    {sale.cashedIn ? (
                      <Badge variant="outline" className="flex items-center gap-1 text-success border-success w-fit">
                        <CheckCircle className="h-3 w-3" />
                        Encaissé
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center gap-1 text-destructive border-destructive w-fit">
                        <Euro className="h-3 w-3" />
                        Non encaissé
                      </Badge>
                    )}
                  </td>
                  {userRole === 'cashier' && (
                    <td className="py-3 px-2">
                      {!sale.cashedIn && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCashIn(sale.id)}
                          disabled={cashInMutation.isPending}
                          className="text-xs hover:bg-success hover:text-white hover:border-success"
                        >
                          <Euro className="h-3 w-3 mr-1" />
                          Encaisser
                        </Button>
                      )}
                    </td>
                  )}
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
