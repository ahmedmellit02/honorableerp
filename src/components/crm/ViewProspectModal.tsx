import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, Building, Calendar, User } from 'lucide-react';

interface Prospect {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status: string;
  priority: string;
  source?: string;
  budget_range?: string;
  notes?: string;
  travel_preferences?: any;
  created_at: string;
  updated_at: string;
}

interface ViewProspectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prospect: Prospect | null;
}

export function ViewProspectModal({ open, onOpenChange, prospect }: ViewProspectModalProps) {
  if (!prospect) return null;

  const getStatusBadge = (status: string) => {
    const variants = {
      new: 'secondary',
      contacted: 'outline',
      qualified: 'default',
      proposal_sent: 'default',
      negotiation: 'default',
      won: 'default',
      lost: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status === 'new' ? 'NOUVEAU' :
         status === 'contacted' ? 'CONTACTÉ' :
         status === 'qualified' ? 'QUALIFIÉ' :
         status === 'proposal_sent' ? 'PROPOSITION ENVOYÉE' :
         status === 'negotiation' ? 'NÉGOCIATION' :
         status === 'won' ? 'GAGNÉ' :
         status === 'lost' ? 'PERDU' :
         status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={colors[priority as keyof typeof colors] || colors.medium}>
        {priority === 'low' ? 'FAIBLE' :
         priority === 'medium' ? 'MOYEN' :
         priority === 'high' ? 'ÉLEVÉ' :
         priority.toUpperCase()}
      </Badge>
    );
  };

  const getSourceLabel = (source: string) => {
    const sourceLabels: Record<string, string> = {
      website: 'Site Web',
      referral: 'Recommandation',
      social_media: 'Réseaux Sociaux',
      phone_call: 'Appel Téléphonique',
      walk_in: 'Visite Spontanée',
      advertisement: 'Publicité',
      partner: 'Partenaire',
      other: 'Autre'
    };
    return sourceLabels[source] || source;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Détails du Prospect
          </DialogTitle>
          <DialogDescription>
            Informations complètes sur {prospect.name.toUpperCase()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Informations de base</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-sm text-muted-foreground">Nom</label>
                  <p className="font-medium">{prospect.name.toUpperCase()}</p>
                </div>
                {prospect.email && (
                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <p>{prospect.email}</p>
                    </div>
                  </div>
                )}
                {prospect.phone && (
                  <div>
                    <label className="text-sm text-muted-foreground">Téléphone</label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <p>{prospect.phone}</p>
                    </div>
                  </div>
                )}
                {prospect.company && (
                  <div>
                    <label className="text-sm text-muted-foreground">Entreprise</label>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      <p>{prospect.company}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Statut & Priorité</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-sm text-muted-foreground">Statut</label>
                  <div>{getStatusBadge(prospect.status)}</div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Priorité</label>
                  <div>{getPriorityBadge(prospect.priority)}</div>
                </div>
                {prospect.source && (
                  <div>
                    <label className="text-sm text-muted-foreground">Source</label>
                    <div>
                      <Badge variant="outline">{getSourceLabel(prospect.source)}</Badge>
                    </div>
                  </div>
                )}
                {prospect.budget_range && (
                  <div>
                    <label className="text-sm text-muted-foreground">Budget</label>
                    <p>{prospect.budget_range}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Additional Information */}
          {prospect.notes && (
            <div>
              <h3 className="font-medium mb-2">Notes</h3>
              <p className="text-sm bg-muted p-3 rounded-md">{prospect.notes}</p>
            </div>
          )}

          {prospect.travel_preferences && Object.keys(prospect.travel_preferences).length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Préférences de voyage</h3>
              <div className="bg-muted p-3 rounded-md">
                <pre className="text-sm">{JSON.stringify(prospect.travel_preferences, null, 2)}</pre>
              </div>
            </div>
          )}

          <Separator />

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Créé le {new Date(prospect.created_at).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Modifié le {new Date(prospect.updated_at).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}