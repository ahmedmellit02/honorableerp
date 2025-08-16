import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserRole, useSetUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users } from "lucide-react";
import { useState } from "react";

const RoleAssignment = () => {
  const { data: currentRole, isLoading } = useUserRole();
  const setRoleMutation = useSetUserRole();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<string>("");

  const handleRoleChange = async () => {
    if (!selectedRole) return;
    
    try {
      await setRoleMutation.mutateAsync(selectedRole as 'agent' | 'cashier');
      toast({
        title: "Rôle mis à jour",
        description: `Votre rôle a été changé vers ${selectedRole === 'cashier' ? 'Caissier' : 'Agent'}.`,
      });
      setSelectedRole("");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de changer le rôle.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-card">
        <CardContent className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Configuration du rôle
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          Rôle actuel: <span className="font-medium text-foreground">
            {currentRole === 'cashier' ? 'Caissier' : 'Agent'}
          </span>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Sélectionner un nouveau rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="agent">Agent</SelectItem>
              <SelectItem value="cashier">Caissier (Mr. Alasri)</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleRoleChange}
            disabled={!selectedRole || setRoleMutation.isPending}
            size="sm"
          >
            Changer
          </Button>
        </div>
        
        {currentRole === 'cashier' && (
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
            💡 En tant que caissier, vous voyez une colonne "Encaissement" pour marquer les ventes comme encaissées.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RoleAssignment;