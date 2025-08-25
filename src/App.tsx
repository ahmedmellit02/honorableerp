import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { NotificationBell } from "@/components/ui/notifications";
import Dashboard from "./pages/Dashboard";
import AddSale from "./pages/AddSale";
import AllSales from "./pages/AllSales";
import Facturation from "./pages/Facturation";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import BalanceControl from "./pages/BalanceControl";
import SupplierDashboard from "./pages/SupplierDashboard";
import ExpenseControl from "./pages/ExpenseControl";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="sticky top-0 z-50 h-12 flex items-center justify-between border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger />
            <NotificationBell />
          </header>
          <div className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/add-sale" element={<AddSale />} />
              <Route path="/sales" element={<AllSales />} />
              <Route path="/facturation" element={<Facturation />} />
              <Route path="/supplier-dashboard" element={<SupplierDashboard />} />
              <Route path="/balance-control" element={<BalanceControl />} />
              <Route path="/expense-control" element={<ExpenseControl />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
