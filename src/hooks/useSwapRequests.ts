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
      // Sample data until swap_requests table is created
      return [
        {
          id: 'swap-1',
          requesterId: 'faculty-1',
          requesterName: 'Dr. Gupta',
          fromDay: 'Monday',
          fromSlot: 'Period 1',
          toDay: 'Wednesday',
          toSlot: 'Period 3',
          reason: 'Department meeting conflict on Monday mornings',
          status: 'pending',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'swap-2',
          requesterId: 'faculty-2',
          requesterName: 'Dr. Patel',
          fromDay: 'Thursday',
          fromSlot: 'Period 5',
          toDay: 'Friday',
          toSlot: 'Period 2',
          reason: 'Lab equipment availability on Friday',
          status: 'pending',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: 'swap-3',
          requesterId: 'faculty-3',
          requesterName: 'Dr. Singh',
          fromDay: 'Tuesday',
          fromSlot: 'Period 4',
          toDay: 'Tuesday',
          toSlot: 'Period 6',
          reason: 'Student feedback — prefer afternoon slot',
          status: 'approved',
          createdAt: new Date(Date.now() - 432000000).toISOString(),
        },
      ];
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
