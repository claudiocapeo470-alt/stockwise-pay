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
import Factures from "./pages/Factures";
import Devis from "./pages/Devis";
import Paiements from "./pages/Paiements";
import Performance from "./pages/Performance";
import Rapports from "./pages/Rapports";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import AuthSimple from "./pages/AuthSimple";
import InvoiceEditor from "./pages/InvoiceEditor";
import InvoicePreview from "./pages/InvoicePreview";
import Caisse from "./pages/Caisse";
import TeamManagement from "./pages/TeamManagement";
import Livraisons from "./pages/Livraisons";
import LivreurDashboard from "./pages/LivreurDashboard";
import StoreConfig from "./pages/store/StoreConfig";
import StoreProducts from "./pages/store/StoreProducts";
import StoreOrders from "./pages/store/StoreOrders";
import StoreReviews from "./pages/store/StoreReviews";
import PublicStore from "./pages/store/PublicStore";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminStocks from "./pages/admin/AdminStocks";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminPerformance from "./pages/admin/AdminPerformance";

import HomePage from "./pages/HomePage";
import MentionsLegales from "./pages/MentionsLegales";
import Tarifs from "./pages/Tarifs";
import Fonctionnalites from "./pages/Fonctionnalites";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";
import SubscriptionCallback from "./pages/SubscriptionCallback";
import MySubscription from "./pages/MySubscription";
import { SubscriptionGuard } from "./components/auth/SubscriptionGuard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
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
              
              {/* Public Pages */}
              <Route path="/tarifs" element={<Tarifs />} />
              <Route path="/fonctionnalites" element={<Fonctionnalites />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/legal" element={<MentionsLegales />} />
              <Route path="/mentions-legales" element={<MentionsLegales />} />
              
              {/* Public Store */}
              <Route path="/boutique/:slug" element={<PublicStore />} />
              
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
              
              {/* Subscription Callback */}
              <Route path="/app/subscription-callback" element={
                <ProtectedRoute>
                  <SubscriptionCallback />
                </ProtectedRoute>
              } />

              {/* Caisse Tactile - Mode plein écran immersif */}
              <Route path="/app/caisse" element={
                <ProtectedRoute>
                  <SubscriptionGuard>
                    <Caisse />
                  </SubscriptionGuard>
                </ProtectedRoute>
              } />

              {/* Livreur Dashboard - Mode mobile dédié */}
              <Route path="/app/livreur" element={
                <ProtectedRoute>
                  <LivreurDashboard />
                </ProtectedRoute>
              } />

              {/* Protected App Routes */}
              <Route path="/app/*" element={
                <ProtectedRoute>
                  <SubscriptionGuard>
                    <AppLayout>
                      <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/stocks" element={<Stocks />} />
                      <Route path="/ventes" element={<Ventes />} />
                      <Route path="/facturation" element={<Facturation />} />
                      <Route path="/factures" element={<Factures />} />
                      <Route path="/factures/new" element={<InvoiceEditor documentType="facture" />} />
                      <Route path="/factures/:id" element={<InvoiceEditor documentType="facture" />} />
                      <Route path="/factures/:id/preview" element={<InvoicePreview documentType="facture" />} />
                      <Route path="/devis" element={<Devis />} />
                      <Route path="/devis/new" element={<InvoiceEditor documentType="devis" />} />
                      <Route path="/devis/:id" element={<InvoiceEditor documentType="devis" />} />
                      <Route path="/devis/:id/preview" element={<InvoicePreview documentType="devis" />} />
                      <Route path="/paiements" element={<Paiements />} />
                      <Route path="/performance" element={<PerformanceRapports />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/team" element={<TeamManagement />} />
                      <Route path="/livraisons" element={<Livraisons />} />
                      <Route path="/boutique/config" element={<StoreConfig />} />
                      <Route path="/boutique/produits" element={<StoreProducts />} />
                      <Route path="/boutique/commandes" element={<StoreOrders />} />
                      <Route path="/boutique/avis" element={<StoreReviews />} />
                      <Route path="/subscription" element={<MySubscription />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppLayout>
                </SubscriptionGuard>
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
