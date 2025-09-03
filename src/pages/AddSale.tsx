import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Autocomplete } from "@/components/ui/autocomplete";
import { useToast } from "@/hooks/use-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { SaleFormData } from "@/types/sale";
import { CalendarIcon, Save, ArrowLeft } from "lucide-react";
import { useAddSale } from "@/hooks/useSales";
import { useAuth } from "@/hooks/useAuth";
import { useSimpleRole } from "@/hooks/useSimpleRole";
import { iataCodes } from "@/data/iataCodes";

const AddSale = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const addSaleMutation = useAddSale();
  const { user } = useAuth();
  const { canAddSale, userRole } = useSimpleRole();

  // Get agent based on user email
  const getAgentFromEmail = (email: string | undefined): SaleFormData["agent"] => {
    if (!email) return "Ahmed";

    const emailToAgent: Record<string, SaleFormData["agent"]> = {
      "m.elasri73@gmail.com": "Asri",
      "achrafalarabi284@gmail.com": "Achraf",
      "mehdimellit@gmail.com": "Mehdi",
      "mohammedmellit@chorafaa.com": "Mehdi",
      "ahmedmellit@chorafaa.com": "Ahmed"
    };

    return emailToAgent[email] || "Ahmed";
  };

  // Check if user should have access
  const isRestrictedUser = user?.email === "mohammedmellit@chorafaa.com";

  const [formData, setFormData] = useState<SaleFormData>({
    type: "Flight Confirmed",
    clientName: "",
    phoneNumber: "",
    pnr: "",
    buyingPrice: 0,
    sellingPrice: 0,
    system: "TTP",
    agent: getAgentFromEmail(user?.email),
    departureDate: new Date(),
    departureTime: "",
    fromAirport: "",
    toAirport: "",
    hasRegistration: false,
    rwDate: new Date(),
    rwTime: "",
    destination: "",
    paymentMethod: "C", // Default to Cash
  });

  // Update agent when user changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      agent: getAgentFromEmail(user?.email)
    }));
  }, [user?.email]);

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

    if (formData.type === "Flight Confirmed" && !formData.pnr?.trim()) {
      newErrors.pnr = "Le PNR est requis pour les vols confirmés";
    }

    if (Number(formData.sellingPrice) <= 0) {
      newErrors.sellingPrice = "Le prix de vente doit être supérieur à 0";
    }

    if (Number(formData.sellingPrice) <= Number(formData.buyingPrice)) {
      newErrors.sellingPrice = "Le prix de vente doit être supérieur au prix d'achat";
    }

    if (formData.type === "Flight Confirmed" && !formData.departureTime) {
      newErrors.departureTime = "L'heure de départ est requise pour les vols confirmés";
    }

    if (formData.type === "RW 1" && !formData.rwTime) {
      newErrors.rwTime = "L'heure est requise pour RW 1";
    }

    // 🚨 Check if departure and arrival airports are the same
    if (
      formData.type === "Flight Confirmed" &&
      formData.fromAirport &&
      formData.toAirport &&
      formData.fromAirport === formData.toAirport
    ) {
      newErrors.toAirport = "L'aéroport d'arrivée doit être différent de l'aéroport de départ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof SaleFormData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // ✅ Real-time validation for same airports
      if (
        updated.type === "Flight Confirmed" &&
        updated.fromAirport &&
        updated.toAirport &&
        updated.fromAirport === updated.toAirport
      ) {
        setErrors(prev => ({
          ...prev,
          toAirport: "L'aéroport d'arrivée doit être différent de l'aéroport de départ"
        }));
      } else {
        setErrors(prev => ({ ...prev, toAirport: undefined }));
      }

      return updated;
    });

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        await addSaleMutation.mutateAsync(formData);

        toast({
          title: "Vente enregistrée avec succès !",
          description: `${formData.type} pour ${formData.clientName} a été enregistré.`,
        });

        navigate("/");
      } catch (error) {
        console.error("Error saving sale:", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de l'enregistrement de la vente.",
          variant: "destructive",
        });
      }
    }
  };

  const profit = Number(formData.sellingPrice) - Number(formData.buyingPrice);

  // Convert IATA codes to autocomplete options
  const iataOptions = iataCodes.map(code => ({
    value: code.code,
    label: `${code.city}, ${code.country}`,
    description: code.airport
  }));

  // Check access permissions
  if (!canAddSale() && userRole !== 'agent') {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Accès restreint
            </h1>
            <p className="text-muted-foreground mb-6">
              Vous n'avez pas l'autorisation d'ajouter des ventes.
            </p>
            <Button onClick={() => navigate("/")} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour au tableau de bord
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">{/* Remove Navigation and pt-16 */}

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
                      <SelectItem value="Carte">Carte</SelectItem>
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
                    placeholder="Exemple : 0678945612"
                    className={errors.phoneNumber ? "border-destructive" : ""}
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-destructive">{errors.phoneNumber}</p>
                  )}
                </div>
              </div>

              {/* Flight Information Fields (only for vol confirmé) */}
              {formData.type === "Flight Confirmed" && (
                <>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  {/* From and To Airport Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fromAirport">De *</Label>
                      <Autocomplete
                        options={iataOptions}
                        value={formData.fromAirport || ""}
                        onChange={(value) => handleInputChange("fromAirport", value)}
                        placeholder="Aéroport de départ (ex: CMN)"
                        maxResults={8}
                      />
                      <p className="text-xs text-muted-foreground">
                        Code IATA de l'aéroport de départ
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="toAirport">À *</Label>
                      <Autocomplete
                        options={iataOptions}
                        value={formData.toAirport || ""}
                        onChange={(value) => handleInputChange("toAirport", value)}
                        placeholder="Aéroport d'arrivée (ex: CDG)"
                        maxResults={8}
                      />
                      {errors.toAirport && (
                        <p className="text-sm text-destructive">{errors.toAirport}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Code IATA de l'aéroport d'arrivée
                      </p>
                    </div>
                  </div>

                  {/* Registration Checkbox */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasRegistration"
                      checked={formData.hasRegistration || false}
                      onCheckedChange={(checked) => handleInputChange("hasRegistration", checked)}
                    />
                    <Label htmlFor="hasRegistration" className="text-sm font-normal">
                      Le client doit faire un enregistrement enligne ?
                    </Label>
                  </div>
                </>
              )}

              {/* RW 1 Specific Fields */}
              {formData.type === "RW 1" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <div className="relative">
                      <DatePicker
                        selected={formData.rwDate}
                        onChange={(date: Date | null) => handleInputChange("rwDate", date || new Date())}
                        className="w-full h-10 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Sélectionnez la date"
                      />
                      <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rwTime">Heure *</Label>
                    <Input
                      id="rwTime"
                      type="time"
                      value={formData.rwTime || ""}
                      onChange={(e) => handleInputChange("rwTime", e.target.value)}
                      className={errors.rwTime ? "border-destructive" : ""}
                    />
                    {errors.rwTime && (
                      <p className="text-sm text-destructive">{errors.rwTime}</p>
                    )}
                  </div>
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

              {/* Agent Assignment */}
              <div className="space-y-2">
                <Label>Agent assigné</Label>
                <div className="h-10 px-3 py-2 border border-border rounded-md bg-muted flex items-center">
                  <span className="text-sm">{formData.agent}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Agent automatiquement assigné selon votre compte
                </p>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Mode de paiement *</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value: "C" | "V") =>
                    handleInputChange("paymentMethod", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="C">Espèces (C)</SelectItem>
                    <SelectItem value="V">Virement (V)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Indiquer si le client a payé par espèces ou par virement bancaire
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <Button
                  type="submit"
                  disabled={addSaleMutation.isPending}
                  className="flex items-center gap-2 bg-gradient-ocean hover:bg-primary-hover"
                >
                  <Save className="h-4 w-4" />
                  {addSaleMutation.isPending ? "Enregistrement..." : "Enregistrer la vente"}
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
