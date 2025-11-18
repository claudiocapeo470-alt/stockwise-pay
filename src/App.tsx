import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AppLayout } from "./components/layout/AppLayout";
import { AdminLayout } from "./components/layout/AdminLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ScrollToTop } from "./components/ScrollToTop";
import Dashboard from "./pages/Dashboard";
import Stocks from "./pages/Stocks";
import Ventes from "./pages/Ventes";
import Facturation from "./pages/Facturation";
import PerformanceRapports from "./pages/PerformanceRapports";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import AuthSimple from "./pages/AuthSimple";
import InvoiceEditor from "./pages/InvoiceEditor";
import InvoicePreview from "./pages/InvoicePreview";
import Caisse from "./pages/Caisse";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminStocks from "./pages/admin/AdminStocks";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminPerformance from "./pages/admin/AdminPerformance";

import HomePage from "./pages/HomePage";
import MentionsLegales from "./pages/MentionsLegales";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Ne pas refaire si c'est une erreur d'authentification
        if (error?.status === 401 || error?.message?.includes('JWT')) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <ScrollToTop />
          <AuthProvider>
            <Routes>
              {/* Landing Page */}
              <Route path="/" element={<HomePage />} />
              
              {/* Legal Pages */}
              <Route path="/mentions-legales" element={<MentionsLegales />} />
              
              {/* Auth Route */}
              <Route path="/auth" element={<AuthSimple />} />
              
              {/* Admin Routes */}
              <Route path="/admin/*" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Routes>
                      <Route path="/" element={<AdminDashboard />} />
                      <Route path="/users" element={<AdminUsers />} />
                      <Route path="/subscriptions" element={<AdminSubscriptions />} />
                      <Route path="/stocks" element={<AdminStocks />} />
                      <Route path="/notifications" element={<AdminNotifications />} />
                      <Route path="/performance" element={<AdminPerformance />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AdminLayout>
                </ProtectedRoute>
              } />
              
              {/* Protected App Routes */}
              <Route path="/app/*" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/caisse" element={<Caisse />} />
                      <Route path="/stocks" element={<Stocks />} />
                      <Route path="/ventes" element={<Ventes />} />
                      <Route path="/facturation" element={<Facturation />} />
                      <Route path="/factures/new" element={<InvoiceEditor documentType="facture" />} />
                      <Route path="/factures/:id" element={<InvoiceEditor documentType="facture" />} />
                      <Route path="/factures/:id/preview" element={<InvoicePreview documentType="facture" />} />
                      <Route path="/devis/new" element={<InvoiceEditor documentType="devis" />} />
                      <Route path="/devis/:id" element={<InvoiceEditor documentType="devis" />} />
                      <Route path="/devis/:id/preview" element={<InvoicePreview documentType="devis" />} />
                      <Route path="/performance" element={<PerformanceRapports />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              {/* Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
