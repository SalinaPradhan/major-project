import { useAuth } from '@/contexts/AuthContext';
import { useSchedules, useScheduleEntries } from '@/hooks/useSchedules';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StudentScheduleTable, type StudentClassEntry } from '@/components/dashboard/StudentScheduleTable';
import { AnnouncementsPanel } from '@/components/dashboard/AnnouncementsPanel';
import { WeeklyGrid, type GridCell } from '@/components/dashboard/WeeklyGrid';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ExternalLink, FileDown } from 'lucide-react';
import { format } from 'date-fns';
import { useMemo } from 'react';

const DAY_MAP: Record<string, string> = {
  0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday',
  4: 'thursday', 5: 'friday', 6: 'saturday',
};
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export default function StudentDashboard() {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.display_name ?? user?.email?.split('@')[0] ?? 'Student';
  const initials = displayName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  const todayStr = format(new Date(), 'EEE, dd MMM yyyy');
  const todayDay = DAY_MAP[new Date().getDay()];

  // Get student's profile for batch_id
  const { data: profile } = useQuery({
    queryKey: ['my_profile', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, batch:batches(*, departments(name))')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const batchId = profile?.batch_id;
  const batch = (profile as any)?.batch;
  const batchLabel = batch ? `${batch.name} Sem ${batch.semester} · Section ${batch.section}` : '';

  // Published schedule
  const { data: schedules = [] } = useSchedules();
  const published = schedules.find((s) => s.status === 'published');
  const { data: entries = [], isLoading: entriesLoading } = useScheduleEntries(published?.id ?? null);

  // Time slots
  const { data: timeSlots = [] } = useQuery({
    queryKey: ['time_slots'],
    queryFn: async () => {
      const { data, error } = await supabase.from('time_slots').select('*').order('slot_order');
      if (error) throw error;
      return data;
    },
  });

  // Filter entries for this batch
  const batchEntries = useMemo(() => {
    if (!batchId) return [];
    return entries.filter((e: any) => e.teaching_assignment?.batch_id === batchId);
  }, [entries, batchId]);

  // Today's classes
  const todayClasses = useMemo((): StudentClassEntry[] => {
    return batchEntries
      .filter((e: any) => e.day === todayDay)
      .sort((a: any, b: any) => (a.time_slot?.slot_order ?? 0) - (b.time_slot?.slot_order ?? 0))
      .map((e: any) => ({
        id: e.id,
        startTime: e.time_slot?.start_time?.slice(0, 5) ?? '',
        endTime: e.time_slot?.end_time?.slice(0, 5) ?? '',
        courseName: e.teaching_assignment?.course?.name ?? 'Unknown',
        roomName: e.room?.name ?? '',
        floor: e.room?.floor,
        building: e.room?.building,
        instructorName: e.teaching_assignment?.faculty?.name ?? 'TBA',
        isLab: e.teaching_assignment?.is_lab ?? false,
      }));
  }, [batchEntries, todayDay]);

  // Weekly summary
  const totalWeeklyHours = batchEntries.length;
  const lectureCount = batchEntries.filter((e: any) => !e.teaching_assignment?.is_lab).length;
  const labCount = batchEntries.filter((e: any) => e.teaching_assignment?.is_lab).length;

  // Weekly grid
  const weeklyGrid = useMemo(() => {
    const grid: Record<string, GridCell> = {};
    batchEntries.forEach((e: any) => {
      const slotOrder = e.time_slot?.slot_order;
      if (slotOrder != null && e.day) {
        grid[`${e.day}-${slotOrder}`] = {
          courseName: e.teaching_assignment?.course?.name ?? '?',
          isLab: e.teaching_assignment?.is_lab ?? false,
        };
      }
    });
    return grid;
  }, [batchEntries]);

  const gridSlots = timeSlots.map((s) => ({
    id: s.id,
    label: s.label,
    slotOrder: s.slot_order,
    isBreak: s.is_break,
  }));

  const summaryText = `This week: ${totalWeeklyHours} hrs · ${lectureCount} lectures · ${labCount} labs`;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Good morning, {displayName}</h1>
            <p className="text-sm text-muted-foreground">
              {batchLabel && `${batchLabel} · `}{todayStr}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/timetable">
            <Button variant="outline" size="sm" className="gap-1">
              Full timetable <ExternalLink className="h-3 w-3" />
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="gap-1" disabled>
            Export PDF <FileDown className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Today's Classes Table */}
      <StudentScheduleTable
        entries={todayClasses}
        totalWeeklyHours={totalWeeklyHours}
        lectureCount={lectureCount}
        labCount={labCount}
        tutorialCount={0}
        loading={entriesLoading}
      />

      {/* Bottom: Announcements + Weekly Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AnnouncementsPanel />
        <WeeklyGrid
          grid={weeklyGrid}
          timeSlots={gridSlots}
          days={DAYS}
          summaryText={summaryText}
          loading={entriesLoading}
        />
      </div>
    </div>
  );
}
