import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Autocomplete } from "@/components/ui/autocomplete";
import { useCreatePayment } from "@/hooks/usePelerinPayments";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  pelerin_id: z.string().min(1, "Veuillez sélectionner un pèlerin"),
  amount: z.coerce.number().min(0.01, "Le montant doit être supérieur à 0"),
});

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
  const createPayment = useCreatePayment();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pelerin_id: "",
      amount: 0,
    },
  });

  const pelerinOptions = pelerins.map(p => ({
    value: p.id,
    label: p.name,
    description: `Avance actuelle: ${p.advance_payment.toLocaleString('fr-MA')} MAD`
  }));

  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    createPayment.mutate(
      {
        pelerin_id: values.pelerin_id,
        amount: values.amount,
      },
      {
        onSuccess: () => {
          toast.success("Paiement enregistré avec succès");
          form.reset();
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="pelerin_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pèlerin *</FormLabel>
                  <FormControl>
                    <Autocomplete
                      options={pelerinOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Rechercher un pèlerin..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant du Paiement (MAD) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Entrez le montant"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={createPayment.isPending}>
                {createPayment.isPending ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
