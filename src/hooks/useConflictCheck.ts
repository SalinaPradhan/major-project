import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Conflict {
  conflict_type: 'room' | 'faculty' | 'batch';
  day: string;
  time_slot_label: string;
  entity_name: string;
  entry_count: number;
}

export const useConflictCheck = (scheduleId: string | undefined) => {
  return useQuery({
    queryKey: ['schedule_conflicts', scheduleId],
    queryFn: async () => {
      if (!scheduleId) return [];
      const { data, error } = await supabase.rpc('check_schedule_conflicts', {
        p_schedule_id: scheduleId,
      });
      if (error) throw error;
      return (data ?? []) as Conflict[];
    },
    enabled: !!scheduleId,
  });
};
