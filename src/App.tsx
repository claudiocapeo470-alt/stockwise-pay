import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminGuard } from './components/auth/AdminGuard';
import { ModuleGuard } from './components/auth/ModuleGuard';
import { SubscriptionGuard } from './components/auth/SubscriptionGuard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ScrollToTop } from './components/ScrollToTop';
import Dashboard from './pages/Dashboard';
import Stocks from './pages/Stocks';
import Ventes from './pages/Ventes';
import Facturation from './pages/Facturation';
import Factures from './pages/Factures';
import Devis from './pages/Devis';
import Paiements from './pages/Paiements';
import Performance from './pages/Performance';
import Rapports from './pages/Rapports';
import RapportEmployes from './pages/RapportEmployes';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AuthSimple from './pages/AuthSimple';
import AuthConfirm from './pages/AuthConfirm';
import ResetPassword from './pages/ResetPassword';
import InvoiceEditor from './pages/InvoiceEditor';
import InvoicePreview from './pages/InvoicePreview';
import Caisse from './pages/Caisse';
import TeamManagement from './pages/TeamManagement';
import Livraisons from './pages/Livraisons';
import LivreurDashboard from './pages/LivreurDashboard';
import ModuleSelection from './pages/ModuleSelection';
import MySubscription from './pages/MySubscription';
import SubscriptionCallback from './pages/SubscriptionCallback';
import StoreConfig from './pages/store/StoreConfig';
import StoreProducts from './pages/store/StoreProducts';
import StoreOrders from './pages/store/StoreOrders';
import StoreReviews from './pages/store/StoreReviews';
import PublicStore from './pages/store/PublicStore';
import OrderTracking from './pages/store/OrderTracking';
import Clients from './pages/Clients';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';
import AdminStocks from './pages/admin/AdminStocks';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminPerformance from './pages/admin/AdminPerformance';
import HomePage from './pages/HomePage';
import { PWARedirect } from './components/auth/PWARedirect';
import MentionsLegales from './pages/MentionsLegales';
import Tarifs from './pages/Tarifs';
import Fonctionnalites from './pages/Fonctionnalites';
import FAQ from './pages/FAQ';
import NotFound from './pages/NotFound';
import CeoLogin from './pages/CeoLogin';
import CeoDashboard from './pages/ceo/CeoDashboard';
import CeoUsers from './pages/ceo/CeoUsers';
import CeoSubscriptions from './pages/ceo/CeoSubscriptions';
import CeoLanding from './pages/ceo/CeoLanding';
import CeoAnalytics from './pages/ceo/CeoAnalytics';
import CeoNotifications from './pages/ceo/CeoNotifications';
import CeoSettings from './pages/ceo/CeoSettings';
import CeoAppearance from './pages/ceo/CeoAppearance';
import { CeoGuard } from './components/auth/CeoGuard';
import { CeoLayout } from './components/layout/CeoLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchInterval: false,
      retry: (failureCount, error: any) => {
        if (error?.status === 401 || error?.message?.includes('JWT')) return false;
        return failureCount < 2;
      },
    },
    mutations: { retry: false },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
          <AuthProvider>
            <Routes>
              <Route path="/" element={<PWARedirect />} />
              <Route path="/tarifs" element={<Tarifs />} />
              <Route path="/fonctionnalites" element={<Fonctionnalites />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/legal" element={<MentionsLegales />} />
              <Route path="/mentions-legales" element={<MentionsLegales />} />
              <Route path="/boutique/:slug" element={<PublicStore />} />
              <Route path="/boutique/:slug/commande/:orderId" element={<OrderTracking />} />
              <Route path="/auth" element={<AuthSimple />} />
              <Route path="/auth/confirm" element={<AuthConfirm />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              <Route path="/onboarding" element={<ProtectedRoute><ModuleSelection /></ProtectedRoute>} />
              <Route path="/admin/*" element={
                <AdminGuard>
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
                </AdminGuard>
              } />
              <Route path="/app/subscription-callback" element={<ProtectedRoute><SubscriptionCallback /></ProtectedRoute>} />
              <Route path="/app/caisse" element={
                <ProtectedRoute><ModuleGuard><SubscriptionGuard><Caisse /></SubscriptionGuard></ModuleGuard></ProtectedRoute>
              } />
              <Route path="/app/livreur" element={<ProtectedRoute><SubscriptionGuard><LivreurDashboard /></SubscriptionGuard></ProtectedRoute>} />
              <Route path="/app/*" element={
                <ProtectedRoute>
                  <ModuleGuard>
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
                          <Route path="/performance" element={<Performance />} />
                          <Route path="/rapports" element={<Rapports />} />
                          <Route path="/rapport-employes" element={<RapportEmployes />} />
                          <Route path="/profile" element={<Profile />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/team" element={<TeamManagement />} />
                          <Route path="/livraisons" element={<Livraisons />} />
                          <Route path="/clients" element={<Clients />} />
                          <Route path="/boutique/config" element={<StoreConfig />} />
                          <Route path="/boutique/produits" element={<StoreProducts />} />
                          <Route path="/boutique/commandes" element={<StoreOrders />} />
                          <Route path="/boutique/avis" element={<StoreReviews />} />
                          <Route path="/subscription" element={<MySubscription />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </AppLayout>
                    </SubscriptionGuard>
                  </ModuleGuard>
                </ProtectedRoute>
              } />

              {/* CEO Super Admin */}
              <Route path="/ceo" element={<CeoLogin />} />
              <Route path="/ceo/dashboard" element={<CeoGuard><CeoLayout><CeoDashboard /></CeoLayout></CeoGuard>} />
              <Route path="/ceo/users" element={<CeoGuard><CeoLayout><CeoUsers /></CeoLayout></CeoGuard>} />
              <Route path="/ceo/subscriptions" element={<CeoGuard><CeoLayout><CeoSubscriptions /></CeoLayout></CeoGuard>} />
              <Route path="/ceo/landing" element={<CeoGuard><CeoLayout><CeoLanding /></CeoLayout></CeoGuard>} />
              <Route path="/ceo/analytics" element={<CeoGuard><CeoLayout><CeoAnalytics /></CeoLayout></CeoGuard>} />
              <Route path="/ceo/notifications" element={<CeoGuard><CeoLayout><CeoNotifications /></CeoLayout></CeoGuard>} />
              <Route path="/ceo/settings" element={<CeoGuard><CeoLayout><CeoSettings /></CeoLayout></CeoGuard>} />
              <Route path="/ceo/appearance" element={<CeoGuard><CeoLayout><CeoAppearance /></CeoLayout></CeoGuard>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
