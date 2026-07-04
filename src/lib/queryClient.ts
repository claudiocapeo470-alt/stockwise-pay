import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * QueryClient global partagé pour toute l'application.
 *
 * Options optimisées pour Stocknix :
 * - staleTime 5 min : évite les refetch inutiles sur navigation
 * - gcTime 30 min  : garde les données en cache après démontage
 * - retry 2        : sauf 401 / JWT expiré
 * - refetchOnWindowFocus false : évite les rechargements intempestifs
 * - refetchOnReconnect true    : rafraîchit après retour de connexion
 * - refetchOnMount false       : évite un double fetch au remontage
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
      refetchInterval: false,
      retry: (failureCount, error: unknown) => {
        const err = error as { status?: number; message?: string } | null;
        if (err?.status === 401 || err?.message?.includes('JWT')) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Erreurs silencieuses uniquement si le composant gère lui-même l'affichage
      if (query.meta?.silent) return;
      const message =
        (error as { message?: string })?.message ?? 'Erreur inconnue';
      // Ignorer les 401/JWT (redirection auth s'en occupe)
      if (message.includes('JWT') || message.includes('401')) return;
      console.error('[Query error]', query.queryKey, error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.silent) return;
      const message =
        (error as { message?: string })?.message ?? 'Une erreur est survenue';
      toast.error(message);
    },
  }),
});
