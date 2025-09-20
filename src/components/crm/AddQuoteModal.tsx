import { useState, useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { useQuotes } from '@/hooks/useQuotes';
import { useProspects } from '@/hooks/useProspects';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface QuoteFormData {
  prospect_id: string;
  service_type: string;
  destination: string;
  departure_date: string;
  return_date: string;
  passengers_count: number;
  total_amount: number;
  valid_until: string;
  notes: string;
}

interface AddQuoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuoteAdded?: () => void;
}

export function AddQuoteModal({ open, onOpenChange, onQuoteAdded }: AddQuoteModalProps) {
  const { hasPermission } = usePermissions();
  const { createQuote } = useQuotes();
  const { prospects } = useProspects();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<QuoteFormData>({
    prospect_id: '',
    service_type: '',
    destination: '',
    departure_date: '',
    return_date: '',
    passengers_count: 1,
    total_amount: 0,
    valid_until: '',
    notes: ''
  });

  // Set default valid_until to 30 days from now
  useEffect(() => {
    if (open) {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30);
      setFormData(prev => ({
        ...prev,
        valid_until: validUntil.toISOString().split('T')[0]
      }));
    }
  }, [open]);

  const generateQuoteNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(Date.now()).slice(-4);
    return `DEV-${year}${month}${day}-${time}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasPermission('create_quotes')) {
      toast({
        title: "Accès Refusé",
        description: "Vous n'avez pas l'autorisation de créer des devis.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.prospect_id || !formData.service_type || !formData.destination) {
      toast({
        title: "Erreur de Validation",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      await createQuote({
        quote_number: generateQuoteNumber(),
        prospect_id: formData.prospect_id,
        service_type: formData.service_type,
        destination: formData.destination,
        departure_date: formData.departure_date || null,
        return_date: formData.return_date || null,
        passengers_count: formData.passengers_count,
        total_amount: formData.total_amount || null,
        valid_until: formData.valid_until || null,
        notes: formData.notes || null
      });
      
      toast({
        title: "Succès",
        description: "Devis créé avec succès!"
      });
      
      // Reset form
      setFormData({
        prospect_id: '',
        service_type: '',
        destination: '',
        departure_date: '',
        return_date: '',
        passengers_count: 1,
        total_amount: 0,
        valid_until: '',
        notes: ''
      });
      
      onQuoteAdded?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating quote:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le devis. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof QuoteFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un Nouveau Devis</DialogTitle>
          <DialogDescription>
            Créez une proposition de voyage pour un prospect.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            {/* Prospect Selection */}
            <div className="space-y-2">
              <Label htmlFor="prospect_id">Prospect *</Label>
              <Select value={formData.prospect_id} onValueChange={(value) => handleInputChange('prospect_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un prospect" />
                </SelectTrigger>
                <SelectContent>
                  {prospects.map((prospect) => (
                    <SelectItem key={prospect.id} value={prospect.id}>
                      {prospect.name} {prospect.company && `(${prospect.company})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Service Type and Destination */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service_type">Type de Service *</Label>
                <Select value={formData.service_type} onValueChange={(value) => handleInputChange('service_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type de service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vol">Vol</SelectItem>
                    <SelectItem value="omra">Omra</SelectItem>
                    <SelectItem value="hajj">Hajj</SelectItem>
                    <SelectItem value="sejour">Séjour</SelectItem>
                    <SelectItem value="circuit">Circuit</SelectItem>
                    <SelectItem value="visa">Visa</SelectItem>
                    <SelectItem value="hotel">Hôtel</SelectItem>
                    <SelectItem value="package">Package Complet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destination *</Label>
                <Input
                  id="destination"
                  placeholder="Destination du voyage"
                  value={formData.destination}
                  onChange={(e) => handleInputChange('destination', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Travel Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departure_date">Date de Départ</Label>
                <Input
                  id="departure_date"
                  type="date"
                  value={formData.departure_date}
                  onChange={(e) => handleInputChange('departure_date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="return_date">Date de Retour</Label>
                <Input
                  id="return_date"
                  type="date"
                  value={formData.return_date}
                  onChange={(e) => handleInputChange('return_date', e.target.value)}
                />
              </div>
            </div>

            {/* Passengers and Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="passengers_count">Nombre de Passagers</Label>
                <Input
                  id="passengers_count"
                  type="number"
                  min="1"
                  value={formData.passengers_count}
                  onChange={(e) => handleInputChange('passengers_count', parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_amount">Montant Total (MAD)</Label>
                <Input
                  id="total_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.total_amount || ''}
                  onChange={(e) => handleInputChange('total_amount', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Valid Until */}
            <div className="space-y-2">
              <Label htmlFor="valid_until">Valide Jusqu'au</Label>
              <Input
                id="valid_until"
                type="date"
                value={formData.valid_until}
                onChange={(e) => handleInputChange('valid_until', e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Notes supplémentaires sur le devis..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer Devis
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}