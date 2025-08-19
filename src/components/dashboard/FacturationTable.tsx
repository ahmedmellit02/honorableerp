import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Plane, ExternalLink, Download } from "lucide-react";
import { useSales } from "@/hooks/useSales";
import { Link } from "react-router-dom";
import * as XLSX from 'xlsx';
import { iataCodes } from "@/data/iataCodes";

const FacturationTable = () => {
  const { data: sales = [], isLoading } = useSales();

  // Get all airports in Morocco from IATA codes
  const moroccanAirports = iataCodes
    .filter(airport => airport.country === "Morocco")
    .map(airport => airport.code);

  // Filter only Flight Confirmed sales
  const flightConfirmedSales = sales.filter(sale => sale.type === "Flight Confirmed");
  
  // Take the first 5 for display
  const recentFlightSales = flightConfirmedSales.slice(0, 5);

  // Calculate fees based on airports
  const calculateFees = (fromAirport?: string, toAirport?: string) => {
    if (!fromAirport || !toAirport) return 40; // Default to international if airports unknown
    
    const isFromMorocco = moroccanAirports.includes(fromAirport);
    const isToMorocco = moroccanAirports.includes(toAirport);
    
    // If both airports are in Morocco, 20 DH, otherwise 40 DH
    return (isFromMorocco && isToMorocco) ? 20 : 40;
  };

  const downloadExcel = () => {
    if (flightConfirmedSales.length === 0) return;

    const excelData = flightConfirmedSales.map(sale => ({
      'ID': sale.numericId,
      'Client': sale.clientName,
      'Prix d\'achat (DH)': sale.buyingPrice,
      'Prix de vente (DH)': sale.sellingPrice,
      'Fees (DH)': calculateFees(sale.fromAirport, sale.toAirport),
      'Date': format(sale.createdAt, 'dd/MM/yyyy'),
      'De': sale.fromAirport || '',
      'À': sale.toAirport || '',
      'PNR': sale.pnr || '',
      'Téléphone': sale.phoneNumber
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Facturation');
    
    const fileName = `facturation_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  if (isLoading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Facturation (Vols confirmés)
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

  if (recentFlightSales.length === 0) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Facturation (Vols confirmés)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Aucun vol confirmé enregistré</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-foreground">
          Facturation (Vols confirmés)
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={downloadExcel}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/facturation" className="flex items-center gap-2">
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
                  Client
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                  Prix d'achat
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                  Prix de vente
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                  Fees
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                  Date
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                  Détails
                </th>
              </tr>
            </thead>
            <tbody>
              {recentFlightSales.map((sale) => {
                const fees = calculateFees(sale.fromAirport, sale.toAirport);
                return (
                  <tr key={sale.id} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-3 px-2">
                      <div className="text-sm font-medium text-foreground">
                        {sale.clientName}
                      </div>
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
                      <span className="text-sm font-medium text-primary">
                        {fees} DH
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-sm text-muted-foreground">
                        {format(sale.createdAt, "dd MMM")}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div>
                        <Badge 
                          variant="outline" 
                          className="flex items-center gap-1 w-fit mb-1"
                        >
                          <Plane className="h-3 w-3" />
                          <span className="text-xs">#{sale.numericId}</span>
                        </Badge>
                        {sale.fromAirport && sale.toAirport && (
                          <div className="text-xs text-muted-foreground">
                            {sale.fromAirport} → {sale.toAirport}
                          </div>
                        )}
                        {sale.pnr && (
                          <div className="text-xs text-muted-foreground">
                            PNR: {sale.pnr}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default FacturationTable;