import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Payment {
  id: string;
  user_id: string;
  sale_id: string | null;
  customer_first_name: string | null;
  customer_last_name: string | null;
  payment_method: 'especes' | 'orange_money' | 'mtn_money' | 'wave' | 'moov_money' | 'carte_bancaire';
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: 'pending' | 'completed' | 'partial' | 'overdue';
  payment_date: string;
  due_date: string | null;
  customer_phone: string | null;
  notes: string | null;
  proof_image_url: string | null;
  created_at: string;
}

export const usePayments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const paymentsQuery = useQuery({
    queryKey: ['payments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data as Payment[];
    },
    enabled: !!user,
  });

  const addPayment = useMutation({
    mutationFn: async (payment: Omit<Payment, 'id' | 'user_id' | 'created_at' | 'remaining_amount'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('payments')
        .insert([{ 
          ...payment, 
          user_id: user.id,
          // Keep the legacy amount field for compatibility
          amount: payment.paid_amount
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast({
        title: 'Paiement enregistré',
        description: 'Le paiement a été enregistré avec succès',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updatePayment = useMutation({
    mutationFn: async ({ id, ...payment }: Partial<Payment> & { id: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('payments')
        .update(payment)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast({
        title: 'Paiement modifié',
        description: 'Le paiement a été modifié avec succès',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deletePayment = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast({
        title: 'Paiement supprimé',
        description: 'Le paiement a été supprimé avec succès',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    payments: paymentsQuery.data || [],
    isLoading: paymentsQuery.isLoading,
    error: paymentsQuery.error,
    addPayment,
    updatePayment,
    deletePayment,
  };
};