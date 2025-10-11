import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Hotel, RoomType } from "@/hooks/useOmraHotels";
import { Loader2, MapPin } from "lucide-react";

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
    room_types: [] as RoomType[]
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (hotel) {
      setFormData({
        name: hotel.name || "",
        room_types: hotel.room_types || [],
      });
    }
  }, [hotel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.room_types.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const updatedData: Partial<Hotel> = {
        name: formData.name,
        room_types: formData.room_types,
      };

      await onSave(updatedData);
      
      toast({
        title: "Succès",
        description: "Hôtel modifié avec succès!",
      });
      
      onClose();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la modification de l'hôtel.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Modifier l'hôtel
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de l'Hôtel *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value.toUpperCase() }))}
                placeholder="ex: HILTON MECCA"
                required
              />
          </div>

          <div className="space-y-2">
            <Label>Types de Chambres *</Label>
            <div className="space-y-3">
              {[2, 3, 4, 5, 6, 7].map((capacity) => {
                const roomType = formData.room_types.find(rt => rt.capacity === capacity);
                const isChecked = !!roomType;
                
                return (
                  <div key={capacity} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={`room-${capacity}`}
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            room_types: [...prev.room_types, { capacity, price: null }].sort((a, b) => a.capacity - b.capacity)
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            room_types: prev.room_types.filter(t => t.capacity !== capacity)
                          }));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={`room-${capacity}`} className="text-sm font-normal">
                      Chambre {capacity} Personnes
                    </Label>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Sélectionnez les types de chambres disponibles
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Modifier l'Hôtel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}