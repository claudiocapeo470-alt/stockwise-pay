import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Dashboard from "./pages/Dashboard";
import Stocks from "./pages/Stocks";
import Ventes from "./pages/Ventes";
import Paiements from "./pages/Paiements";
import Performance from "./pages/Performance";
import Rapports from "./pages/Rapports";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";

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
          <AuthProvider>
            <Routes>
              {/* Landing Page */}
              <Route path="/" element={<HomePage />} />
              
              {/* Legal Pages */}
              <Route path="/mentions-legales" element={<MentionsLegales />} />
              
              {/* Auth Route */}
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected App Routes */}
              <Route path="/app/*" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/stocks" element={<Stocks />} />
                      <Route path="/ventes" element={<Ventes />} />
                      <Route path="/paiements" element={<Paiements />} />
                      <Route path="/performance" element={<Performance />} />
                      <Route path="/rapports" element={<Rapports />} />
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
