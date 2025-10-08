import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddPelerinModal } from "@/components/omra/AddPelerinModal";
import { AddPaymentModal } from "@/components/omra/AddPaymentModal";
import { usePelerins } from "@/hooks/usePelerins";
import { useOmraPrograms } from "@/hooks/useOmraPrograms";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus, DollarSign } from "lucide-react";

export default function ProgramPelerins() {
  const { programId } = useParams<{ programId: string }>();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  const { data: programs } = useOmraPrograms();
  const { data: pelerins, isLoading, error } = usePelerins(programId || "");

  const program = programs?.find(p => p.id === programId);

  // Sort pelerins by updated_at DESC to show recently updated at top
  const sortedPelerins = useMemo(() => {
    if (!pelerins) return [];
    return [...pelerins].sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }, [pelerins]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6">
          <p className="text-destructive">
            Erreur lors du chargement des pèlerins
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/omra">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {program?.title || "Programme"}
            </h1>
            <p className="text-muted-foreground">
              Liste des pèlerins inscrits
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsPaymentModalOpen(true)} variant="outline">
            <DollarSign className="h-4 w-4 mr-2" />
            Enregistrer un Paiement
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un Pèlerin
          </Button>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Contacts</TableHead>
              <TableHead className="text-right">Avance Payée</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!sortedPelerins || sortedPelerins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Aucun pèlerin inscrit pour ce programme
                </TableCell>
              </TableRow>
            ) : (
              sortedPelerins.map((pelerin) => (
                <TableRow key={pelerin.id}>
                  <TableCell className="font-medium">{pelerin.name}</TableCell>
                  <TableCell>{pelerin.address || "-"}</TableCell>
                  <TableCell>
                    {pelerin.contacts && pelerin.contacts.length > 0 ? (
                      <div className="space-y-1">
                        {pelerin.contacts.map((contact, idx) => (
                          <div key={idx} className="text-sm">{contact}</div>
                        ))}
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {pelerin.advance_payment.toLocaleString('fr-MA')} MAD
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <AddPelerinModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        programId={programId || ""}
      />

      <AddPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        pelerins={pelerins || []}
        programId={programId || ""}
      />
    </div>
  );
}
