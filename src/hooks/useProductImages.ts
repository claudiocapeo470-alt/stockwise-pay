import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ProductImage {
  id: string;
  product_id: string;
  user_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export function useProductImages(productId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['product-images', productId],
    queryFn: async () => {
      if (!productId) return [];
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as ProductImage[];
    },
    enabled: !!productId,
  });

  const addImage = useMutation({
    mutationFn: async ({ productId, imageUrl, sortOrder }: { productId: string; imageUrl: string; sortOrder?: number }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('product_images')
        .insert({ product_id: productId, user_id: user.id, image_url: imageUrl, sort_order: sortOrder ?? 0 })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['product-images'] }),
  });

  const removeImage = useMutation({
    mutationFn: async (imageId: string) => {
      const { error } = await supabase.from('product_images').delete().eq('id', imageId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['product-images'] }),
  });

  return {
    images: query.data || [],
    isLoading: query.isLoading,
    addImage,
    removeImage,
  };
}
