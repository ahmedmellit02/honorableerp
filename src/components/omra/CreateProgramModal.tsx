import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCreateOmraProgram } from "@/hooks/useOmraPrograms";
import { Loader2, Calendar, MapPin, Users, DollarSign } from "lucide-react";

interface CreateProgramModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProgramModal({ open, onOpenChange }: CreateProgramModalProps) {
  const { toast } = useToast();
  const createProgram = useCreateOmraProgram();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration_days: "",
    price_per_person: "",
    max_participants: "",
    departure_date: "",
    return_date: "",
    departure_city: "",
    included_services: "",
    excluded_services: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.duration_days || !formData.price_per_person || 
        !formData.departure_date || !formData.return_date || !formData.departure_city) {
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
        description: formData.description || null,
        duration_days: parseInt(formData.duration_days),
        price_per_person: parseFloat(formData.price_per_person),
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        departure_date: formData.departure_date,
        return_date: formData.return_date,
        departure_city: formData.departure_city,
        included_services: formData.included_services.split('\n').filter(s => s.trim()),
        excluded_services: formData.excluded_services.split('\n').filter(s => s.trim()),
      };

      await createProgram.mutateAsync(programData);
      
      toast({
        title: "Succès",
        description: "Programme Omra créé avec succès!",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        duration_days: "",
        price_per_person: "",
        max_participants: "",
        departure_date: "",
        return_date: "",
        departure_city: "",
        included_services: "",
        excluded_services: ""
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre du Programme *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="ex: Omra Ramadan 2024"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="departure_city">Ville de Départ *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="departure_city"
                  className="pl-10"
                  value={formData.departure_city}
                  onChange={(e) => setFormData(prev => ({ ...prev, departure_city: e.target.value }))}
                  placeholder="ex: Casablanca"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description détaillée du programme..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price_per_person">Prix par Personne (MAD) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="price_per_person"
                  type="number"
                  min="0"
                  step="0.01"
                  className="pl-10"
                  value={formData.price_per_person}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_per_person: e.target.value }))}
                  placeholder="15000"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max_participants">Max Participants</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="max_participants"
                  type="number"
                  min="1"
                  className="pl-10"
                  value={formData.max_participants}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_participants: e.target.value }))}
                  placeholder="50"
                />
              </div>
            </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="included_services">Services Inclus</Label>
              <Textarea
                id="included_services"
                value={formData.included_services}
                onChange={(e) => setFormData(prev => ({ ...prev, included_services: e.target.value }))}
                placeholder="Transport&#10;Hébergement&#10;Repas&#10;Guide"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">Un service par ligne</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="excluded_services">Services Non Inclus</Label>
              <Textarea
                id="excluded_services"
                value={formData.excluded_services}
                onChange={(e) => setFormData(prev => ({ ...prev, excluded_services: e.target.value }))}
                placeholder="Visa&#10;Assurance&#10;Dépenses personnelles"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">Un service par ligne</p>
            </div>
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