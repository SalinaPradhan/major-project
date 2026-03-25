import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface GenerateParams {
  scheduleId: string;
  populationSize?: number;
  generationCount?: number;
  mutationRate?: number;
}

export const useGenerateTimetable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ scheduleId, populationSize = 50, generationCount = 200, mutationRate = 0.1 }: GenerateParams) => {
      const { data, error } = await supabase.functions.invoke('generate-timetable', {
        body: {
          schedule_id: scheduleId,
          population_size: populationSize,
          generation_count: generationCount,
          mutation_rate: mutationRate,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['schedule_entries', vars.scheduleId] });
    },
  });
};
