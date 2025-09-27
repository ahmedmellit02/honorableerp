import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCreateOmraProgram } from "@/hooks/useOmraPrograms";
import { useHotels } from "@/hooks/useOmraHotels";
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
    title: "",
    duration_days: "",
    departure_date: "",
    return_date: "",
    hotel_id: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.duration_days || 
        !formData.departure_date || !formData.return_date) {
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

    try {
      const programData = {
        title: formData.title,
        duration_days: parseInt(formData.duration_days),
        price_per_person: 0, // Default value since field removed
        departure_date: formData.departure_date,
        return_date: formData.return_date,
        departure_city: "Casablanca", // Default value since field removed
        hotels: formData.hotel_id ? [formData.hotel_id] : [],
      };

      await createProgram.mutateAsync(programData);
      
      toast({
        title: "Succès",
        description: "Programme Omra créé avec succès!",
      });

      // Reset form
      setFormData({
        title: "",
        duration_days: "",
        departure_date: "",
        return_date: "",
        hotel_id: ""
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
            <Label htmlFor="title">Titre du Programme *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value.toUpperCase() }))}
              placeholder="ex: OMRA RAMADAN 2024"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              Calculée automatiquement à partir des dates
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