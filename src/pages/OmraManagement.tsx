import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Calendar, Users, Star } from "lucide-react";
import { useSimpleRole } from "@/hooks/useSimpleRole";
import { CreateProgramModal } from "@/components/omra/CreateProgramModal";
import { HotelsList } from "@/components/omra/HotelsList";
import { ProgramsList } from "@/components/omra/ProgramsList";
import { AddHotelModal } from "@/components/omra/AddHotelModal";

export default function OmraManagement() {
  const { userRole } = useSimpleRole();
  const [createProgramOpen, setCreateProgramOpen] = useState(false);
  const [addHotelOpen, setAddHotelOpen] = useState(false);

  // Check if user has access (Manager or Super Agent only)
  if (userRole !== 'manager' && userRole !== 'super_agent') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
              <p className="text-muted-foreground">
                Seuls les managers et super agents peuvent accéder à la gestion Omra.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion Programmes</h1>
          <p className="text-muted-foreground">
            Gérez vos programmes de pèlerinage et hôtels
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setAddHotelOpen(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter Hôtel
          </Button>
          <Button onClick={() => setCreateProgramOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Créer un Programme
          </Button>
        </div>
      </div>

      <Tabs defaultValue="programs" className="w-full">
        <TabsList>
          <TabsTrigger value="programs" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Programmes
          </TabsTrigger>
          <TabsTrigger value="hotels" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Hôtels
          </TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Programmes Omra
              </CardTitle>
              <CardDescription>
                Liste de tous les programmes de pèlerinage disponibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProgramsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hotels" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Hôtels Disponibles
              </CardTitle>
              <CardDescription>
                Gérez la liste des hôtels pour vos programmes Omra
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HotelsList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateProgramModal 
        open={createProgramOpen} 
        onOpenChange={setCreateProgramOpen} 
      />
      
      <AddHotelModal 
        open={addHotelOpen} 
        onOpenChange={setAddHotelOpen} 
      />
    </div>
  );
}