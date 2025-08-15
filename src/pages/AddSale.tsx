import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/ui/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { SaleFormData } from "@/types/sale";
import { CalendarIcon, Save, ArrowLeft } from "lucide-react";

const AddSale = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<SaleFormData>({
    type: "Flight Booking",
    clientName: "",
    phoneNumber: "",
    pnr: "",
    buyingPrice: 0,
    sellingPrice: 0,
    system: "TTP",
    agent: "Ahmed",
    departureDate: new Date(),
    departureTime: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Partial<SaleFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<SaleFormData> = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = "Le nom du client est requis";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Le numéro de téléphone est requis";
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phoneNumber.replace(/\s/g, ""))) {
      newErrors.phoneNumber = "Veuillez entrer un numéro de téléphone valide";
    }

    if (formData.type === "Flight Booking" && !formData.pnr?.trim()) {
      newErrors.pnr = "Le PNR est requis pour les réservations de vol";
    }

    if (Number(formData.buyingPrice) <= 0) {
      newErrors.buyingPrice = "Le prix d'achat doit être supérieur à 0";
    }

    if (Number(formData.sellingPrice) <= 0) {
      newErrors.sellingPrice = "Le prix de vente doit être supérieur à 0";
    }

    if (Number(formData.sellingPrice) <= Number(formData.buyingPrice)) {
      newErrors.sellingPrice = "Le prix de vente doit être supérieur au prix d'achat";
    }

    if (!formData.departureTime) {
      newErrors.departureTime = "L'heure de départ est requise";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Here you would typically save to a database
      console.log("Sale data:", formData);
      
      toast({
        title: "Vente enregistrée avec succès !",
        description: `${formData.type} pour ${formData.clientName} a été enregistré.`,
      });
      
      navigate("/");
    }
  };

  const handleInputChange = (field: keyof SaleFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const profit = Number(formData.sellingPrice) - Number(formData.buyingPrice);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Ajouter une nouvelle vente
            </h1>
            <p className="text-muted-foreground">
              Enregistrer une nouvelle vente
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au tableau de bord
          </Button>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">
              Informations sur la vente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* First Row - Type and System */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="type">Type de service</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: SaleFormData["type"]) => 
                      handleInputChange("type", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Flight Confirmed">Vol confirmé</SelectItem>
                      <SelectItem value="Boat Booking">Réservation maritime</SelectItem>
                      <SelectItem value="Extra Baggage">Bagage supplémentaire</SelectItem>
                      <SelectItem value="Flight Changing">Modification de vol</SelectItem>
                      <SelectItem value="Flight On Hold">Réservation aérienne</SelectItem>
                      <SelectItem value="Hotel Booking">Réservation hôtelière</SelectItem>
                      <SelectItem value="RW 1">RW (annulation)</SelectItem>
                      <SelectItem value="RW 2">RW (réservation)</SelectItem>
                      <SelectItem value="E-VISA">VISA électronique</SelectItem>
                      <SelectItem value="Organized Travel">Voyage organisé</SelectItem>
                      <SelectItem value="Travel Insurance">Assurance voyage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="system">Système</Label>
                  <Select
                    value={formData.system}
                    onValueChange={(value: SaleFormData["system"]) => 
                      handleInputChange("system", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Divers">Divers</SelectItem>
                      <SelectItem value="TTP">Top Travel Trip (TTP)</SelectItem>
                      <SelectItem value="AR">Accelaero (AR)</SelectItem>
                      <SelectItem value="CIH Hjira">CIH Hjira</SelectItem>
                      <SelectItem value="CIH Mehdi">CIH Mehdi</SelectItem>
                      <SelectItem value="BP Ahmed">BP Ahmed</SelectItem>
                      <SelectItem value="BP Hajj">BP Hajj</SelectItem>
                      <SelectItem value="BP Hajja">BP Hajja</SelectItem>                      
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Client Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Nom du client *</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => handleInputChange("clientName", e.target.value)}
                    placeholder="Entrez le nom complet du client"
                    className={errors.clientName ? "border-destructive" : ""}
                  />
                  {errors.clientName && (
                    <p className="text-sm text-destructive">{errors.clientName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Numéro de téléphone *</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    placeholder="+212600123456"
                    className={errors.phoneNumber ? "border-destructive" : ""}
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-destructive">{errors.phoneNumber}</p>
                  )}
                </div>
              </div>

              {/* PNR Field (conditional) */}
              {formData.type === "Flight Confirmed" && (
                <div className="space-y-2">
                  <Label htmlFor="pnr">PNR *</Label>
                  <Input
                    id="pnr"
                    value={formData.pnr || ""}
                    onChange={(e) => handleInputChange("pnr", e.target.value)}
                    placeholder="Entrez le code PNR"
                    className={errors.pnr ? "border-destructive" : ""}
                  />
                  {errors.pnr && (
                    <p className="text-sm text-destructive">{errors.pnr}</p>
                  )}
                </div>
              )}

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="buyingPrice">Prix d'achat (DH) *</Label>
                  <Input
                    id="buyingPrice"
                    type="number"
                    value={formData.buyingPrice || ""}
                    onChange={(e) => handleInputChange("buyingPrice", Number(e.target.value))}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className={errors.buyingPrice ? "border-destructive" : ""}
                  />
                  {errors.buyingPrice && (
                    <p className="text-sm text-destructive">{errors.buyingPrice}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sellingPrice">Prix de vente (DH) *</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    value={formData.sellingPrice || ""}
                    onChange={(e) => handleInputChange("sellingPrice", Number(e.target.value))}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className={errors.sellingPrice ? "border-destructive" : ""}
                  />
                  {errors.sellingPrice && (
                    <p className="text-sm text-destructive">{errors.sellingPrice}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Bénéfice (DH)</Label>
                  <div className="h-10 px-3 py-2 border border-border rounded-md bg-muted flex items-center">
                    <span className={`text-sm font-medium ${profit > 0 ? "text-success" : "text-muted-foreground"}`}>
                      {profit > 0 ? `+${profit.toLocaleString()}` : "0"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Agent and Departure Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="agent">Agent assigné</Label>
                  <Select
                    value={formData.agent}
                    onValueChange={(value: SaleFormData["agent"]) => 
                      handleInputChange("agent", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ahmed">Ahmed</SelectItem>
                      <SelectItem value="Mehdi">Mehdi</SelectItem>
                      <SelectItem value="Achraf">Achraf</SelectItem>
                      <SelectItem value="Asri">Asri</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date de départ *</Label>
                  <div className="relative">
                    <DatePicker
                      selected={formData.departureDate}
                      onChange={(date: Date | null) => handleInputChange("departureDate", date || new Date())}
                      className="w-full h-10 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Sélectionnez la date de départ"
                      minDate={new Date()}
                    />
                    <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departureTime">Heure de départ *</Label>
                  <Input
                    id="departureTime"
                    type="time"
                    value={formData.departureTime}
                    onChange={(e) => handleInputChange("departureTime", e.target.value)}
                    className={errors.departureTime ? "border-destructive" : ""}
                  />
                  {errors.departureTime && (
                    <p className="text-sm text-destructive">{errors.departureTime}</p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes supplémentaires</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Entrez des détails supplémentaires ou des exigences particulières..."
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <Button 
                  type="submit" 
                  className="flex items-center gap-2 bg-gradient-ocean hover:bg-primary-hover"
                >
                  <Save className="h-4 w-4" />
                  Enregistrer la vente
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddSale;