import { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FileText, Calendar, DollarSign, Users } from 'lucide-react';

interface Quote {
  id: string;
  quote_number: string;
  prospect_name: string;
  service_type: string;
  destination: string;
  departure_date?: string;
  return_date?: string;
  passengers_count: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  valid_until?: string;
  created_at: string;
}

export function QuotesList() {
  const { hasPermission } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock data - will be replaced with real data from hooks
  const mockQuotes: Quote[] = [
    {
      id: '1',
      quote_number: 'Q-2024-0001',
      prospect_name: 'Ahmed Benali',
      service_type: 'Business Travel',
      destination: 'Dubai, UAE',
      departure_date: '2024-12-15',
      return_date: '2024-12-20',
      passengers_count: 1,
      total_amount: 15000,
      status: 'sent',
      valid_until: '2024-12-01',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      quote_number: 'Q-2024-0002',
      prospect_name: 'Fatima El Mansouri',
      service_type: 'Family Vacation',
      destination: 'Turkey',
      departure_date: '2024-11-10',
      return_date: '2024-11-17',
      passengers_count: 4,
      total_amount: 32000,
      status: 'draft',
      valid_until: '2024-11-25',
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      quote_number: 'Q-2024-0003',
      prospect_name: 'Omar Berrada',
      service_type: 'Corporate Travel',
      destination: 'Marrakech, Morocco',
      departure_date: '2024-12-05',
      return_date: '2024-12-08',
      passengers_count: 25,
      total_amount: 125000,
      status: 'accepted',
      valid_until: '2024-11-30',
      created_at: new Date().toISOString()
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      sent: 'outline',
      accepted: 'default',
      rejected: 'destructive',
      expired: 'destructive'
    } as const;

    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={colors[status as keyof typeof colors] || colors.draft}>
        {status === 'draft' ? 'BROUILLON' :
         status === 'sent' ? 'ENVOYÉ' :
         status === 'accepted' ? 'ACCEPTÉ' :
         status === 'rejected' ? 'REJETÉ' :
         status === 'expired' ? 'EXPIRÉ' :
         status.toUpperCase()}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  };

  const filteredQuotes = mockQuotes.filter(quote => {
    const matchesSearch = quote.prospect_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Devis</CardTitle>
        <CardDescription>
          Gérez les devis et propositions de voyage pour vos prospects
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher devis..."
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
              <SelectItem value="draft">Brouillon</SelectItem>
              <SelectItem value="sent">Envoyé</SelectItem>
              <SelectItem value="accepted">Accepté</SelectItem>
              <SelectItem value="rejected">Rejeté</SelectItem>
              <SelectItem value="expired">Expiré</SelectItem>
            </SelectContent>
          </Select>
          {hasPermission('create_quotes') && (
            <Button className="gap-2">
              <FileText className="h-4 w-4" />
              Nouveau Devis
            </Button>
          )}
        </div>

        {/* Quotes Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Devis #</TableHead>
                <TableHead>Prospect</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Détails Voyage</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Valide Jusqu'au</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">Aucun devis trouvé</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredQuotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell>
                      <div className="font-medium">{quote.quote_number}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(quote.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{quote.prospect_name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{quote.service_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{quote.destination}</span>
                        </div>
                        {quote.departure_date && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(quote.departure_date).toLocaleDateString('fr-FR')}
                            {quote.return_date && (
                              <span>- {new Date(quote.return_date).toLocaleDateString('fr-FR')}</span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {quote.passengers_count} passager{quote.passengers_count > 1 ? 's' : ''}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{formatCurrency(quote.total_amount)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(quote.status)}</TableCell>
                    <TableCell>
                      {quote.valid_until ? (
                        <span className="text-sm">
                          {new Date(quote.valid_until).toLocaleDateString('fr-FR')}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Voir
                        </Button>
                        {quote.status === 'draft' && hasPermission('create_quotes') && (
                          <Button variant="outline" size="sm">
                            Envoyer
                          </Button>
                        )}
                        {quote.status === 'accepted' && hasPermission('convert_to_sale') && (
                          <Button variant="default" size="sm">
                            Convertir
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