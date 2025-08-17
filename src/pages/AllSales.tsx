import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/ui/navigation";
import { format } from "date-fns";
import { Plane, Hotel, MapPin, LuggageIcon, Shield, SailboatIcon, Undo2Icon, ArrowLeft, Download, Euro, CheckCircle } from "lucide-react";
import { useSales } from "@/hooks/useSales";
import { useUserRole, useCashInSale } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import * as XLSX from 'xlsx';

const AllSales = () => {
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
      'Notes': sale.notes || '',
      'Date de création': format(sale.createdAt, 'dd/MM/yyyy HH:mm')
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventes');
    
    const fileName = `toutes_ventes_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
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
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
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
          <Button variant="outline" onClick={downloadExcel} disabled={sales.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Télécharger Excel
          </Button>
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
                    {sales.map((sale) => (
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AllSales;