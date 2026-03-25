import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export const useFaculty = () => {
  return useQuery({
    queryKey: ['faculty'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faculty')
        .select('*, departments(name)')
        .order('name');
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateFaculty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (faculty: TablesInsert<'faculty'>) => {
      const { data, error } = await supabase.from('faculty').insert(faculty).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['faculty'] }),
  });
};

export const useUpdateFaculty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...faculty }: TablesUpdate<'faculty'> & { id: string }) => {
      const { data, error } = await supabase.from('faculty').update(faculty).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['faculty'] }),
  });
};

export const useDeleteFaculty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('faculty').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['faculty'] }),
  });
};
