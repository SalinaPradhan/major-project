import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export const useSchedules = () => {
  return useQuery({
    queryKey: ['schedules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedules')
        .select('*, departments(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useScheduleEntries = (scheduleId: string | null) => {
  return useQuery({
    queryKey: ['schedule_entries', scheduleId],
    enabled: !!scheduleId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedule_entries')
        .select(`
          *,
          room:rooms(*),
          time_slot:time_slots(*),
          teaching_assignment:teaching_assignments(
            *,
            course:courses(*),
            faculty:faculty(*),
            batch:batches(*)
          )
        `)
        .eq('schedule_id', scheduleId!);
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (schedule: TablesInsert<'schedules'>) => {
      const { data, error } = await supabase.from('schedules').insert(schedule).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schedules'] }),
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...schedule }: TablesUpdate<'schedules'> & { id: string }) => {
      const { data, error } = await supabase.from('schedules').update(schedule).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schedules'] }),
  });
};

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('schedules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schedules'] }),
  });
};
