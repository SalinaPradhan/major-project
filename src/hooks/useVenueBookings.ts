import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface VenueBooking {
  id: string;
  venue_id: string;
  host_id: string;
  host_name: string;
  event_name: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  status: string;
  created_at: string;
  venue_name?: string;
  venue_type?: string;
}

interface CreateBookingInput {
  venue_id: string;
  host_id: string;
  host_name: string;
  event_name: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
}

export const useVenueBookings = (venueId?: string) => {
  return useQuery({
    queryKey: ['venue_bookings', venueId],
    queryFn: async (): Promise<VenueBooking[]> => {
      let query = supabase
        .from('venue_bookings')
        .select('*, rooms!venue_bookings_venue_id_fkey(name, room_type)')
        .eq('status', 'confirmed')
        .order('event_date', { ascending: true });

      if (venueId) {
        query = query.eq('venue_id', venueId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((b: any) => ({
        ...b,
        venue_name: b.rooms?.name,
        venue_type: b.rooms?.room_type,
      }));
    },
  });
};

export const useCreateVenueBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateBookingInput) => {
      // Insert booking
      const { data: booking, error } = await supabase
        .from('venue_bookings')
        .insert(input)
        .select('*, rooms!venue_bookings_venue_id_fkey(name)')
        .single();
      if (error) throw error;

      // Create system alert
      const venueName = (booking as any).rooms?.name || 'Unknown Venue';
      await supabase.from('system_alerts').insert({
        alert_type: 'venue_booking',
        title: `New Event: ${input.event_name}`,
        message: `New Event: ${input.event_name} at ${venueName} on ${input.event_date}. Hosted by ${input.host_name}.`,
        related_entity_id: booking.id,
      });

      return booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue_bookings'] });
      queryClient.invalidateQueries({ queryKey: ['system_alerts'] });
    },
  });
};

export const useCancelVenueBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('venue_bookings')
        .update({ status: 'cancelled' })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['venue_bookings'] }),
  });
};
