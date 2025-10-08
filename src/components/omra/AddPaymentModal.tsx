import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Autocomplete } from "@/components/ui/autocomplete";
import { useCreatePayment } from "@/hooks/usePelerinPayments";
import { toast } from "sonner";

interface Pelerin {
  id: string;
  name: string;
  advance_payment: number;
}

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  pelerins: Pelerin[];
  programId: string;
}

export function AddPaymentModal({ isOpen, onClose, pelerins, programId }: AddPaymentModalProps) {
  const [selectedPelerinId, setSelectedPelerinId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const createPayment = useCreatePayment();

  const pelerinOptions = pelerins.map(p => ({
    value: p.id,
    label: p.name,
    description: `Avance actuelle: ${p.advance_payment.toLocaleString('fr-MA')} MAD`
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPelerinId || !amount) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }

    createPayment.mutate(
      {
        pelerin_id: selectedPelerinId,
        amount: paymentAmount,
        description: description || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Paiement enregistré avec succès");
          setSelectedPelerinId("");
          setAmount("");
          setDescription("");
          onClose();
        },
        onError: () => {
          toast.error("Erreur lors de l'enregistrement du paiement");
        }
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enregistrer un Paiement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pelerin">Pèlerin</Label>
            <Autocomplete
              options={pelerinOptions}
              value={selectedPelerinId}
              onChange={setSelectedPelerinId}
              placeholder="Rechercher un pèlerin..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Montant du Paiement (MAD)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Entrez le montant"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              placeholder="Ex: Paiement partiel, Solde final..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={createPayment.isPending}>
              {createPayment.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
