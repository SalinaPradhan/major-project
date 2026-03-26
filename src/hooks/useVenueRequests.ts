import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface VenueRequest {
  id: string;
  booking_id: string;
  requestor_id: string;
  requestor_name: string;
  reason: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
}

export const useVenueRequests = (bookingId?: string) => {
  return useQuery({
    queryKey: ['venue_requests', bookingId],
    queryFn: async (): Promise<VenueRequest[]> => {
      let query = supabase
        .from('venue_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (bookingId) {
        query = query.eq('booking_id', bookingId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
};

export const useMyPendingRequests = (userId?: string) => {
  return useQuery({
    queryKey: ['venue_requests_for_host', userId],
    queryFn: async (): Promise<(VenueRequest & { event_name?: string; venue_name?: string })[]> => {
      if (!userId) return [];
      // Get all bookings where user is host
      const { data: bookings } = await supabase
        .from('venue_bookings')
        .select('id, event_name, rooms!venue_bookings_venue_id_fkey(name)')
        .eq('host_id', userId)
        .eq('status', 'confirmed');

      if (!bookings?.length) return [];

      const bookingIds = bookings.map(b => b.id);
      const { data: requests, error } = await supabase
        .from('venue_requests')
        .select('*')
        .in('booking_id', bookingIds)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const bookingMap = Object.fromEntries(
        bookings.map((b: any) => [b.id, { event_name: b.event_name, venue_name: b.rooms?.name }])
      );

      return (requests || []).map(r => ({
        ...r,
        event_name: bookingMap[r.booking_id]?.event_name,
        venue_name: bookingMap[r.booking_id]?.venue_name,
      }));
    },
    enabled: !!userId,
  });
};

export const useCreateVenueRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { booking_id: string; requestor_id: string; requestor_name: string; reason: string }) => {
      const { data, error } = await supabase
        .from('venue_requests')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['venue_requests'] }),
  });
};

export const useReviewVenueRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      const { error } = await supabase
        .from('venue_requests')
        .update({ status, reviewed_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue_requests'] });
      queryClient.invalidateQueries({ queryKey: ['venue_requests_for_host'] });
    },
  });
};
