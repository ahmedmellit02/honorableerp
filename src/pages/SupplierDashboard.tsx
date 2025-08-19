import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePermissions } from "@/hooks/usePermissions";
import Navigation from "@/components/ui/navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DollarSign, TrendingUp } from "lucide-react";
import RecentSalesTable from "@/components/dashboard/RecentSalesTable";
import { useNavigate } from "react-router-dom";

const SupplierDashboard = () => {
  const { user } = useAuth();
  const { getSupplierSystem, isSupplier } = usePermissions();
  const [balance, setBalance] = useState<number>(0);
  const [supplierSales, setSupplierSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const supplierSystem = getSupplierSystem();

  useEffect(() => {
    // Redirect non-suppliers
    if (!isSupplier()) {
      navigate("/");
      return;
    }

    const fetchSupplierData = async () => {
      if (!supplierSystem) return;

      try {
        // Fetch balance for the supplier's system
        const { data: balanceData, error: balanceError } = await supabase
          .rpc('get_system_balance', { system_name: supplierSystem });

        if (balanceError) {
          console.error('Error fetching balance:', balanceError);
        } else {
          setBalance(balanceData || 0);
        }

        // Fetch recent sales for the supplier's system
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select('*')
          .eq('system', supplierSystem === 'Top Travel Trip (TTP)' ? 'TTP' : 'AR')
          .order('created_at', { ascending: false })
          .limit(10);

        if (salesError) {
          console.error('Error fetching sales:', salesError);
        } else {
          setSupplierSales(salesData || []);
        }
      } catch (error) {
        console.error('Error fetching supplier data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierData();
  }, [supplierSystem, isSupplier, navigate]);

  if (!isSupplier()) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Tableau de bord - {supplierSystem}
          </h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de votre système
          </p>
        </div>

        {/* Balance and Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Solde Théorique</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {balance.toLocaleString()} DH
              </div>
              <p className="text-xs text-muted-foreground">
                Solde actuel du système {supplierSystem}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventes Récentes</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {supplierSales.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Dernières transactions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sales Table */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Ventes Récentes - {supplierSystem}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {supplierSales.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">Aucune vente enregistrée pour ce système</p>
                </div>
              ) : (
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
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplierSales.map((sale) => (
                      <tr key={sale.id} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <span className="text-sm font-medium text-foreground">
                            #{sale.numeric_id}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-sm text-foreground">{sale.type}</span>
                        </td>
                        <td className="py-3 px-2">
                          <div>
                            <div className="text-sm font-medium text-foreground">
                              {sale.client_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {sale.phone_number}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-sm text-foreground">{sale.agent}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-sm font-medium text-foreground">
                            {sale.selling_price.toLocaleString()} DH
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-sm text-muted-foreground">
                            {new Date(sale.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupplierDashboard;