import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Users, DollarSign, Search, Edit, Clock, Plane } from "lucide-react";
import { useOmraPrograms, OmraProgram } from "@/hooks/useOmraPrograms";
import { formatDate } from "@/lib/utils";
import { EditProgramModal } from "./EditProgramModal";

export function ProgramsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProgram, setEditingProgram] = useState<OmraProgram | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { data: programs, isLoading, error } = useOmraPrograms();

  const handleEditClick = (program: OmraProgram) => {
    setEditingProgram(program);
    setIsEditModalOpen(true);
  };

  const filteredPrograms = programs?.filter(program =>
    program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.departure_city.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Brouillon", variant: "secondary" as const },
      published: { label: "Publié", variant: "default" as const },
      full: { label: "Complet", variant: "destructive" as const },
      cancelled: { label: "Annulé", variant: "destructive" as const }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Erreur lors du chargement des programmes</p>
      </div>
    );
  }

  return (
    <>
      <EditProgramModal 
        open={isEditModalOpen} 
        onOpenChange={setIsEditModalOpen}
        program={editingProgram}
      />
      
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par titre ou ville de départ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

      {filteredPrograms.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun programme trouvé</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Aucun programme ne correspond à votre recherche." : "Aucun programme disponible pour le moment."}
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredPrograms.length} programme{filteredPrograms.length > 1 ? 's' : ''} trouvé{filteredPrograms.length > 1 ? 's' : ''}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPrograms.map((program) => {
              const statusBadge = getStatusBadge(program.status);
              const occupancyRate = program.max_participants 
                ? (program.current_participants / program.max_participants) * 100 
                : 0;

              return (
                <Card key={program.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{program.title}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="h-4 w-4" />
                          Départ de {program.departure_city}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={statusBadge.variant}>
                          {statusBadge.label}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditClick(program)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Airport Information */}
                    {(program.departure_airport || program.arrival_airport) && (
                      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                        <Plane className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {program.departure_airport && <span className="font-medium">{program.departure_airport}</span>}
                          {program.departure_airport && program.arrival_airport && <span className="mx-1">→</span>}
                          {program.arrival_airport && <span className="font-medium">{program.arrival_airport}</span>}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          <p className="font-medium">{formatDate(program.departure_date)}</p>
                          <p className="text-muted-foreground text-xs">Départ</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          <p className="font-medium">{formatDate(program.return_date)}</p>
                          <p className="text-muted-foreground text-xs">Retour</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{program.duration_days} jours</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{program.price_per_person} MAD</span>
                      </div>
                    </div>

                    {program.max_participants && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            Participants
                          </span>
                          <span className="font-medium">
                            {program.current_participants}/{program.max_participants}
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all" 
                            style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Taux de remplissage: {occupancyRate.toFixed(0)}%
                        </p>
                      </div>
                    )}

                    {program.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {program.description}
                      </p>
                    )}

                    {program.included_services && program.included_services.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Services inclus:</p>
                        <div className="flex flex-wrap gap-1">
                          {program.included_services.slice(0, 3).map((service, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                          {program.included_services.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{program.included_services.length - 3} autres
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
      </div>
    </>
  );
}