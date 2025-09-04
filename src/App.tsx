import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Stocks from "./pages/Stocks";
import Ventes from "./pages/Ventes";
import Paiements from "./pages/Paiements";
import Rapports from "./pages/Rapports";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/stocks" element={
              <ProtectedRoute>
                <AppLayout><Stocks /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/ventes" element={
              <ProtectedRoute>
                <AppLayout><Ventes /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/paiements" element={
              <ProtectedRoute>
                <AppLayout><Paiements /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/rapports" element={
              <ProtectedRoute>
                <AppLayout><Rapports /></AppLayout>
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
