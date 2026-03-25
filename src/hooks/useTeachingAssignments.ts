import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert } from '@/integrations/supabase/types';

export const useTeachingAssignments = () => {
  return useQuery({
    queryKey: ['teaching_assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teaching_assignments')
        .select(`
          *,
          faculty:faculty(*),
          course:courses(*),
          batch:batches(*)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateTeachingAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (assignment: TablesInsert<'teaching_assignments'>) => {
      const { data, error } = await supabase
        .from('teaching_assignments')
        .insert(assignment)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teaching_assignments'] }),
  });
};

export const useDeleteTeachingAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('teaching_assignments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teaching_assignments'] }),
  });
};
