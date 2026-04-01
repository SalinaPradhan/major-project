import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SwapRequest {
  id: string;
  requesterId: string;
  facultyId: string;
  requesterName: string;
  fromDay: string;
  fromSlot: string;
  fromSlotId: string;
  toDay: string;
  toSlot: string;
  toSlotId: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export const useSwapRequests = (facultyId?: string | null) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['swap_requests', facultyId],
    enabled: !!user,
    queryFn: async (): Promise<SwapRequest[]> => {
      let query = supabase
        .from('swap_requests')
        .select('*, from_slot:time_slots!swap_requests_from_slot_id_fkey(label), to_slot:time_slots!swap_requests_to_slot_id_fkey(label)')
        .order('created_at', { ascending: false });

      if (facultyId) {
        query = query.eq('faculty_id', facultyId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data ?? []).map((r: any) => ({
        id: r.id,
        requesterId: r.requester_id,
        facultyId: r.faculty_id,
        requesterName: r.requester_name,
        fromDay: r.from_day,
        fromSlot: r.from_slot?.label ?? r.from_day,
        fromSlotId: r.from_slot_id,
        toDay: r.to_day,
        toSlot: r.to_slot?.label ?? r.to_day,
        toSlotId: r.to_slot_id,
        reason: r.reason,
        status: r.status,
        createdAt: r.created_at,
      }));
    },
  });
};

interface CreateSwapInput {
  facultyId: string;
  requesterName: string;
  fromDay: string;
  fromSlotId: string;
  toDay: string;
  toSlotId: string;
  reason: string;
}

export const useCreateSwapRequest = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateSwapInput) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('swap_requests').insert({
        requester_id: user.id,
        faculty_id: input.facultyId,
        requester_name: input.requesterName,
        from_day: input.fromDay as any,
        from_slot_id: input.fromSlotId,
        to_day: input.toDay as any,
        to_slot_id: input.toSlotId,
        reason: input.reason,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['swap_requests'] }),
  });
};

export const useUpdateSwapRequestStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('swap_requests')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['swap_requests'] }),
  });
};
