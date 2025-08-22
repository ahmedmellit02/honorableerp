import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/ui/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Navigate } from "react-router-dom";

interface Expense {
  id: string;
  amount: number;
  description: string;
  created_at: string;
  classification: string | null;
  approved: boolean;
  approved_at: string | null;
  approved_by: string | null;
  classified_at: string | null;
  classified_by: string | null;
}

const ExpenseControl = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({
    amount: "",
    description: ""
  });
  const [loading, setLoading] = useState(true);
  const [isClassifying, setIsClassifying] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: userRole, isLoading: roleLoading } = useUserRole();

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Protect route from agents - after all hooks are called
  if (roleLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  if (userRole === 'agent') {
    return <Navigate to="/" replace />;
  }

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les charges.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newExpense.amount || !newExpense.description.trim()) {
      toast({
        title: "Erreur",
        description: "Tous les champs sont obligatoires.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour ajouter une charge.",
        variant: "destructive",
      });
      return;
    }

    setIsAddingExpense(true);

    try {
      const { error } = await supabase
        .from("expenses")
        .insert({
          user_id: user.id,
          amount: parseFloat(newExpense.amount),
          description: newExpense.description.trim()
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Charge ajoutée avec succès.",
      });

      setNewExpense({ amount: "", description: "" });
      fetchExpenses();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter la charge.",
        variant: "destructive",
      });
    } finally {
      setIsAddingExpense(false);
    }
  };

  const handleClassifyExpense = async (expenseId: string, classification: string) => {
    setIsClassifying(expenseId);
    
    try {
      const { error } = await supabase
        .from("expenses")
        .update({
          classification,
          classified_at: new Date().toISOString(),
          classified_by: user?.id
        })
        .eq("id", expenseId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Charge classifiée avec succès.",
      });

      fetchExpenses();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de classifier la charge.",
        variant: "destructive",
      });
    } finally {
      setIsClassifying(null);
    }
  };

  const handleApproveExpense = async (expenseId: string) => {
    if (!user) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour approuver une charge. Veuillez vous reconnecter.",
        variant: "destructive",
      });
      return;
    }

    setIsApproving(expenseId);
    
    try {
      const { error } = await supabase
        .from("expenses")
        .update({
          approved: true,
          approved_at: new Date().toISOString(),
          approved_by: user.id
        })
        .eq("id", expenseId);

      if (error) {
        if (error.code === 'PGRST301' || error.message.includes('JWT')) {
          toast({
            title: "Session expirée",
            description: "Votre session a expiré. Veuillez vous reconnecter.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Succès",
        description: "Charge approuvée avec succès.",
      });

      fetchExpenses();
    } catch (error: any) {
      console.error('Expense approval error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'approuver la charge. Vérifiez votre connexion.",
        variant: "destructive",
      });
    } finally {
      setIsApproving(null);
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const isCashier = userRole === 'cashier';
  const isManager = userRole === 'manager';

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Contrôle des charges</h1>
            <p className="text-muted-foreground">Gérez toutes les charges de l'entreprise</p>
          </div>

          <div className="grid gap-6">
            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Résumé des charges</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Ajouter une charge
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Ajouter une nouvelle charge</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddExpense} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount">Montant (DH) *</Label>
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0"
                            value={newExpense.amount}
                            onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                            placeholder="0.00"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="description">Description *</Label>
                          <Input
                            id="description"
                            value={newExpense.description}
                            onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Description de la charge"
                            required
                          />
                        </div>
                        
                        <div className="flex gap-2 pt-4">
                          <DialogTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className="flex-1"
                            >
                              Annuler
                            </Button>
                          </DialogTrigger>
                          <Button
                            type="submit"
                            disabled={isAddingExpense}
                            className="flex-1"
                          >
                            {isAddingExpense ? "Ajout..." : "Ajouter"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {totalExpenses.toLocaleString('fr-FR')} DH
                </div>
                <p className="text-sm text-muted-foreground">Total des charges</p>
              </CardContent>
            </Card>

            {/* Expenses Table */}
            <Card>
              <CardHeader>
                <CardTitle>Historique des charges</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : expenses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune charge enregistrée
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Montant (DH)</TableHead>
                        <TableHead className="text-center">Classification</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>
                            {new Date(expense.created_at).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>{expense.description}</TableCell>
                          <TableCell className="text-right font-medium">
                            {expense.amount.toLocaleString('fr-FR')} DH
                          </TableCell>
                          <TableCell className="text-center">
                            {isCashier && !expense.classification ? (
                              <Select 
                                onValueChange={(value) => handleClassifyExpense(expense.id, value)}
                                disabled={isClassifying === expense.id}
                              >
                                <SelectTrigger className="w-20">
                                  <SelectValue placeholder="--" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="V">V</SelectItem>
                                  <SelectItem value="F">F</SelectItem>
                                  <SelectItem value="O">O</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                expense.classification === 'V' ? 'bg-green-100 text-green-800' :
                                expense.classification === 'F' ? 'bg-red-100 text-red-800' :
                                expense.classification === 'O' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {expense.classification || '--'}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              expense.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {expense.approved ? 'Approuvé' : 'En attente'}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {isManager && !expense.approved && expense.classification && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApproveExpense(expense.id)}
                                disabled={isApproving === expense.id}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Approuver
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseControl;