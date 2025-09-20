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
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access the CRM system.
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
            Manage prospects, activities, and grow your travel business
          </p>
        </div>
        {hasPermission('create_prospects') && (
          <Button onClick={() => setShowAddProspect(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Prospect
          </Button>
        )}
      </div>

      {/* Main CRM Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="prospects" className="gap-2">
            <Users className="h-4 w-4" />
            Prospects
          </TabsTrigger>
          <TabsTrigger value="activities" className="gap-2">
            <Activity className="h-4 w-4" />
            Activities
          </TabsTrigger>
          <TabsTrigger value="quotes" className="gap-2">
            <FileText className="h-4 w-4" />
            Quotes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <CRMMetrics />
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityFeed limit={5} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pipeline Status</CardTitle>
                <CardDescription>Prospects by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">New</span>
                    <Badge variant="secondary">12</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Contacted</span>
                    <Badge variant="outline">8</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Qualified</span>
                    <Badge variant="outline">5</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Proposal Sent</span>
                    <Badge variant="outline">3</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Won</span>
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
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>
                All activities and interactions with prospects
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