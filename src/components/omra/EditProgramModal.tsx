import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Autocomplete } from "@/components/ui/autocomplete";
import { useToast } from "@/hooks/use-toast";
import { useUpdateOmraProgram, OmraProgram } from "@/hooks/useOmraPrograms";
import { useHotels } from "@/hooks/useOmraHotels";
import { iataCodes } from "@/data/iataCodes";
import { Loader2, Calendar, DollarSign, Building } from "lucide-react";

interface EditProgramModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program: OmraProgram | null;
}

export function EditProgramModal({ open, onOpenChange, program }: EditProgramModalProps) {
  const { toast } = useToast();
  const updateProgram = useUpdateOmraProgram();
  const { data: hotels = [] } = useHotels();
  
  const [formData, setFormData] = useState({
    title: "",
    duration_days: "",
    departure_date: "",
    return_date: "",
    departure_airport: "",
    arrival_airport: "",
    hotel_id: "",
    price_per_person: "",
    status: "draft"
  });

  // Populate form when program changes
  useEffect(() => {
    if (program) {
      setFormData({
        title: program.title || "",
        duration_days: program.duration_days?.toString() || "",
        departure_date: program.departure_date || "",
        return_date: program.return_date || "",
        departure_airport: program.departure_airport || "",
        arrival_airport: program.arrival_airport || "",
        hotel_id: program.hotels && program.hotels.length > 0 ? program.hotels[0] : "",
        price_per_person: program.price_per_person?.toString() || "",
        status: program.status || "draft"
      });
    }
  }, [program]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!program) return;

    if (!formData.title || !formData.duration_days || 
        !formData.departure_date || !formData.return_date || !formData.price_per_person) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    const departureDate = new Date(formData.departure_date);
    const returnDate = new Date(formData.return_date);
    
    if (returnDate <= departureDate) {
      toast({
        title: "Erreur",
        description: "La date de retour doit être après la date de départ.",
        variant: "destructive",
      });
      return;
    }

    if (formData.departure_airport && formData.arrival_airport && 
        formData.departure_airport === formData.arrival_airport) {
      toast({
        title: "Erreur",
        description: "L'aéroport d'arrivée doit être différent de l'aéroport de départ",
        variant: "destructive",
      });
      return;
    }

    try {
      const programData = {
        title: formData.title,
        duration_days: parseInt(formData.duration_days),
        price_per_person: parseFloat(formData.price_per_person),
        departure_date: formData.departure_date,
        return_date: formData.return_date,
        departure_city: program.departure_city,
        departure_airport: formData.departure_airport || undefined,
        arrival_airport: formData.arrival_airport || undefined,
        hotels: formData.hotel_id ? [formData.hotel_id] : program.hotels,
        status: formData.status as OmraProgram['status'],
      };

      await updateProgram.mutateAsync({ id: program.id, data: programData });
      
      toast({
        title: "Succès",
        description: "Programme Omra modifié avec succès!",
      });
      
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la modification du programme.",
        variant: "destructive",
      });
    }
  };

  // Auto-calculate duration based on dates
  useEffect(() => {
    if (formData.departure_date && formData.return_date) {
      const startDate = new Date(formData.departure_date);
      const endDate = new Date(formData.return_date);
      if (endDate > startDate) {
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setFormData(prev => ({ ...prev, duration_days: diffDays.toString() }));
      }
    }
  }, [formData.departure_date, formData.return_date]);

  // Convert IATA codes to autocomplete options
  const iataOptions = iataCodes.map(code => ({
    value: code.code,
    label: `${code.city}, ${code.country}`,
    description: code.airport
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Modifier le Programme Omra
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Titre du Programme *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value.toUpperCase() }))}
              placeholder="ex: OMRA RAMADAN 2024"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departure_date">Date de Départ *</Label>
              <Input
                id="departure_date"
                type="date"
                value={formData.departure_date}
                onChange={(e) => setFormData(prev => ({ ...prev, departure_date: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="return_date">Date de Retour *</Label>
              <Input
                id="return_date"
                type="date"
                value={formData.return_date}
                onChange={(e) => setFormData(prev => ({ ...prev, return_date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_days">Durée (jours) *</Label>
              <Input
                id="duration_days"
                type="number"
                min="1"
                value={formData.duration_days}
                onChange={(e) => setFormData(prev => ({ ...prev, duration_days: e.target.value }))}
                placeholder="15"
                required
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Calculée automatiquement
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departure_airport">Aéroport de départ</Label>
              <Autocomplete
                options={iataOptions}
                value={formData.departure_airport}
                onChange={(value) => setFormData(prev => ({ ...prev, departure_airport: value }))}
                placeholder="Code IATA (ex: CMN)"
                maxResults={8}
              />
              <p className="text-xs text-muted-foreground">
                Code IATA de l'aéroport de départ
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="arrival_airport">Aéroport d'arrivée</Label>
              <Autocomplete
                options={iataOptions}
                value={formData.arrival_airport}
                onChange={(value) => setFormData(prev => ({ ...prev, arrival_airport: value }))}
                placeholder="Code IATA (ex: JED)"
                maxResults={8}
              />
              <p className="text-xs text-muted-foreground">
                Code IATA de l'aéroport d'arrivée
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price_per_person">Prix par Personne (MAD) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="price_per_person"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price_per_person}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_per_person: e.target.value }))}
                  placeholder="15000"
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="published">Publié</SelectItem>
                  <SelectItem value="full">Complet</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hotel_id">Hôtel</Label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Select value={formData.hotel_id} onValueChange={(value) => setFormData(prev => ({ ...prev, hotel_id: value }))}>
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Sélectionner un hôtel" />
                </SelectTrigger>
                <SelectContent>
                  {hotels.map((hotel) => (
                    <SelectItem key={hotel.id} value={hotel.id}>
                      {hotel.name.toUpperCase()} - {hotel.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateProgram.isPending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={updateProgram.isPending}>
              {updateProgram.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer les Modifications
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
