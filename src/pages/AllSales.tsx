import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, isAfter, isBefore, isSameDay } from "date-fns";
import { Plane, Hotel, MapPin, LuggageIcon, Shield, SailboatIcon, Undo2Icon, ArrowLeft, Download, Euro, CheckCircle, Search, Filter, X, CalendarIcon, BarChart3, TrendingUp } from "lucide-react";
import { useSales } from "@/hooks/useSales";
import { useSimpleRole } from "@/hooks/useSimpleRole";
import { useCashInSale } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { Link, useSearchParams } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import * as XLSX from 'xlsx';

const AllSales = () => {
  const { data: sales = [], isLoading } = useSales();
  const { userRole, canCashIn } = useSimpleRole();
  const cashInMutation = useCashInSale();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter states with URL sync
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("search") || "");
  const [typeFilter, setTypeFilter] = useState<string>(() => searchParams.get("type") || "all");
  const [agentFilter, setAgentFilter] = useState<string>(() => searchParams.get("agent") || "all");
  const [systemFilter, setSystemFilter] = useState<string>(() => searchParams.get("system") || "all");
  const [statusFilter, setStatusFilter] = useState<string>(() => searchParams.get("status") || "all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(() => {
    const from = searchParams.get("from");
    return from ? new Date(from) : undefined;
  });
  const [dateTo, setDateTo] = useState<Date | undefined>(() => {
    const to = searchParams.get("to");
    return to ? new Date(to) : undefined;
  });

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (agentFilter !== "all") params.set("agent", agentFilter);
    if (systemFilter !== "all") params.set("system", systemFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (dateFrom) params.set("from", dateFrom.toISOString().split('T')[0]);
    if (dateTo) params.set("to", dateTo.toISOString().split('T')[0]);
    
    setSearchParams(params, { replace: true });
  }, [searchQuery, typeFilter, agentFilter, systemFilter, statusFilter, dateFrom, dateTo, setSearchParams]);

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

  // Filtered sales
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      // Search filter
      if (searchQuery && !sale.clientName.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !sale.phoneNumber.includes(searchQuery) && 
          !sale.pnr?.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !sale.numericId.toString().includes(searchQuery)) {
        return false;
      }

      // Type filter
      if (typeFilter !== "all" && sale.type !== typeFilter) {
        return false;
      }

      // Agent filter
      if (agentFilter !== "all" && sale.agent !== agentFilter) {
        return false;
      }

      // System filter
      if (systemFilter !== "all" && sale.system !== systemFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === "cashed" && !sale.cashedIn) {
        return false;
      }
      if (statusFilter === "not-cashed" && sale.cashedIn) {
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
  }, [sales, searchQuery, typeFilter, agentFilter, systemFilter, statusFilter, dateFrom, dateTo]);

  // Calculate totals
  const totals = useMemo(() => {
    const count = filteredSales.length;
    const revenue = filteredSales.reduce((sum, sale) => sum + sale.sellingPrice, 0);
    const profit = filteredSales.reduce((sum, sale) => sum + sale.profit, 0);
    const cashedCount = filteredSales.filter(sale => sale.cashedIn).length;
    const notCashedCount = count - cashedCount;
    const cashedRevenue = filteredSales.filter(sale => sale.cashedIn).reduce((sum, sale) => sum + sale.sellingPrice, 0);
    const notCashedRevenue = revenue - cashedRevenue;

    return {
      count,
      revenue,
      profit,
      cashedCount,
      notCashedCount,
      cashedRevenue,
      notCashedRevenue
    };
  }, [filteredSales]);

  // Get unique values for filters
  const uniqueTypes = useMemo(() => [...new Set(sales.map(sale => sale.type))], [sales]);
  const uniqueAgents = useMemo(() => [...new Set(sales.map(sale => sale.agent))], [sales]);
  const uniqueSystems = useMemo(() => [...new Set(sales.map(sale => sale.system))], [sales]);

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setAgentFilter("all");
    setSystemFilter("all");
    setStatusFilter("all");
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const downloadExcel = () => {
    if (filteredSales.length === 0) return;

    const excelData = filteredSales.map(sale => ({
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
      'Destination': sale.destination || '',
      'De': sale.fromAirport || '',
      'À': sale.toAirport || '',
      'Enregistrement': sale.hasRegistration ? 'Oui' : 'Non',
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
                {filteredSales.length} vente{filteredSales.length !== 1 ? 's' : ''} 
                {filteredSales.length !== sales.length && ` sur ${sales.length} au total`}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={downloadExcel} disabled={filteredSales.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Télécharger Excel
          </Button>
        </div>

        {/* Filters */}
        <Card className="shadow-card mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtres de recherche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* First row of filters */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par client, téléphone, PNR, ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Type Filter */}
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Type de service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Types</SelectItem>
                    {uniqueTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Agent Filter */}
                <Select value={agentFilter} onValueChange={setAgentFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Agents</SelectItem>
                    {uniqueAgents.map(agent => (
                      <SelectItem key={agent} value={agent}>{agent}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* System Filter */}
                <Select value={systemFilter} onValueChange={setSystemFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Système" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Systèmes</SelectItem>
                    {uniqueSystems.map(system => (
                      <SelectItem key={system} value={system}>{system}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Statuts</SelectItem>
                    <SelectItem value="cashed">Encaissé</SelectItem>
                    <SelectItem value="not-cashed">Non encaissé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Second row - Date filters and clear button */}
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

                {/* Clear Filters */}
                <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Effacer tous les filtres
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Totals Summary */}
        <Card className="shadow-card mb-6 bg-gradient-sky border-accent/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-accent" />
              Résumé des ventes filtrées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Count */}
              <div className="text-center p-3 bg-background/60 rounded-lg border border-border/50">
                <div className="text-2xl font-bold text-primary">{totals.count}</div>
                <div className="text-sm text-muted-foreground">Ventes</div>
              </div>

              {/* Revenue */}
              <div className="text-center p-3 bg-background/60 rounded-lg border border-border/50">
                <div className="text-2xl font-bold text-accent">{totals.revenue.toLocaleString()} DH</div>
                <div className="text-sm text-muted-foreground">Chiffre d'affaires</div>
              </div>

              {/* Profit */}
              <div className="text-center p-3 bg-background/60 rounded-lg border border-border/50">
                <div className={`text-2xl font-bold ${totals.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {totals.profit >= 0 ? '+' : ''}{totals.profit.toLocaleString()} DH
                </div>
                <div className="text-sm text-muted-foreground">Bénéfice total</div>
              </div>

              {/* Cash Status */}
              <div className="text-center p-3 bg-background/60 rounded-lg border border-border/50">
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-success font-semibold">{totals.cashedCount}</span>
                    <span className="text-muted-foreground">encaissées</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Euro className="h-4 w-4 text-destructive" />
                    <span className="text-destructive font-semibold">{totals.notCashedCount}</span>
                    <span className="text-muted-foreground">non encaissées</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Liste complète des ventes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSales.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">
                  {sales.length === 0 ? "Aucune vente enregistrée" : "Aucune vente ne correspond aux filtres"}
                </p>
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
                         Détails
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
                    {filteredSales.map((sale) => (
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
                            {sale.buyingPrice.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-sm font-medium text-foreground">
                            {sale.sellingPrice.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`text-sm font-medium ${sale.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {sale.profit >= 0 ? '+' : ''}{sale.profit.toLocaleString()}
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
                           <span className="text-sm text-foreground">
                             {sale.type === "Flight Confirmed" && sale.fromAirport && sale.toAirport 
                               ? `${sale.fromAirport} → ${sale.toAirport}${sale.hasRegistration ? " • Enreg." : ""}`
                               : sale.type === "RW 1" && sale.rwDate && sale.rwTime 
                               ? `${sale.rwDate.toLocaleDateString()} à ${sale.rwTime}`
                               : sale.destination || "-"}
                           </span>
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