import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { format, isAfter, isBefore } from "date-fns";
import { Plane, Download, ArrowLeft, CalendarIcon, FileText, Filter } from "lucide-react";
import { useSales } from "@/hooks/useSales";
import { Link, useSearchParams } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import * as XLSX from 'xlsx';
import { iataCodes } from "@/data/iataCodes";
import { generateFacturationPdf } from "@/lib/pdf/facturationPdf";

const Facturation = () => {
  const { data: sales = [], isLoading } = useSales();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter states with URL sync
  const [dateFrom, setDateFrom] = useState<Date | undefined>(() => {
    const from = searchParams.get("from");
    return from ? new Date(from) : undefined;
  });
  const [dateTo, setDateTo] = useState<Date | undefined>(() => {
    const to = searchParams.get("to");
    return to ? new Date(to) : undefined;
  });
  const [selectedSystems, setSelectedSystems] = useState<string[]>(() => {
    const systems = searchParams.get("systems");
    return systems ? systems.split(',') : ['AR', 'TTP'];
  });

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (dateFrom) params.set("from", dateFrom.toISOString().split('T')[0]);
    if (dateTo) params.set("to", dateTo.toISOString().split('T')[0]);
    if (selectedSystems.length > 0) params.set("systems", selectedSystems.join(','));
    
    setSearchParams(params, { replace: true });
  }, [dateFrom, dateTo, selectedSystems, setSearchParams]);

  // Get all airports in Morocco from IATA codes
  const moroccanAirports = iataCodes
    .filter(airport => airport.country === "Morocco")
    .map(airport => airport.code);

  // Filter sales by selected systems and date range
  const facturationSales = useMemo(() => {
    return sales.filter(sale => {
      // System filter
      if (selectedSystems.length > 0 && !selectedSystems.includes(sale.system)) {
        return false;
      }

      // Date range filter
      if (dateFrom && isBefore(sale.createdAt, dateFrom)) {
        return false;
      }
      if (dateTo && isAfter(sale.createdAt, new Date(dateTo.getTime() + 24 * 60 * 60 * 1000))) { // Include full day
        return false;
      }

      return true;
    });
  }, [sales, selectedSystems, dateFrom, dateTo]);

  // Calculate fees based on service type and airports
  const calculateFees = (saleType: string, fromAirport?: string, toAirport?: string) => {
    // For Flight Confirmed, use airport-based logic
    if (saleType === "Flight Confirmed") {
      if (!fromAirport || !toAirport) return 40; // Default to international if airports unknown
      
      const isFromMorocco = moroccanAirports.includes(fromAirport);
      const isToMorocco = moroccanAirports.includes(toAirport);
      
      // If both airports are in Morocco, 20 DH, otherwise 40 DH
      return (isFromMorocco && isToMorocco) ? 20 : 40;
    }
    
    // For all other services, fixed 20 DH fee
    return 20;
  };

  const handleSystemToggle = (system: string, checked: boolean) => {
    setSelectedSystems(prev => 
      checked 
        ? [...prev, system]
        : prev.filter(s => s !== system)
    );
  };

  const clearFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setSelectedSystems(['AR', 'TTP']);
  };

  const downloadExcel = () => {
    if (facturationSales.length === 0) return;

    const excelData = facturationSales.map(sale => {
      const fees = calculateFees(sale.type, sale.fromAirport, sale.toAirport);
      const tva = Math.round(fees * 0.2 * 100) / 100; // 20% of fees, rounded to 2 decimals
      return {
        'ID': sale.numericId,
        'Client': sale.clientName,
        'Service': sale.type,
        'Prix d\'achat (DH)': sale.buyingPrice,
        'Prix de vente (DH)': sale.buyingPrice + fees,
        'Fees (DH)': fees,
        'TVA (DH)': tva,
        'Date': format(sale.createdAt, 'dd/MM/yyyy'),
        'De': sale.fromAirport || '',
        'À': sale.toAirport || '',
        'Système': sale.system
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Facturation');
    
    const fileName = `facturation_${selectedSystems.join('_')}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const generatePdf = () => {
    if (facturationSales.length === 0) return;

    const pdfData = facturationSales.map(sale => {
      const fees = calculateFees(sale.type, sale.fromAirport, sale.toAirport);
      const tva = Math.round(fees * 0.2 * 100) / 100;
      
      return {
        clientName: sale.clientName,
        service: sale.type,
        buyingPrice: sale.buyingPrice,
        fees,
        tva,
        date: format(sale.createdAt, 'dd/MM/yyyy'),
        system: sale.system,
        fromAirport: sale.fromAirport,
        toAirport: sale.toAirport,
        numericId: sale.numericId
      };
    });

    generateFacturationPdf(pdfData, {
      dateFrom,
      dateTo,
      systems: selectedSystems,
      agencyInfo: {
        name: "Honorable Voyage",
        address: "Adresse de l'agence",
        phone: "+212 XXX XXX XXX",
        email: "contact@honorablevoyage.com"
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Facturation des services
            </h1>
            <p className="text-muted-foreground">
              Gestion de la facturation avec filtres et export PDF/Excel
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour au tableau de bord
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card className="shadow-card mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtres de facturation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* First row - Date filters */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Date From */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[200px] justify-start text-left font-normal",
                        !dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "dd/MM/yyyy") : <span>Date de début</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                {/* Date To */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[200px] justify-start text-left font-normal",
                        !dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "dd/MM/yyyy") : <span>Date de fin</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                  Réinitialiser
                </Button>
              </div>

              {/* Second row - System toggles */}
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm font-medium text-foreground">Systèmes :</span>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="system-ar"
                    checked={selectedSystems.includes('AR')}
                    onCheckedChange={(checked) => handleSystemToggle('AR', !!checked)}
                  />
                  <label htmlFor="system-ar" className="text-sm font-medium">
                    Accelaero (AR)
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="system-ttp"
                    checked={selectedSystems.includes('TTP')}
                    onCheckedChange={(checked) => handleSystemToggle('TTP', !!checked)}
                  />
                  <label htmlFor="system-ttp" className="text-sm font-medium">
                    Top Travel Trip (TTP)
                  </label>
                </div>

              </div>
            </div>
          </CardContent>
        </Card>

        {/* Facturation Table */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground">
              Services filtrés ({facturationSales.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={generatePdf} disabled={facturationSales.length === 0}>
                <FileText className="h-4 w-4 mr-2" />
                Générer facture PDF
              </Button>
              <Button variant="outline" size="sm" onClick={downloadExcel} disabled={facturationSales.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Exporter Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {facturationSales.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Aucun service ne correspond aux filtres sélectionnés</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Client
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Service
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
                        TVA (20%)
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
                    {facturationSales.map((sale) => {
                      const fees = calculateFees(sale.type, sale.fromAirport, sale.toAirport);
                      const tva = Math.round(fees * 0.2 * 100) / 100; // 20% of fees, rounded to 2 decimals
                      return (
                        <tr key={sale.id} className="border-b border-border/50 hover:bg-muted/50">
                          <td className="py-3 px-2">
                            <div className="text-sm font-medium text-foreground">
                              {sale.clientName}
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <Badge variant="secondary" className="text-xs">
                              {sale.type}
                            </Badge>
                          </td>
                          <td className="py-3 px-2">
                            <span className="text-sm text-foreground">
                              {sale.buyingPrice.toLocaleString()} DH
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <span className="text-sm font-medium text-foreground">
                              {(sale.buyingPrice + fees).toLocaleString()} DH
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <span className="text-sm font-medium text-primary">
                              {fees} DH
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <span className="text-sm font-medium text-primary">
                              {tva} DH
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <span className="text-sm text-muted-foreground">
                              {format(sale.createdAt, "dd/MM/yyyy")}
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
                              <div className="text-xs text-muted-foreground">
                                {sale.system}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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

export default Facturation;