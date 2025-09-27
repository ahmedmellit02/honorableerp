import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCreateHotel } from "@/hooks/useOmraHotels";
import { Loader2, MapPin, Star, DollarSign } from "lucide-react";

interface AddHotelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddHotelModal({ open, onOpenChange }: AddHotelModalProps) {
  const { toast } = useToast();
  const createHotel = useCreateHotel();
  
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    country: "Saudi Arabia",
    star_rating: "",
    distance_from_haram: "",
    price_per_night: "",
    description: "",
    amenities: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.city) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    try {
      const hotelData = {
        name: formData.name,
        city: formData.city,
        country: formData.country,
        star_rating: formData.star_rating ? parseInt(formData.star_rating) : null,
        distance_from_haram: formData.distance_from_haram || null,
        price_per_night: formData.price_per_night ? parseFloat(formData.price_per_night) : null,
        description: formData.description || null,
        amenities: formData.amenities.split('\n').filter(a => a.trim()),
      };

      await createHotel.mutateAsync(hotelData);
      
      toast({
        title: "Succès",
        description: "Hôtel ajouté avec succès!",
      });

      // Reset form
      setFormData({
        name: "",
        city: "",
        country: "Saudi Arabia",
        star_rating: "",
        distance_from_haram: "",
        price_per_night: "",
        description: "",
        amenities: ""
      });
      
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'ajout de l'hôtel.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Ajouter un Hôtel
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l'Hôtel *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="ex: Hilton Mecca"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">Ville *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="ex: Mecca"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Pays</Label>
              <Select value={formData.country} onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Saudi Arabia">Arabie Saoudite</SelectItem>
                  <SelectItem value="United Arab Emirates">Émirats Arabes Unis</SelectItem>
                  <SelectItem value="Jordan">Jordanie</SelectItem>
                  <SelectItem value="Egypt">Égypte</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="star_rating">Classification</Label>
              <Select value={formData.star_rating} onValueChange={(value) => setFormData(prev => ({ ...prev, star_rating: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 étoile</SelectItem>
                  <SelectItem value="2">2 étoiles</SelectItem>
                  <SelectItem value="3">3 étoiles</SelectItem>
                  <SelectItem value="4">4 étoiles</SelectItem>
                  <SelectItem value="5">5 étoiles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="distance_from_haram">Distance du Haram</Label>
              <Input
                id="distance_from_haram"
                value={formData.distance_from_haram}
                onChange={(e) => setFormData(prev => ({ ...prev, distance_from_haram: e.target.value }))}
                placeholder="ex: 500m à pied"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price_per_night">Prix par Nuit (MAD)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="price_per_night"
                  type="number"
                  min="0"
                  step="0.01"
                  className="pl-10"
                  value={formData.price_per_night}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_per_night: e.target.value }))}
                  placeholder="1200"
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
              placeholder="Description détaillée de l'hôtel..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amenities">Équipements et Services</Label>
            <Textarea
              id="amenities"
              value={formData.amenities}
              onChange={(e) => setFormData(prev => ({ ...prev, amenities: e.target.value }))}
              placeholder="Wi-Fi gratuit&#10;Climatisation&#10;Restaurant&#10;Service de chambre&#10;Parking"
              rows={4}
            />
            <p className="text-xs text-muted-foreground">Un équipement par ligne</p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createHotel.isPending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={createHotel.isPending}>
              {createHotel.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ajouter l'Hôtel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}