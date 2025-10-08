import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePelerin } from "@/hooks/usePelerins";
import { useToast } from "@/hooks/use-toast";
import { X, Plus } from "lucide-react";

interface AddPelerinModalProps {
  isOpen: boolean;
  onClose: () => void;
  programId: string;
}

export function AddPelerinModal({ isOpen, onClose, programId }: AddPelerinModalProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contacts, setContacts] = useState<string[]>([""]);
  const [advancePayment, setAdvancePayment] = useState("");
  const { toast } = useToast();
  const createPelerin = useCreatePelerin();

  const handleAddContact = () => {
    setContacts([...contacts, ""]);
  };

  const handleRemoveContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const handleContactChange = (index: number, value: string) => {
    const newContacts = [...contacts];
    newContacts[index] = value;
    setContacts(newContacts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom est requis",
        variant: "destructive",
      });
      return;
    }

    const validContacts = contacts.filter(c => c.trim() !== "");

    try {
      await createPelerin.mutateAsync({
        program_id: programId,
        name: name.trim(),
        address: address.trim() || undefined,
        contacts: validContacts,
        advance_payment: parseFloat(advancePayment) || 0,
      });

      toast({
        title: "Succès",
        description: "Pèlerin ajouté avec succès",
      });

      setName("");
      setAddress("");
      setContacts([""]);
      setAdvancePayment("");
      onClose();
    } catch (error) {
      console.error("Error creating pelerin:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout du pèlerin",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un Pèlerin</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              placeholder="NOM DU PÈLERIN"
              required
            />
          </div>

          <div>
            <Label htmlFor="address">Adresse</Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Adresse du pèlerin"
              rows={3}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Contacts</Label>
              <Button
                type="button"
                onClick={handleAddContact}
                size="sm"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter un contact
              </Button>
            </div>
            <div className="space-y-2">
              {contacts.map((contact, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={contact}
                    onChange={(e) => handleContactChange(index, e.target.value)}
                    placeholder="Numéro de téléphone"
                  />
                  {contacts.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => handleRemoveContact(index)}
                      size="icon"
                      variant="ghost"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="advancePayment">Avance payée (MAD)</Label>
            <Input
              id="advancePayment"
              type="number"
              step="0.01"
              value={advancePayment}
              onChange={(e) => setAdvancePayment(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={createPelerin.isPending}>
              {createPelerin.isPending ? "Ajout..." : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
