import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useActivities } from '@/hooks/useActivities';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, Clock } from 'lucide-react';

interface Prospect {
  id: string;
  name: string;
}

interface AddActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prospect: Prospect | null;
  onActivityAdded?: () => void;
}

interface ActivityFormData {
  type: string;
  subject: string;
  description: string;
  scheduled_at: string;
}

export function AddActivityModal({ open, onOpenChange, prospect, onActivityAdded }: AddActivityModalProps) {
  const { createActivity } = useActivities();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ActivityFormData>({
    type: '',
    subject: '',
    description: '',
    scheduled_at: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prospect) return;

    setLoading(true);
    try {
      await createActivity({
        prospect_id: prospect.id,
        type: formData.type as 'call' | 'email' | 'meeting' | 'follow_up',
        subject: formData.subject,
        description: formData.description,
        scheduled_at: formData.scheduled_at ? new Date(formData.scheduled_at).toISOString() : undefined
      });

      toast({
        title: "Activité créée",
        description: `Nouvelle activité ajoutée pour ${prospect.name.toUpperCase()}`
      });

      // Reset form
      setFormData({
        type: '',
        subject: '',
        description: '',
        scheduled_at: ''
      });

      onActivityAdded?.();
    } catch (error) {
      console.error('Error creating activity:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'activité",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ActivityFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Nouvelle Activité
          </DialogTitle>
          <DialogDescription>
            Ajouter une activité pour {prospect?.name.toUpperCase()}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type d'activité *</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="call">Appel téléphonique</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="meeting">Rendez-vous</SelectItem>
                <SelectItem value="follow_up">Suivi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Sujet *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              placeholder="Ex: Appel de suivi commercial"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled_at">Date et heure prévue</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="scheduled_at"
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => handleInputChange('scheduled_at', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Détails de l'activité..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.type || !formData.subject}
            >
              {loading ? "Création..." : "Créer l'activité"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}