import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from './useCompany';
import { toast } from 'sonner';

export interface StockAlert {
  id: string;
  productName: string;
  currentStock: number;
  minQuantity: number;
  timestamp: Date;
  read: boolean;
}

export function useStockAlerts() {
  const { user, isEmployee, memberInfo } = useAuth();
  const { company } = useCompany();
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const effectiveUserId = isEmployee ? (memberInfo?.owner_id || company?.owner_id) : user?.id;

  useEffect(() => {
    if (!effectiveUserId) return;

    const loadAlerts = async () => {
      const { data } = await supabase
        .from('products')
        .select('id, name, quantity, min_quantity')
        .eq('user_id', effectiveUserId);

      if (data) {
        const lowStock = data
          .filter(p => p.min_quantity > 0 && p.quantity <= p.min_quantity)
          .map(p => ({
            id: p.id,
            productName: p.name,
            currentStock: p.quantity,
            minQuantity: p.min_quantity,
            timestamp: new Date(),
            read: false,
          }));
        setAlerts(lowStock);
      }
    };

    loadAlerts();
  }, [effectiveUserId]);

  useEffect(() => {
    if (!effectiveUserId) return;

    const channel = supabase
      .channel(`stock-alerts-${effectiveUserId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'products',
        filter: `user_id=eq.${effectiveUserId}`,
      }, (payload) => {
        const p = payload.new as any;

        if (p.min_quantity > 0 && p.quantity <= p.min_quantity) {
          setAlerts(prev => {
            const existing = prev.find(a => a.id === p.id);
            if (!existing) {
              toast.warning(`⚠️ Stock bas : ${p.name} — Il reste ${p.quantity} unités`);
            }
            const filtered = prev.filter(a => a.id !== p.id);
            return [...filtered, {
              id: p.id,
              productName: p.name,
              currentStock: p.quantity,
              minQuantity: p.min_quantity,
              timestamp: new Date(),
              read: false,
            }];
          });
        } else {
          setAlerts(prev => prev.filter(a => a.id !== p.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [effectiveUserId]);

  const markAsRead = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  }, []);

  const markAllAsRead = useCallback(() => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  }, []);

  const unreadCount = alerts.filter(a => !a.read).length;

  return { alerts, unreadCount, markAsRead, markAllAsRead };
}
