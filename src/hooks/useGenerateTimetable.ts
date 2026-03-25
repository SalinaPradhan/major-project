import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface GenerateParams {
  scheduleId: string;
  populationSize?: number;
  generationCount?: number;
  mutationRate?: number;
}

interface GenerationProgress {
  currentGeneration: number;
  totalGenerations: number;
  currentFitness: number | null;
  currentViolations: number | null;
  status: string;
}

export const useGenerateTimetable = () => {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // Subscribe to realtime progress updates
  useEffect(() => {
    if (!activeJobId) return;

    const channel = supabase
      .channel(`job-${activeJobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'generation_jobs',
          filter: `id=eq.${activeJobId}`,
        },
        (payload) => {
          const row = payload.new as any;
          setProgress({
            currentGeneration: row.current_generation ?? 0,
            totalGenerations: row.total_generations ?? 0,
            currentFitness: row.current_fitness,
            currentViolations: row.current_violations,
            status: row.status,
          });

          if (row.status === 'completed' || row.status === 'failed') {
            setActiveJobId(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeJobId]);

  const mutation = useMutation({
    mutationFn: async ({ scheduleId, populationSize = 50, generationCount = 200, mutationRate = 0.1 }: GenerateParams) => {
      setProgress({ currentGeneration: 0, totalGenerations: generationCount, currentFitness: null, currentViolations: null, status: 'running' });

      const { data, error } = await supabase.functions.invoke('generate-timetable', {
        body: {
          schedule_id: scheduleId,
          population_size: populationSize,
          generation_count: generationCount,
          mutation_rate: mutationRate,
        },
      });

      if (error) throw error;
      setProgress(null);
      setActiveJobId(null);
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['schedule_entries', vars.scheduleId] });
      queryClient.invalidateQueries({ queryKey: ['schedule_conflicts'] });
    },
    onError: () => {
      setProgress(null);
      setActiveJobId(null);
    },
  });

  return { ...mutation, progress };
};
