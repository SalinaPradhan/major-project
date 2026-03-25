import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type DayOfWeek = Database['public']['Enums']['day_of_week'];

interface SetPreferenceInput {
  faculty_id: string;
  day: DayOfWeek;
  time_slot_id: string;
  preference: number;
}

export const useFacultyAvailability = (facultyId: string | null) => {
  return useQuery({
    queryKey: ['faculty_preferences', facultyId],
    enabled: !!facultyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faculty_preferences')
        .select('*')
        .eq('faculty_id', facultyId!);
      if (error) throw error;
      return data;
    },
  });
};

export const useSetFacultyPreference = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ faculty_id, day, time_slot_id, preference }: SetPreferenceInput) => {
      // Upsert: check if exists first
      const { data: existing } = await supabase
        .from('faculty_preferences')
        .select('id')
        .eq('faculty_id', faculty_id)
        .eq('day', day)
        .eq('time_slot_id', time_slot_id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('faculty_preferences')
          .update({ preference })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('faculty_preferences')
          .insert({ faculty_id, day, time_slot_id, preference });
        if (error) throw error;
      }
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['faculty_preferences', vars.faculty_id] });
    },
  });
};
