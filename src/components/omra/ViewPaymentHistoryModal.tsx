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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePelerinPayments, useCashInPaymentCashier, useCashInPaymentManager } from "@/hooks/usePelerinPayments";
import { useSimpleRole } from "@/hooks/useSimpleRole";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle, Euro } from "lucide-react";

interface ViewPaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  pelerinId: string;
  pelerinName: string;
  advancePayment: number;
}

export function ViewPaymentHistoryModal({
  isOpen,
  onClose,
  pelerinId,
  pelerinName,
  advancePayment,
}: ViewPaymentHistoryModalProps) {
  const { data: payments, isLoading } = usePelerinPayments(pelerinId);
  const { userRole } = useSimpleRole();
  const cashInCashierMutation = useCashInPaymentCashier();
  const cashInManagerMutation = useCashInPaymentManager();

  const totalPaid = (payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0) + advancePayment;

  const handleCashInCashier = async (paymentId: string) => {
    await cashInCashierMutation.mutateAsync(paymentId);
  };

  const handleCashInManager = async (paymentId: string) => {
    await cashInManagerMutation.mutateAsync(paymentId);
  };

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
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="text-center">Caissier</TableHead>
                  <TableHead className="text-center">Manager</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {advancePayment > 0 && (
                  <TableRow className="bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>Avance initiale</span>
                        <Badge variant="secondary" className="text-xs">Initial</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {advancePayment.toLocaleString('fr-MA')} MAD
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="flex items-center gap-1 text-success border-success w-fit mx-auto">
                        <CheckCircle className="h-3 w-3" />
                        Encaissé
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="flex items-center gap-1 text-success border-success w-fit mx-auto">
                        <CheckCircle className="h-3 w-3" />
                        Encaissé
                      </Badge>
                    </TableCell>
                  </TableRow>
                )}
                {!payments || payments.length === 0 ? (
                  advancePayment === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Aucun paiement enregistré
                      </TableCell>
                    </TableRow>
                  ) : null
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {format(new Date(payment.payment_date), "dd MMM yyyy à HH:mm", { locale: fr })}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {Number(payment.amount).toLocaleString('fr-MA')} MAD
                      </TableCell>
                      
                      {/* Cashier column */}
                      <TableCell className="text-center">
                        {payment.cashed_in_by_cashier ? (
                          <Badge variant="outline" className="flex items-center gap-1 text-success border-success w-fit mx-auto">
                            <CheckCircle className="h-3 w-3" />
                            Encaissé
                          </Badge>
                        ) : userRole === 'cashier' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCashInCashier(payment.id)}
                            disabled={cashInCashierMutation.isPending}
                            className="text-xs hover:bg-success hover:text-white hover:border-success"
                          >
                            <Euro className="h-3 w-3 mr-1" />
                            Encaisser
                          </Button>
                        ) : (
                          <Badge variant="outline" className="flex items-center gap-1 text-destructive border-destructive w-fit mx-auto">
                            <Euro className="h-3 w-3" />
                            Non encaissé
                          </Badge>
                        )}
                      </TableCell>

                      {/* Manager column */}
                      <TableCell className="text-center">
                        {payment.cashed_in_by_manager ? (
                          <Badge variant="outline" className="flex items-center gap-1 text-success border-success w-fit mx-auto">
                            <CheckCircle className="h-3 w-3" />
                            Encaissé
                          </Badge>
                        ) : userRole === 'manager' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCashInManager(payment.id)}
                            disabled={cashInManagerMutation.isPending}
                            className="text-xs hover:bg-success hover:text-white hover:border-success"
                          >
                            <Euro className="h-3 w-3 mr-1" />
                            Encaisser
                          </Button>
                        ) : (
                          <Badge variant="outline" className="flex items-center gap-1 text-destructive border-destructive w-fit mx-auto">
                            <Euro className="h-3 w-3" />
                            Non encaissé
                          </Badge>
                        )}
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
