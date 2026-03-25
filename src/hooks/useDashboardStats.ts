import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { DashboardStats } from '@/types';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const [
        roomsResult,
        facultyResult,
        coursesResult,
        batchesResult,
        schedulesResult,
      ] = await Promise.all([
        supabase.from('rooms').select('id', { count: 'exact', head: true }),
        supabase.from('faculty').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('batches').select('id', { count: 'exact', head: true }),
        supabase.from('schedules').select('id', { count: 'exact', head: true }),
      ]);

      return {
        totalRooms: roomsResult.count ?? 0,
        availableRooms: roomsResult.count ?? 0,
        totalFaculty: facultyResult.count ?? 0,
        activeFaculty: facultyResult.count ?? 0,
        totalStaff: 0,
        assignedStaff: 0,
        totalAssets: 0,
        workingAssets: 0,
        scheduledClasses: schedulesResult.count ?? 0,
        conflicts: 0,
      };
    },
  });
};
