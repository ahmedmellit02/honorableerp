import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, CreditCard, Check, X, Edit3 } from "lucide-react";
import { useDebtRecords, useDebtBalance, useAddDebtRecord } from "@/hooks/useDebtRecords";
import { useAuth } from "@/hooks/useAuth";
import { useSimpleRole } from "@/hooks/useSimpleRole";

export default function DebtControl() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canControlBalance } = useSimpleRole();
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"credit" | "debit">("credit");
  const [description, setDescription] = useState("");

  const { data: debtRecords, isLoading: recordsLoading } = useDebtRecords();
  const { data: debtBalance, isLoading: balanceLoading } = useDebtBalance();
  const addDebtRecord = useAddDebtRecord();

  // Redirect if user doesn't have permission
  if (!canControlBalance()) {
    navigate('/dashboard');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description.trim()) {
      return;
    }

    addDebtRecord.mutate({
      amount: parseFloat(amount),
      type,
      description: description.trim(),
    }, {
      onSuccess: () => {
        setAmount("");
        setDescription("");
        setType("credit");
      }
    });
  };

  const handleMarkAsUsed = (recordId: string) => {
    // TODO: Implement mark as used functionality
    console.log("Marking credit as used:", recordId);
  };

  const handleMarkAsPaid = (recordId: string) => {
    // TODO: Implement mark as paid functionality  
    console.log("Marking debt as paid:", recordId);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-foreground">Contrôle des Crédits</h1>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au tableau de bord
          </Button>
        </div>

        {/* Balance Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Solde Actuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            {balanceLoading ? (
              <div className="h-8 bg-muted animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold">
                {debtBalance && (
                  <span className={debtBalance.current_balance >= 0 ? "text-green-600" : "text-red-600"}>
                    {formatCurrency(debtBalance.current_balance)}
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Record Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Ajouter un Enregistrement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={type} onValueChange={(value: "credit" | "debit") => setType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit">Crédit (+)</SelectItem>
                      <SelectItem value="debit">Dette (-)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Montant (MAD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Motif / Description</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez la raison de ce crédit/dette..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                />
              </div>
              <Button 
                type="submit" 
                disabled={addDebtRecord.isPending}
                className="w-full md:w-auto"
              >
                {addDebtRecord.isPending ? "Ajout en cours..." : "Ajouter l'enregistrement"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Records Table */}
        <Card>
          <CardHeader>
            <CardTitle>Historique des Enregistrements</CardTitle>
          </CardHeader>
          <CardContent>
            {recordsLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {debtRecords?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          Aucun enregistrement trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      debtRecords?.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            {formatDate(record.created_at)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={record.type === 'credit' ? 'default' : 'destructive'}>
                              {record.type === 'credit' ? 'Crédit (+)' : 'Dette (-)'}
                            </Badge>
                          </TableCell>
                          <TableCell className={record.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                            {record.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(record.amount))}
                          </TableCell>
                          <TableCell>
                            {record.description}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {record.type === 'credit' ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleMarkAsUsed(record.id)}
                                  className="flex items-center gap-1"
                                >
                                  <Check className="h-3 w-3" />
                                  Marquer utilisé
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleMarkAsPaid(record.id)}
                                  className="flex items-center gap-1"
                                >
                                  <Check className="h-3 w-3" />
                                  Marquer payé
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => console.log("Edit record:", record.id)}
                                className="flex items-center gap-1"
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}