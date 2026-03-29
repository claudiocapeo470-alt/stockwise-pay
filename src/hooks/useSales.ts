import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from './useCompany';
import { useRealtimeSync } from './useRealtimeSync';

export interface Sale {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  paid_amount: number;
  customer_name: string | null;
  customer_phone: string | null;
  sale_date: string;
  payment_method: string | null;
  created_at: string;
  created_by_member_id?: string | null;
  products?: {
    name: string;
    price: number;
  };
}

export const useSales = () => {
  const { user, isEmployee, memberInfo } = useAuth();
  const { company } = useCompany();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const effectiveUserId = isEmployee ? company?.owner_id : user?.id;

  const salesQuery = useQuery({
    queryKey: ['sales', effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) return [];
      const { data, error } = await supabase
        .from('sales')
        .select(`*, products (name, price)`)
        .eq('user_id', effectiveUserId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Sale[];
    },
    enabled: !!effectiveUserId,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 30000,
  });

  const addSale = useMutation({
    mutationFn: async (sale: Omit<Sale, 'id' | 'user_id' | 'created_at' | 'products'> & { created_by_member_id?: string }) => {
      if (!effectiveUserId) throw new Error('Non authentifié');
      const insertData: any = { ...sale, user_id: effectiveUserId };
      // Add member_id if employee
      if (isEmployee && memberInfo?.member_id) {
        insertData.created_by_member_id = memberInfo.member_id;
      }
      if (sale.created_by_member_id) {
        insertData.created_by_member_id = sale.created_by_member_id;
      }
      const { data, error } = await supabase
        .from('sales')
        .insert([insertData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales', effectiveUserId] });
      queryClient.invalidateQueries({ queryKey: ['products', effectiveUserId] });
      toast({ title: 'Vente enregistrée', description: 'La vente a été enregistrée avec succès' });
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const updateSale = useMutation({
    mutationFn: async ({ id, ...sale }: Partial<Sale> & { id: string }) => {
      if (!effectiveUserId) throw new Error('Non authentifié');
      const { data, error } = await supabase
        .from('sales')
        .update(sale)
        .eq('id', id)
        .eq('user_id', effectiveUserId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales', effectiveUserId] });
      queryClient.invalidateQueries({ queryKey: ['products', effectiveUserId] });
      toast({ title: 'Vente modifiée', description: 'La vente a été modifiée avec succès' });
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const deleteSale = useMutation({
    mutationFn: async (id: string) => {
      if (!effectiveUserId) throw new Error('Non authentifié');
      const { error } = await supabase.from('sales').delete().eq('id', id).eq('user_id', effectiveUserId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales', effectiveUserId] });
      queryClient.invalidateQueries({ queryKey: ['products', effectiveUserId] });
      toast({ title: 'Vente supprimée', description: 'La vente a été supprimée avec succès' });
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  return {
    sales: salesQuery.data || [],
    isLoading: salesQuery.isLoading,
    error: salesQuery.error,
    addSale,
    updateSale,
    deleteSale,
  };
};
