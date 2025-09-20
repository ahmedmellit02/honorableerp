import { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ProspectFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  priority: 'low' | 'medium' | 'high';
  budget_range: string;
  notes: string;
}

interface AddProspectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddProspectModal({ open, onOpenChange }: AddProspectModalProps) {
  const { hasPermission } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProspectFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: '',
    priority: 'medium',
    budget_range: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasPermission('create_prospects')) {
      toast({
        title: "Accès Refusé",
        description: "Vous n'avez pas l'autorisation de créer des prospects.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: "Erreur de Validation",
        description: "Le nom du prospect est requis.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Succès",
        description: "Prospect ajouté avec succès!"
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        source: '',
        priority: 'medium',
        budget_range: '',
        notes: ''
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le prospect. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProspectFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter un Nouveau Prospect</DialogTitle>
          <DialogDescription>
            Ajoutez un nouveau client potentiel à votre système CRM.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            {/* Name - Required */}
            <div className="space-y-2">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                placeholder="Entrez le nom du prospect"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemple.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  placeholder="+212-6-XX-XX-XX-XX"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
            </div>

            {/* Company */}
            <div className="space-y-2">
              <Label htmlFor="company">Entreprise</Label>
              <Input
                id="company"
                placeholder="Nom de l'entreprise"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
              />
            </div>

            {/* Source and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Select value={formData.source} onValueChange={(value) => handleInputChange('source', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Comment nous ont-ils trouvés ?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Site Web</SelectItem>
                    <SelectItem value="referral">Recommandation</SelectItem>
                    <SelectItem value="social_media">Réseaux Sociaux</SelectItem>
                    <SelectItem value="phone_call">Appel Téléphonique</SelectItem>
                    <SelectItem value="walk_in">Visite Spontanée</SelectItem>
                    <SelectItem value="advertisement">Publicité</SelectItem>
                    <SelectItem value="partner">Partenaire</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priorité</Label>
                <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => handleInputChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Faible</SelectItem>
                    <SelectItem value="medium">Moyen</SelectItem>
                    <SelectItem value="high">Élevé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Budget Range */}
            <div className="space-y-2">
              <Label htmlFor="budget_range">Gamme de Budget</Label>
              <Select value={formData.budget_range} onValueChange={(value) => handleInputChange('budget_range', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez la gamme de budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under_5000">Moins de 5 000 MAD</SelectItem>
                  <SelectItem value="5000_15000">5 000 - 15 000 MAD</SelectItem>
                  <SelectItem value="15000_30000">15 000 - 30 000 MAD</SelectItem>
                  <SelectItem value="30000_50000">30 000 - 50 000 MAD</SelectItem>
                  <SelectItem value="50000_100000">50 000 - 100 000 MAD</SelectItem>
                  <SelectItem value="over_100000">Plus de 100 000 MAD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Notes supplémentaires sur le prospect..."
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
              Ajouter Prospect
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}