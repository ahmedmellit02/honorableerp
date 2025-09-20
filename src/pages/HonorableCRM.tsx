import { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Activity, FileText, TrendingUp } from 'lucide-react';
import { ProspectsTable } from '@/components/crm/ProspectsTable';
import { ActivityFeed } from '@/components/crm/ActivityFeed';
import { QuotesList } from '@/components/crm/QuotesList';
import { CRMMetrics } from '@/components/crm/CRMMetrics';
import { AddProspectModal } from '@/components/crm/AddProspectModal';

export default function HonorableCRM() {
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddProspect, setShowAddProspect] = useState(false);

  if (!hasPermission('view_crm_dashboard')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Accès Refusé</CardTitle>
            <CardDescription>
              Vous n'avez pas l'autorisation d'accéder au système CRM.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">HonorableCRM</h1>
          <p className="text-muted-foreground">
            Gérez vos prospects, activités et développez votre agence de voyage
          </p>
        </div>
        {hasPermission('create_prospects') && (
          <Button onClick={() => setShowAddProspect(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter Prospect
          </Button>
        )}
      </div>

      {/* Main CRM Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="prospects" className="gap-2">
            <Users className="h-4 w-4" />
            Prospects
          </TabsTrigger>
          <TabsTrigger value="activities" className="gap-2">
            <Activity className="h-4 w-4" />
            Activités
          </TabsTrigger>
          <TabsTrigger value="quotes" className="gap-2">
            <FileText className="h-4 w-4" />
            Devis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <CRMMetrics />
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activités Récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityFeed limit={5} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>État du Pipeline</CardTitle>
                <CardDescription>Prospects par statut</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Nouveau</span>
                    <Badge variant="secondary">12</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Contacté</span>
                    <Badge variant="outline">8</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Qualifié</span>
                    <Badge variant="outline">5</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Proposition Envoyée</span>
                    <Badge variant="outline">3</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Gagné</span>
                    <Badge variant="default">2</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="prospects">
          <ProspectsTable />
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Chronologie des Activités</CardTitle>
              <CardDescription>
                Toutes les activités et interactions avec les prospects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityFeed />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotes">
          <QuotesList />
        </TabsContent>
      </Tabs>

      {/* Add Prospect Modal */}
      <AddProspectModal 
        open={showAddProspect} 
        onOpenChange={setShowAddProspect} 
      />
    </div>
  );
}