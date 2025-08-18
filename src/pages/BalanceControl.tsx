import { useState } from "react";
import Navigation from "@/components/ui/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAddBalance, useBalanceRecords, useSystemBalances } from "@/hooks/useBalance";
import { useToast } from "@/hooks/use-toast";
import { Wallet, Plus, History } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const BalanceControl = () => {
  const [amount, setAmount] = useState("");
  const [system, setSystem] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  
  const addBalance = useAddBalance();
  const { data: balanceRecords, isLoading: loadingRecords } = useBalanceRecords();
  const { data: systemBalances, isLoading: loadingBalances } = useSystemBalances();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !system) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      await addBalance.mutateAsync({
        amount: parseFloat(amount),
        system,
        description: description || undefined,
      });
      
      toast({
        title: "Succès",
        description: "Le solde a été enregistré avec succès",
      });
      
      setAmount("");
      setSystem("");
      setDescription("");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement du solde",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center space-x-3">
            <Wallet className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Contrôle du solde</h1>
              <p className="text-muted-foreground">Gérez les soldes des systèmes TTP et AR</p>
            </div>
          </div>

          {/* Current Balances */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loadingBalances ? (
              <div className="col-span-2 text-center">Chargement des soldes...</div>
            ) : (
              systemBalances?.map((balance) => (
                <Card key={balance.system}>
                  <CardHeader>
                    <CardTitle className="text-lg">{balance.system}</CardTitle>
                    <CardDescription>Solde actuel</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(balance.current_balance)}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Add Balance Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Enregistrer un solde</span>
              </CardTitle>
              <CardDescription>
                Ajoutez un montant au solde d'un système
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Montant (MAD)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="system">Système</Label>
                    <Select value={system} onValueChange={setSystem} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un système" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Top Travel Trip (TTP)">Top Travel Trip (TTP)</SelectItem>
                        <SelectItem value="Accelaero (AR)">Accelaero (AR)</SelectItem>
                        <SelectItem value="Carte">Carte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optionnel)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description de l'ajout de solde"
                    rows={3}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={addBalance.isPending}
                  className="w-full"
                >
                  {addBalance.isPending ? "Enregistrement..." : "Enregistrer le solde"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Balance History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="h-5 w-5" />
                <span>Historique des mouvements</span>
              </CardTitle>
              <CardDescription>
                Tous les mouvements de solde (ajouts et déductions)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingRecords ? (
                <div className="text-center py-4">Chargement de l'historique...</div>
              ) : balanceRecords && balanceRecords.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Système</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {balanceRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{formatDate(record.created_at)}</TableCell>
                        <TableCell>{record.system}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.type === 'addition' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {record.type === 'addition' ? 'Ajout' : 'Déduction'}
                          </span>
                        </TableCell>
                        <TableCell className={record.type === 'addition' ? 'text-green-600' : 'text-red-600'}>
                          {record.type === 'addition' ? '+' : '-'}{formatCurrency(record.amount)}
                        </TableCell>
                        <TableCell>{record.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun mouvement de solde enregistré
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BalanceControl;