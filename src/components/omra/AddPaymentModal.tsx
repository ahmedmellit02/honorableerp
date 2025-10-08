import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Autocomplete } from "@/components/ui/autocomplete";
import { useUpdatePelerin } from "@/hooks/usePelerins";
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
  const updatePelerin = useUpdatePelerin();

  const pelerinOptions = pelerins.map(p => ({
    value: p.id,
    label: p.name,
    description: `Avance actuelle: ${p.advance_payment.toLocaleString('fr-MA')} MAD`
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPelerinId || !amount) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    const selectedPelerin = pelerins.find(p => p.id === selectedPelerinId);
    if (!selectedPelerin) return;

    const newTotalAmount = selectedPelerin.advance_payment + parseFloat(amount);

    updatePelerin.mutate(
      {
        id: selectedPelerinId,
        data: {
          advance_payment: newTotalAmount
        }
      },
      {
        onSuccess: () => {
          toast.success("Paiement enregistré avec succès");
          setSelectedPelerinId("");
          setAmount("");
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

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={updatePelerin.isPending}>
              {updatePelerin.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
