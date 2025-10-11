import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePelerin } from "@/hooks/usePelerins";
import { useToast } from "@/hooks/use-toast";
import { X, Plus } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100, "Le nom doit contenir moins de 100 caractères"),
  address: z.string().max(500, "L'adresse doit contenir moins de 500 caractères").optional(),
  contacts: z.array(z.object({ value: z.string() })),
  advance_payment: z.coerce.number().min(0, "Le montant doit être positif").optional(),
});

interface AddPelerinModalProps {
  isOpen: boolean;
  onClose: () => void;
  programId: string;
}

export function AddPelerinModal({ isOpen, onClose, programId }: AddPelerinModalProps) {
  const { toast } = useToast();
  const createPelerin = useCreatePelerin();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      contacts: [{ value: "" }],
      advance_payment: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "contacts",
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const validContacts = values.contacts
      .map(c => c.value.trim())
      .filter(c => c !== "");

    try {
      await createPelerin.mutateAsync({
        program_id: programId,
        name: values.name.trim().toUpperCase(),
        address: values.address?.trim() || undefined,
        contacts: validContacts,
        advance_payment: values.advance_payment || 0,
      });

      toast({
        title: "Succès",
        description: "Pèlerin ajouté avec succès",
      });

      form.reset();
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="NOM DU PÈLERIN"
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Adresse du pèlerin"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Contacts</Label>
                <Button
                  type="button"
                  onClick={() => append({ value: "" })}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter un contact
                </Button>
              </div>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <FormField
                      control={form.control}
                      name={`contacts.${index}.value`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Numéro de téléphone"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => remove(index)}
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

            <FormField
              control={form.control}
              name="advance_payment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avance payée (MAD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={createPelerin.isPending}>
                {createPelerin.isPending ? "Ajout..." : "Ajouter"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
