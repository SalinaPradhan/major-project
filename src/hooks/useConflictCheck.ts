import { useMemo } from 'react';

interface ScheduleEntry {
  id: string;
  day: string;
  time_slot_id: string;
  room_id: string;
  teaching_assignment: {
    faculty_id: string;
    batch_id: string;
    course: { name: string } | null;
    faculty: { name: string } | null;
    batch: { name: string } | null;
  } | null;
  room: { name: string } | null;
  time_slot: { label: string } | null;
}

export interface Conflict {
  type: 'room' | 'faculty' | 'batch';
  day: string;
  timeSlotId: string;
  entries: ScheduleEntry[];
  description: string;
}

export const useConflictCheck = (entries: ScheduleEntry[] | undefined) => {
  return useMemo(() => {
    if (!entries || entries.length === 0) return [];

    const conflicts: Conflict[] = [];

    // Group entries by day + time_slot
    const groups = new Map<string, ScheduleEntry[]>();
    for (const entry of entries) {
      const key = `${entry.day}__${entry.time_slot_id}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(entry);
    }

    for (const [, group] of groups) {
      if (group.length < 2) continue;

      // Room conflicts
      const roomMap = new Map<string, ScheduleEntry[]>();
      for (const e of group) {
        if (!roomMap.has(e.room_id)) roomMap.set(e.room_id, []);
        roomMap.get(e.room_id)!.push(e);
      }
      for (const [, roomEntries] of roomMap) {
        if (roomEntries.length > 1) {
          conflicts.push({
            type: 'room',
            day: roomEntries[0].day,
            timeSlotId: roomEntries[0].time_slot_id,
            entries: roomEntries,
            description: `Room ${roomEntries[0].room?.name} is double-booked on ${roomEntries[0].day} at ${roomEntries[0].time_slot?.label}`,
          });
        }
      }

      // Faculty conflicts
      const facultyMap = new Map<string, ScheduleEntry[]>();
      for (const e of group) {
        const fid = e.teaching_assignment?.faculty_id;
        if (!fid) continue;
        if (!facultyMap.has(fid)) facultyMap.set(fid, []);
        facultyMap.get(fid)!.push(e);
      }
      for (const [, fEntries] of facultyMap) {
        if (fEntries.length > 1) {
          conflicts.push({
            type: 'faculty',
            day: fEntries[0].day,
            timeSlotId: fEntries[0].time_slot_id,
            entries: fEntries,
            description: `Faculty ${fEntries[0].teaching_assignment?.faculty?.name} has overlapping classes on ${fEntries[0].day} at ${fEntries[0].time_slot?.label}`,
          });
        }
      }

      // Batch conflicts
      const batchMap = new Map<string, ScheduleEntry[]>();
      for (const e of group) {
        const bid = e.teaching_assignment?.batch_id;
        if (!bid) continue;
        if (!batchMap.has(bid)) batchMap.set(bid, []);
        batchMap.get(bid)!.push(e);
      }
      for (const [, bEntries] of batchMap) {
        if (bEntries.length > 1) {
          conflicts.push({
            type: 'batch',
            day: bEntries[0].day,
            timeSlotId: bEntries[0].time_slot_id,
            entries: bEntries,
            description: `Batch ${bEntries[0].teaching_assignment?.batch?.name} has overlapping classes on ${bEntries[0].day} at ${bEntries[0].time_slot?.label}`,
          });
        }
      }
    }

    return conflicts;
  }, [entries]);
};
