import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RoomUtilization {
  id: string;
  name: string;
  room_type: string;
  capacity: number;
  utilization_target: number;
  scheduled_hours: number;
  utilization_percent: number;
}

export const useRoomUtilization = (scheduleId?: string) => {
  return useQuery({
    queryKey: ['room_utilization', scheduleId],
    queryFn: async (): Promise<RoomUtilization[]> => {
      // Fetch rooms
      const { data: rooms, error: roomsError } = await supabase
        .from('rooms')
        .select('id, name, room_type, capacity, utilization_target');
      if (roomsError) throw roomsError;

      if (!scheduleId || !rooms) {
        return (rooms ?? []).map(r => ({
          ...r,
          utilization_target: r.utilization_target ?? 80,
          scheduled_hours: 0,
          utilization_percent: 0,
        }));
      }

      // Count entries per room for the given schedule
      const { data: entries, error: entriesError } = await supabase
        .from('schedule_entries')
        .select('room_id')
        .eq('schedule_id', scheduleId);
      if (entriesError) throw entriesError;

      const roomHours = new Map<string, number>();
      for (const e of entries ?? []) {
        roomHours.set(e.room_id, (roomHours.get(e.room_id) || 0) + 1);
      }

      // 6 days * ~6 slots = 36 max hours per week
      const maxSlots = 36;

      return rooms.map(r => {
        const hours = roomHours.get(r.id) || 0;
        return {
          ...r,
          utilization_target: r.utilization_target ?? 80,
          scheduled_hours: hours,
          utilization_percent: maxSlots > 0 ? Math.round((hours / maxSlots) * 100) : 0,
        };
      });
    },
    enabled: true,
  });
};
