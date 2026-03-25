import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Swap requests are a planned feature — this hook provides the interface
// once the swap_requests table is created. For now it returns empty data.

export interface SwapRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  fromDay: string;
  fromSlot: string;
  toDay: string;
  toSlot: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export const useSwapRequests = () => {
  return useQuery({
    queryKey: ['swap_requests'],
    queryFn: async (): Promise<SwapRequest[]> => {
      // TODO: Query swap_requests table once created
      return [];
    },
  });
};

export const useCreateSwapRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_request: Omit<SwapRequest, 'id' | 'status' | 'createdAt'>) => {
      // TODO: Insert into swap_requests table
      throw new Error('Swap requests table not yet configured');
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['swap_requests'] }),
  });
};

export const useUpdateSwapRequestStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_params: { id: string; status: 'approved' | 'rejected' }) => {
      // TODO: Update swap_requests table
      throw new Error('Swap requests table not yet configured');
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['swap_requests'] }),
  });
};
