import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from './useCompany';
import { useRealtimeSync } from './useRealtimeSync';

export interface Product {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  min_quantity: number;
  category: string | null;
  sku: string | null;
  icon_emoji: string | null;
  icon_bg_color: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useProducts = () => {
  const { user, isEmployee } = useAuth();
  const { company } = useCompany();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // CLE : l'ID effectif = owner_id si employe, user.id si proprietaire
  const effectiveUserId = isEmployee ? company?.owner_id : user?.id;

  const productsQuery = useQuery({
    queryKey: ['products', effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) return [];
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', effectiveUserId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!effectiveUserId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Realtime sync - replaces polling
  useRealtimeSync('products', ['products', effectiveUserId || ''], effectiveUserId);

  const addProduct = useMutation({
    mutationFn: async (product: Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!effectiveUserId) throw new Error('Non authentifié');
      const { data, error } = await supabase
        .from('products')
        .insert([{ ...product, user_id: effectiveUserId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', effectiveUserId] });
      toast({ title: 'Produit ajouté', description: 'Le produit a été ajouté avec succès' });
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...product }: Partial<Product> & { id: string }) => {
      if (!effectiveUserId) throw new Error('Non authentifié');
      const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .eq('user_id', effectiveUserId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', effectiveUserId] });
      toast({ title: 'Produit modifié', description: 'Le produit a été modifié avec succès' });
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      if (!effectiveUserId) throw new Error('Non authentifié');
      const { error } = await supabase.from('products').delete().eq('id', id).eq('user_id', effectiveUserId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', effectiveUserId] });
      toast({ title: 'Produit supprimé', description: 'Le produit a été supprimé avec succès' });
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  return {
    products: productsQuery.data || [],
    isLoading: productsQuery.isLoading,
    error: productsQuery.error,
    addProduct,
    updateProduct,
    deleteProduct,
  };
};
