import { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Phone, Mail, Building, User } from 'lucide-react';
import { useProspects } from '@/hooks/useProspects';

export function ProspectsTable() {
  const { hasPermission } = usePermissions();
  const { prospects, loading } = useProspects();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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

  const filteredProspects = prospects.filter(prospect => {
    const matchesSearch = prospect.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prospect.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prospect.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || prospect.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prospects</CardTitle>
        <CardDescription>
          Gérez vos prospects et clients potentiels
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher prospects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les Statuts</SelectItem>
              <SelectItem value="new">Nouveau</SelectItem>
              <SelectItem value="contacted">Contacté</SelectItem>
              <SelectItem value="qualified">Qualifié</SelectItem>
              <SelectItem value="proposal_sent">Proposition Envoyée</SelectItem>
              <SelectItem value="negotiation">Négociation</SelectItem>
              <SelectItem value="won">Gagné</SelectItem>
              <SelectItem value="lost">Perdu</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Prospects Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prospect</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Entreprise</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Priorité</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProspects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <User className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">Aucun prospect trouvé</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProspects.map((prospect) => (
                  <TableRow key={prospect.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{prospect.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Ajouté le {new Date(prospect.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {prospect.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3" />
                            {prospect.email}
                          </div>
                        )}
                        {prospect.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3" />
                            {prospect.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {prospect.company && (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          {prospect.company}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(prospect.status)}</TableCell>
                    <TableCell>{getPriorityBadge(prospect.priority)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{prospect.source}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Voir
                        </Button>
                        {hasPermission('create_activities') && (
                          <Button variant="outline" size="sm">
                            Activité
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}