import { getGreeting } from '@/lib/greeting';
import { useAuth } from '@/contexts/AuthContext';
import { useFacultyByEmail } from '@/hooks/useFaculty';
import { useSchedules, useScheduleEntries } from '@/hooks/useSchedules';
import { useSwapRequests } from '@/hooks/useSwapRequests';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FacultyMetrics } from '@/components/dashboard/FacultyMetrics';
import { ScheduleTimeline, type TimelineEntry } from '@/components/dashboard/ScheduleTimeline';
import { WorkloadCard } from '@/components/dashboard/WorkloadCard';
import { FacultySwapPanel } from '@/components/dashboard/FacultySwapPanel';
import { WeeklyGrid, type GridCell } from '@/components/dashboard/WeeklyGrid';
import { AvailabilityGrid } from '@/components/dashboard/AvailabilityGrid';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ExternalLink, FileDown, CalendarSync } from 'lucide-react';
import { downloadICalFile, type ICalEntry } from '@/lib/icalExport';
import { exportTimetablePdf } from '@/lib/pdfExport';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useMemo } from 'react';

const DAY_MAP: Record<string, string> = {
  0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday',
  4: 'thursday', 5: 'friday', 6: 'saturday',
};
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export default function FacultyDashboard() {
  const { user } = useAuth();
  const email = user?.email;
  const displayName = user?.user_metadata?.display_name ?? email?.split('@')[0] ?? 'Faculty';
  const initials = displayName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  const todayStr = format(new Date(), 'EEE, dd MMM yyyy');
  const todayDay = DAY_MAP[new Date().getDay()];

  const { data: facultyRecord, isLoading: facultyLoading } = useFacultyByEmail(email);
  const facultyId = facultyRecord?.id ?? null;
  const deptName = (facultyRecord as any)?.departments?.name ?? '';

  const { data: schedules = [] } = useSchedules();
  const published = schedules.find((s) => s.status === 'published');
  const { data: entries = [], isLoading: entriesLoading } = useScheduleEntries(published?.id ?? null);

  const { data: timeSlots = [] } = useQuery({
    queryKey: ['time_slots'],
    queryFn: async () => {
      const { data, error } = await supabase.from('time_slots').select('*').order('slot_order');
      if (error) throw error;
      return data;
    },
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['teaching_assignments', facultyId],
    enabled: !!facultyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teaching_assignments')
        .select('*, course:courses(*), batch:batches(*)')
        .eq('faculty_id', facultyId!);
      if (error) throw error;
      return data;
    },
  });

  const { data: swaps = [] } = useSwapRequests();

  const facultyEntries = useMemo(() => {
    if (!facultyId) return [];
    return entries.filter((e: any) => e.teaching_assignment?.faculty_id === facultyId);
  }, [entries, facultyId]);

  const todayEntries = useMemo((): TimelineEntry[] => {
    return facultyEntries
      .filter((e: any) => e.day === todayDay)
      .sort((a: any, b: any) => (a.time_slot?.slot_order ?? 0) - (b.time_slot?.slot_order ?? 0))
      .map((e: any) => ({
        id: e.id,
        startTime: e.time_slot?.start_time?.slice(0, 5) ?? '',
        endTime: e.time_slot?.end_time?.slice(0, 5) ?? '',
        courseName: e.teaching_assignment?.course?.name ?? 'Unknown',
        batchName: `${e.teaching_assignment?.batch?.name ?? ''}-${e.teaching_assignment?.batch?.section ?? ''}`,
        roomName: e.room?.name ?? '',
        roomCapacity: e.room?.capacity,
        isLab: e.teaching_assignment?.is_lab ?? false,
      }));
  }, [facultyEntries, todayDay]);

  const todayClasses = todayEntries.length;
  const nextClassTime = useMemo(() => {
    const now = new Date();
    for (const e of todayEntries) {
      const [h, m] = e.startTime.split(':').map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      if (d > now) return e.startTime;
    }
    return null;
  }, [todayEntries]);

  const weeklyLoad = facultyRecord?.current_load ?? facultyEntries.length;
  const maxWeekly = facultyRecord?.max_hours_per_week ?? 18;
  const semesterCourses = assignments.length;
  const lectureAssignments = assignments.filter((a: any) => !a.is_lab).length;
  const labAssignments = assignments.filter((a: any) => a.is_lab).length;
  const pendingSwaps = swaps.filter((s) => s.status === 'pending').length;

  const lectureHours = facultyEntries.filter((e: any) => !e.teaching_assignment?.is_lab).length;
  const labHours = facultyEntries.filter((e: any) => e.teaching_assignment?.is_lab).length;

  const weeklyGrid = useMemo(() => {
    const grid: Record<string, GridCell> = {};
    facultyEntries.forEach((e: any) => {
      const slotOrder = e.time_slot?.slot_order;
      if (slotOrder != null && e.day) {
        grid[`${e.day}-${slotOrder}`] = {
          courseName: e.teaching_assignment?.course?.name ?? '?',
          isLab: e.teaching_assignment?.is_lab ?? false,
        };
      }
    });
    return grid;
  }, [facultyEntries]);

  const gridSlots = timeSlots.map((s) => ({
    id: s.id, label: s.label, slotOrder: s.slot_order, isBreak: s.is_break,
  }));

  const loading = facultyLoading || entriesLoading;

  return (
    <div className="space-y-3.5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
            {initials}
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground">{getGreeting()}, {displayName}</h1>
            <p className="text-[11px] text-muted-foreground">
              {deptName && `${deptName} · `}{todayStr}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/timetable">
            <Button variant="outline" size="sm" className="gap-1 text-xs">
              My timetable <ExternalLink className="h-3 w-3" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="gap-1 text-xs"
            disabled={facultyEntries.length === 0}
            onClick={() => {
              exportTimetablePdf({
                title: `Timetable — ${displayName}`,
                subtitle: deptName || undefined,
                grid: weeklyGrid,
                timeSlots: gridSlots,
                days: DAYS,
                fileName: `timetable-${displayName.replace(/\s+/g, '_')}.pdf`,
              });
              toast.success('PDF downloaded');
            }}
          >
            Export PDF <FileDown className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1 text-xs"
            disabled={facultyEntries.length === 0}
            onClick={() => {
              const icalEntries: ICalEntry[] = facultyEntries.map((e: any) => ({
                courseName: e.teaching_assignment?.course?.name ?? 'Class',
                roomName: e.room?.name ?? '',
                day: e.day,
                startTime: e.time_slot?.start_time?.slice(0, 5) ?? '09:00',
                endTime: e.time_slot?.end_time?.slice(0, 5) ?? '10:00',
                isLab: e.teaching_assignment?.is_lab ?? false,
              }));
              downloadICalFile(icalEntries, `timetable-${displayName.replace(/\s+/g, '_')}.ics`, `${displayName} Timetable`);
              toast.success('Calendar file downloaded');
            }}
          >
            Sync Calendar <CalendarSync className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <FacultyMetrics
        todayClasses={todayClasses}
        nextClassTime={nextClassTime}
        weeklyLoad={weeklyLoad}
        maxWeeklyHours={maxWeekly}
        semesterCourses={semesterCourses}
        lectureCount={lectureAssignments}
        labCount={labAssignments}
        tutorialCount={0}
        pendingSwaps={pendingSwaps}
      />

      {/* Middle row */}
      <div className="grid gap-3.5 lg:grid-cols-[1.4fr_1fr]">
        <ScheduleTimeline entries={todayEntries} loading={loading} />
        <div className="space-y-3.5">
          <WorkloadCard
            currentHours={weeklyLoad}
            maxHours={maxWeekly}
            lectureHours={lectureHours}
            labHours={labHours}
            tutorialHours={0}
          />
          <FacultySwapPanel facultyId={facultyId} requesterName={displayName} />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid gap-3.5 lg:grid-cols-2">
        <WeeklyGrid grid={weeklyGrid} timeSlots={gridSlots} days={DAYS} loading={loading} />
        <AvailabilityGrid facultyId={facultyId} />
      </div>
    </div>
  );
}
