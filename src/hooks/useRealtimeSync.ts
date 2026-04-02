import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useRealtimeSync(
  table: string,
  queryKey: string[],
  ownerId: string | undefined
) {
  const queryClient = useQueryClient();
  const queryKeyRef = useRef(queryKey);
  queryKeyRef.current = queryKey;

  useEffect(() => {
    if (!ownerId) return;

    const channel = supabase
      .channel(`realtime-${table}-${ownerId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table,
        filter: `user_id=eq.${ownerId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: queryKeyRef.current });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, ownerId, queryClient]);
}
