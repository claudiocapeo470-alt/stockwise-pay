import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ShopPixels } from '@/lib/pixels';

const EMPTY: ShopPixels = {
  meta_pixel_id: null,
  google_ads_conversion_id: null,
  ga4_measurement_id: null,
  tiktok_pixel_id: null,
  snapchat_pixel_id: null,
  linkedin_partner_id: null,
  x_pixel_id: null,
  enabled_platforms: {},
};

/** Configuration des pixels marketing d'une boutique (lecture + écriture propriétaire). */
export function useShopPixels(shopId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['shop-pixels', shopId],
    queryFn: async () => {
      if (!shopId) return null;
      const { data, error } = await (supabase as any)
        .from('shop_pixels')
        .select('*')
        .eq('shop_id', shopId)
        .maybeSingle();
      if (error) throw error;
      return (data as ShopPixels | null) ?? { ...EMPTY, shop_id: shopId };
    },
    enabled: !!shopId,
  });

  const savePixels = useMutation({
    mutationFn: async (values: Partial<ShopPixels>) => {
      if (!shopId) throw new Error('Boutique introuvable');
      const { error } = await (supabase as any)
        .from('shop_pixels')
        .upsert({ shop_id: shopId, ...values }, { onConflict: 'shop_id' });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shop-pixels', shopId] }),
  });

  return { pixels: query.data ?? EMPTY, isLoading: query.isLoading, savePixels };
}

export { EMPTY as EMPTY_PIXELS };
