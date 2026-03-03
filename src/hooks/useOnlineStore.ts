import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface OnlineStore {
  id: string;
  user_id: string;
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  primary_color: string;
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  is_published: boolean;
  show_stock: boolean;
  allow_orders: boolean;
  delivery_fee: number;
  delivery_info: string | null;
  free_delivery_minimum: number;
  enable_reviews: boolean;
  maintenance_mode: boolean;
  created_at: string;
  updated_at: string;
}

export function useOnlineStore() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const storeQuery = useQuery({
    queryKey: ['online-store', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('online_store')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data as OnlineStore | null;
    },
    enabled: !!user,
  });

  const upsertStore = useMutation({
    mutationFn: async (store: Partial<OnlineStore> & { name: string; slug: string }) => {
      if (!user) throw new Error('Not authenticated');
      const existing = storeQuery.data;
      if (existing) {
        const { data, error } = await supabase.from('online_store').update({ ...store, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase.from('online_store').insert({ ...store, user_id: user.id }).select().single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['online-store'] }),
  });

  const togglePublish = useMutation({
    mutationFn: async () => {
      if (!storeQuery.data) throw new Error('No store');
      const { error } = await supabase.from('online_store').update({ is_published: !storeQuery.data.is_published, updated_at: new Date().toISOString() }).eq('id', storeQuery.data.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['online-store'] }),
  });

  const checkSlugAvailability = async (slug: string): Promise<boolean> => {
    const { data } = await supabase.from('online_store').select('id').eq('slug', slug).maybeSingle();
    if (data && storeQuery.data && data.id === storeQuery.data.id) return true;
    return !data;
  };

  return { store: storeQuery.data, isLoading: storeQuery.isLoading, upsertStore, togglePublish, checkSlugAvailability };
}

export function useStoreProducts(storeId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['store-products', storeId],
    queryFn: async () => {
      if (!storeId) return [];
      const { data, error } = await supabase.from('store_products').select('*, products(*)').eq('store_id', storeId);
      if (error) throw error;
      return data;
    },
    enabled: !!storeId,
  });

  const publishProducts = useMutation({
    mutationFn: async (items: { product_id: string; online_price?: number; online_description?: string; is_featured?: boolean }[]) => {
      if (!storeId) throw new Error('No store');
      const rows = items.map(item => ({ store_id: storeId, ...item }));
      const { error } = await supabase.from('store_products').upsert(rows, { onConflict: 'store_id,product_id' });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['store-products'] }),
  });

  const removeProduct = useMutation({
    mutationFn: async (productId: string) => {
      if (!storeId) throw new Error('No store');
      const { error } = await supabase.from('store_products').delete().eq('store_id', storeId).eq('product_id', productId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['store-products'] }),
  });

  return { storeProducts: query.data || [], isLoading: query.isLoading, publishProducts, removeProduct };
}

export function useStoreOrders(storeId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['store-orders', storeId],
    queryFn: async () => {
      if (!storeId) return [];
      const { data, error } = await supabase.from('store_orders').select('*').eq('store_id', storeId).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!storeId,
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { error } = await supabase.from('store_orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['store-orders'] }),
  });

  return { orders: query.data || [], isLoading: query.isLoading, updateOrderStatus };
}

export function useStoreReviews(storeId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['store-reviews', storeId],
    queryFn: async () => {
      if (!storeId) return [];
      const { data, error } = await supabase.from('store_reviews').select('*, products(name, icon_emoji)').eq('store_id', storeId).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!storeId,
  });

  const toggleApproval = useMutation({
    mutationFn: async ({ reviewId, approved }: { reviewId: string; approved: boolean }) => {
      const { error } = await supabase.from('store_reviews').update({ is_approved: approved }).eq('id', reviewId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['store-reviews'] }),
  });

  const deleteReview = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase.from('store_reviews').delete().eq('id', reviewId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['store-reviews'] }),
  });

  return { reviews: query.data || [], isLoading: query.isLoading, toggleApproval, deleteReview };
}
