import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Autocomplete } from "@/components/ui/autocomplete";
import { useToast } from "@/hooks/use-toast";
import { useCreateOmraProgram } from "@/hooks/useOmraPrograms";
import { useHotels } from "@/hooks/useOmraHotels";
import { iataCodes } from "@/data/iataCodes";
import { Loader2, Calendar, MapPin, DollarSign, Building } from "lucide-react";

interface CreateProgramModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProgramModal({ open, onOpenChange }: CreateProgramModalProps) {
  const { toast } = useToast();
  const createProgram = useCreateOmraProgram();
  const { data: hotels = [] } = useHotels();
  
  const [formData, setFormData] = useState({
    program_name: "",
    duration_days: "",
    departure_date: "",
    return_date: "",
    departure_airport: "",
    arrival_airport: "",
    hotel_id: "",
    room_type_capacity: "",
    price_per_person: ""
  });

  const selectedHotel = hotels.find(h => h.id === formData.hotel_id);
  const availableRoomTypes = selectedHotel?.room_types || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.program_name || !formData.duration_days || 
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
      // Generate title automatically
      const selectedHotel = hotels.find(h => h.id === formData.hotel_id);
      const hotelPart = selectedHotel ? ` | ${selectedHotel.name.toUpperCase()}` : '';
      const generatedTitle = `${formData.program_name.toUpperCase()}${hotelPart}`;

      const programData = {
        title: generatedTitle,
        duration_days: parseInt(formData.duration_days),
        price_per_person: parseFloat(formData.price_per_person),
        departure_date: formData.departure_date,
        return_date: formData.return_date,
        departure_city: "Casablanca", // Default value since field removed
        departure_airport: formData.departure_airport || undefined,
        arrival_airport: formData.arrival_airport || undefined,
        hotels: formData.hotel_id ? [formData.hotel_id] : [],
      };

      await createProgram.mutateAsync(programData);
      
      toast({
        title: "Succès",
        description: "Programme Omra créé avec succès!",
      });

      // Reset form
      setFormData({
        program_name: "",
        duration_days: "",
        departure_date: "",
        return_date: "",
        departure_airport: "",
        arrival_airport: "",
        hotel_id: "",
        room_type_capacity: "",
        price_per_person: ""
      });
      
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la création du programme.",
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
            Créer un Programme Omra
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="program_name">Nom du Programme *</Label>
            <Input
              id="program_name"
              value={formData.program_name}
              onChange={(e) => setFormData(prev => ({ ...prev, program_name: e.target.value.toUpperCase() }))}
              placeholder="ex: OMRA RAMADAN 2024"
              required
            />
            <p className="text-xs text-muted-foreground">
              Le titre complet sera généré automatiquement
            </p>
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

          <div className="space-y-2">
            <Label htmlFor="hotel_id">Hôtel</Label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Select value={formData.hotel_id} onValueChange={(value) => setFormData(prev => ({ ...prev, hotel_id: value, room_type_capacity: "", price_per_person: "" }))}>
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Sélectionner un hôtel" />
                </SelectTrigger>
                <SelectContent>
                  {hotels.map((hotel) => (
                    <SelectItem key={hotel.id} value={hotel.id}>
                      {hotel.name.toUpperCase()} {hotel.city ? `- ${hotel.city}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.hotel_id && availableRoomTypes.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="room_type">Type de Chambre *</Label>
              <Select 
                value={formData.room_type_capacity} 
                onValueChange={(value) => {
                  const roomType = availableRoomTypes.find(rt => rt.capacity.toString() === value);
                  setFormData(prev => ({ 
                    ...prev, 
                    room_type_capacity: value,
                    price_per_person: roomType?.price?.toString() || ""
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type de chambre" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoomTypes.map((roomType) => (
                    <SelectItem key={roomType.capacity} value={roomType.capacity.toString()}>
                      Chambre {roomType.capacity} Personnes 
                      {roomType.price ? ` - ${roomType.price.toLocaleString()} MAD/nuit` : ' - Prix non défini'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Le prix sera automatiquement rempli selon le type de chambre
              </p>
            </div>
          )}

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
            <p className="text-xs text-muted-foreground">
              Ce prix est basé sur le type de chambre sélectionné
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createProgram.isPending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={createProgram.isPending}>
              {createProgram.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer le Programme
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}