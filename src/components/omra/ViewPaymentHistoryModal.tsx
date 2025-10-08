import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePelerinPayments } from "@/hooks/usePelerinPayments";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ViewPaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  pelerinId: string;
  pelerinName: string;
}

export function ViewPaymentHistoryModal({
  isOpen,
  onClose,
  pelerinId,
  pelerinName,
}: ViewPaymentHistoryModalProps) {
  const { data: payments, isLoading } = usePelerinPayments(pelerinId);

  const totalPaid = payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Historique des paiements - {pelerinName}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 bg-muted/50">
              <p className="text-sm text-muted-foreground">Total payé</p>
              <p className="text-2xl font-bold">{totalPaid.toLocaleString('fr-MA')} MAD</p>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!payments || payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      Aucun paiement enregistré
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {format(new Date(payment.payment_date), "dd MMM yyyy à HH:mm", { locale: fr })}
                      </TableCell>
                      <TableCell>{payment.description || "-"}</TableCell>
                      <TableCell className="text-right font-medium">
                        {Number(payment.amount).toLocaleString('fr-MA')} MAD
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
