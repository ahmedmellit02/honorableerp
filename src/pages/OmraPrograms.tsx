import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Users, DollarSign, Search, Clock } from "lucide-react";
import { useOmraPrograms, OmraProgram } from "@/hooks/useOmraPrograms";
import { formatDate } from "@/lib/utils";

export default function OmraPrograms() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: programs, isLoading, error } = useOmraPrograms();

  const filteredPrograms = programs?.filter(program =>
    program.status === 'published' && (
      program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.departure_city.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) || [];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { label: "Disponible", variant: "success" as const },
      full: { label: "Complet", variant: "info" as const },
    };
    
    return statusConfig[status as keyof typeof statusConfig] || { label: "Disponible", variant: "success" as const };
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-destructive">Erreur lors du chargement des programmes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Programmes Omra</h1>
        <p className="text-muted-foreground">
          Découvrez nos programmes de pèlerinage disponibles
        </p>
      </div>

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
                {filteredPrograms.length} programme{filteredPrograms.length > 1 ? 's' : ''} disponible{filteredPrograms.length > 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredPrograms.map((program) => {
                const statusBadge = getStatusBadge(program.status);
                const occupancyRate = program.max_participants 
                  ? (program.current_participants / program.max_participants) * 100 
                  : 0;

                return (
                  <Card 
                    key={program.id} 
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/program-pelerins/${program.id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl">{program.title}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <MapPin className="h-4 w-4" />
                            {program.departure_airport && program.arrival_airport ? (
                              <>Départ de {program.departure_airport} à {program.arrival_airport}</>
                            ) : (
                              <>Départ de {program.departure_city}</>
                            )}
                          </CardDescription>
                        </div>
                        <Badge variant={statusBadge.variant}>
                          {statusBadge.label}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
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

                      {program.room_type_capacity && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Chambre {program.room_type_capacity} Personnes
                          </span>
                        </div>
                      )}

                      {program.max_participants && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              Places disponibles
                            </span>
                            <span className="font-medium">
                              {program.max_participants - program.current_participants}/{program.max_participants}
                            </span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all" 
                              style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                            />
                          </div>
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
    </div>
  );
}
