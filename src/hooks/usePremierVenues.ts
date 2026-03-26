import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

const PREMIER_TYPES = ['auditorium', 'conference_hall', 'indoor_stadium', 'cineplex'] as const;

export const usePremierVenues = () => {
  return useQuery({
    queryKey: ['premier_venues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .in('room_type', PREMIER_TYPES)
        .order('name');
      if (error) throw error;
      return data as Tables<'rooms'>[];
    },
  });
};

export const isPremierVenueType = (type: string) => (PREMIER_TYPES as readonly string[]).includes(type);
