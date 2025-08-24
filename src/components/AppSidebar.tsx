import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BarChart3, Plus, Plane, LogOut, Settings, Wallet, Receipt } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSimpleRole } from "@/hooks/useSimpleRole";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { userRole, canViewDashboard, canAddSale, canControlBalance, loading } = useSimpleRole();
  const { toast } = useToast();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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
    return null;
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

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarHeader className="border-b border-border p-4">
        <Link to="/" className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-ocean rounded-lg shrink-0">
            <Plane className="h-6 w-6 text-white" />
          </div>
          {!collapsed && <span className="text-xl font-bold text-foreground">HonorableERP</span>}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild className={cn(active && "bg-primary text-primary-foreground")}>
                      <Link to={item.href} className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        {!collapsed && <span>{item.label}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <div className="flex flex-col space-y-2">
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-muted-foreground hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
                {!collapsed && <span className="ml-2">Paramètres</span>}
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
            className="w-full justify-center text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Déconnexion</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}