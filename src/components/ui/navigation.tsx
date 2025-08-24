import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BarChart3, Plus, Plane, LogOut, Settings, Wallet, TrendingUp, Receipt } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSimpleRole } from "@/hooks/useSimpleRole";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { NotificationBell } from "@/components/ui/notifications";

const Navigation = () => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { userRole, canViewDashboard, canAddSale, canControlBalance, loading } = useSimpleRole();
  const { toast } = useToast();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  console.log('Navigation render:', { userRole, loading, user: user?.email });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les nouveaux mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Erreur", 
        description: "Le nouveau mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Votre mot de passe a été modifié avec succès.",
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setIsSettingsOpen(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la modification du mot de passe.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user || loading) {
    return (
      <nav className="bg-card border-b border-border shadow-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-ocean rounded-lg">
                  <Plane className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-foreground">HonorableERP</span>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Build navigation items based on role
  const navItems = [];

  // Dashboard access for managers, cashiers, and super agents
  if (canViewDashboard()) {
    navItems.push({
      label: "Tableau de bord",
      href: "/",
      icon: BarChart3,
    });
  }

  // Add sale access for cashiers, super agents, and agents
  if (canAddSale() || userRole === 'agent') {
    navItems.push({
      label: "Ajouter une vente", 
      href: "/add-sale", 
      icon: Plus,
    });
  }
    
  // Balance control only for cashiers
  if (canControlBalance()) {
    navItems.push({
      label: "Contrôle du solde",
      href: "/balance-control", 
      icon: Wallet,
    });
  }

  // Expense control for managers, cashiers, and super agents
  if (userRole === 'manager' || userRole === 'cashier' || userRole === 'super_agent') {
    navItems.push({
      label: "Contrôle des charges",
      href: "/expense-control",
      icon: Receipt,
    });
  }


  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              {/* <div className="p-2 bg-gradient-ocean rounded-lg">
                <Plane className="h-6 w-6 text-white" />
              </div> */}
              <span className="text-xl font-bold text-foreground">HonorableERP</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link key={item.href} to={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "flex items-center space-x-2",
                      isActive && "bg-primary text-primary-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
            
            <div className="flex items-center space-x-2 pl-4 border-l border-border">
              <NotificationBell />
              
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Paramètres du compte</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Entrez votre nouveau mot de passe"
                        required
                        minLength={6}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirmez votre nouveau mot de passe"
                        required
                        minLength={6}
                      />
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsSettingsOpen(false)}
                        className="flex-1"
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        disabled={isChangingPassword}
                        className="flex-1"
                      >
                        {isChangingPassword ? "Modification..." : "Modifier"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              
              <Button
                variant="ghost"
                onClick={() => signOut()}
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;