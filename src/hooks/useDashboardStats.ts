import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  departments: number;
  rooms: number;
  faculty: number;
  courses: number;
  batches: number;
  schedules: number;
  totalRooms: number;
  availableRooms: number;
  totalFaculty: number;
  activeFaculty: number;
  totalStaff: number;
  assignedStaff: number;
  totalAssets: number;
  workingAssets: number;
  scheduledClasses: number;
  conflicts: number;
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const [deptRes, roomsRes, facultyRes, coursesRes, batchesRes, schedulesRes] = await Promise.all([
        supabase.from('departments').select('id', { count: 'exact', head: true }),
        supabase.from('rooms').select('id', { count: 'exact', head: true }),
        supabase.from('faculty').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('batches').select('id', { count: 'exact', head: true }),
        supabase.from('schedules').select('id', { count: 'exact', head: true }),
      ]);

      return {
        departments: deptRes.count ?? 0,
        rooms: roomsRes.count ?? 0,
        faculty: facultyRes.count ?? 0,
        courses: coursesRes.count ?? 0,
        batches: batchesRes.count ?? 0,
        schedules: schedulesRes.count ?? 0,
        totalRooms: roomsRes.count ?? 0,
        availableRooms: roomsRes.count ?? 0,
        totalFaculty: facultyRes.count ?? 0,
        activeFaculty: facultyRes.count ?? 0,
        totalStaff: 0,
        assignedStaff: 0,
        totalAssets: 0,
        workingAssets: 0,
        scheduledClasses: schedulesRes.count ?? 0,
        conflicts: 0,
      };
    },
  });
};
