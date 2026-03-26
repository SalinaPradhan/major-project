import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface SystemAlert {
  id: string;
  alert_type: string;
  title: string;
  message: string;
  related_entity_id: string | null;
  created_at: string;
}

export const useSystemAlerts = (limit?: number) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('system_alerts_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'system_alerts' }, () => {
        queryClient.invalidateQueries({ queryKey: ['system_alerts'] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return useQuery({
    queryKey: ['system_alerts', limit],
    queryFn: async (): Promise<SystemAlert[]> => {
      let query = supabase
        .from('system_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
};
