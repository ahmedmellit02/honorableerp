import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Hotel } from "@/hooks/useOmraHotels";
import { useToast } from "@/hooks/use-toast";

interface EditHotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotel: Hotel | null;
  onSave: (hotelData: Partial<Hotel>) => void;
}

export function EditHotelModal({ isOpen, onClose, hotel, onSave }: EditHotelModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    country: "",
    star_rating: "",
    distance_from_haram: "",
    price_per_night: "",
    description: "",
    amenities: [] as string[],
  });
  const [newAmenity, setNewAmenity] = useState("");

  useEffect(() => {
    if (hotel) {
      setFormData({
        name: hotel.name || "",
        city: hotel.city || "",
        country: hotel.country || "",
        star_rating: hotel.star_rating?.toString() || "",
        distance_from_haram: hotel.distance_from_haram || "",
        price_per_night: hotel.price_per_night?.toString() || "",
        description: hotel.description || "",
        amenities: hotel.amenities || [],
      });
    }
  }, [hotel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedData: Partial<Hotel> = {
      name: formData.name,
      city: formData.city || null,
      country: formData.country || null,
      star_rating: formData.star_rating ? parseInt(formData.star_rating) : null,
      distance_from_haram: formData.distance_from_haram || null,
      price_per_night: formData.price_per_night ? parseFloat(formData.price_per_night) : null,
      description: formData.description || null,
      amenities: formData.amenities,
    };

    onSave(updatedData);
    toast({
      title: "Hôtel modifié",
      description: "Les informations de l'hôtel ont été mises à jour avec succès.",
    });
    onClose();
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity("");
    }
  };

  const removeAmenity = (amenityToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(amenity => amenity !== amenityToRemove)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier l'hôtel</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l'hôtel *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Pays</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="star_rating">Étoiles</Label>
              <Input
                id="star_rating"
                type="number"
                min="1"
                max="5"
                value={formData.star_rating}
                onChange={(e) => setFormData(prev => ({ ...prev, star_rating: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="distance_from_haram">Distance du Haram</Label>
              <Input
                id="distance_from_haram"
                placeholder="ex: 200m à pied"
                value={formData.distance_from_haram}
                onChange={(e) => setFormData(prev => ({ ...prev, distance_from_haram: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price_per_night">Prix par nuit (MAD)</Label>
              <Input
                id="price_per_night"
                type="number"
                min="0"
                step="0.01"
                value={formData.price_per_night}
                onChange={(e) => setFormData(prev => ({ ...prev, price_per_night: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Équipements</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ajouter un équipement"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
              />
              <Button type="button" variant="outline" onClick={addAmenity}>
                Ajouter
              </Button>
            </div>
            {formData.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.amenities.map((amenity, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {amenity}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeAmenity(amenity)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              Sauvegarder
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}