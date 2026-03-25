import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_type: 'exam' | 'seminar' | 'workshop' | 'meeting' | 'other';
  room_id: string | null;
  event_date: string;
  start_time: string;
  end_time: string;
  created_by: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  rooms?: { name: string } | null;
}

export interface EventInsert {
  title: string;
  description?: string;
  event_type: 'exam' | 'seminar' | 'workshop' | 'meeting' | 'other';
  room_id?: string | null;
  event_date: string;
  start_time: string;
  end_time: string;
  created_by?: string;
  status?: string;
}

export function useEvents() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const eventsQuery = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*, rooms(name)')
        .order('event_date', { ascending: true });
      if (error) throw error;
      return data as Event[];
    },
  });

  const createEvent = useMutation({
    mutationFn: async (event: EventInsert) => {
      const { data, error } = await supabase.from('events').insert(event).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({ title: 'Event created successfully' });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Failed to create event', description: error.message });
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EventInsert> & { id: string }) => {
      const { data, error } = await supabase.from('events').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({ title: 'Event updated successfully' });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Failed to update event', description: error.message });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({ title: 'Event deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Failed to delete event', description: error.message });
    },
  });

  return { events: eventsQuery.data ?? [], isLoading: eventsQuery.isLoading, createEvent, updateEvent, deleteEvent };
}
