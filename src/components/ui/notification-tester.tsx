import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bell, TestTube } from 'lucide-react';

export function NotificationTester() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleTestNotifications = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('generate_notifications');
      
      if (error) throw error;
      
      toast({
        title: "Test réussi",
        description: "Les notifications ont été générées avec succès.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la génération des notifications.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleTestNotifications}
      disabled={loading}
      className="flex items-center gap-2"
    >
      <TestTube className="h-4 w-4" />
      {loading ? "Test en cours..." : "Tester notifications"}
    </Button>
  );
}