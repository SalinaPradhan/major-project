import { useAuth } from '@/contexts/AuthContext';
import { useSchedules, useScheduleEntries } from '@/hooks/useSchedules';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSystemAlerts } from '@/hooks/useSystemAlerts';
import { StudentScheduleTable, type StudentClassEntry } from '@/components/dashboard/StudentScheduleTable';
import { AnnouncementsPanel } from '@/components/dashboard/AnnouncementsPanel';
import { WeeklyGrid, type GridCell } from '@/components/dashboard/WeeklyGrid';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ExternalLink, FileDown, BookOpen, Clock, CalendarDays, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { useMemo, useEffect, useState } from 'react';

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

  const { data: schedules = [] } = useSchedules();
  const published = schedules.find((s) => s.status === 'published');
  const { data: entries = [], isLoading: entriesLoading } = useScheduleEntries(published?.id ?? null);
  const { data: alerts = [] } = useSystemAlerts(10);

  const { data: timeSlots = [] } = useQuery({
    queryKey: ['time_slots'],
    queryFn: async () => {
      const { data, error } = await supabase.from('time_slots').select('*').order('slot_order');
      if (error) throw error;
      return data;
    },
  });

  const batchEntries = useMemo(() => {
    if (!batchId) return [];
    return entries.filter((e: any) => e.teaching_assignment?.batch_id === batchId);
  }, [entries, batchId]);

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

  const totalWeeklyHours = batchEntries.length;
  const lectureCount = batchEntries.filter((e: any) => !e.teaching_assignment?.is_lab).length;
  const labCount = batchEntries.filter((e: any) => e.teaching_assignment?.is_lab).length;

  // Next class countdown
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const nextClass = useMemo(() => {
    const now = new Date();
    return todayClasses.find((e) => {
      const [h, m] = e.startTime.split(':').map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return d > now;
    });
  }, [todayClasses]);

  const nextMins = useMemo(() => {
    if (!nextClass) return null;
    const now = new Date();
    const [h, m] = nextClass.startTime.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return Math.max(0, Math.round((d.getTime() - now.getTime()) / 60000));
  }, [nextClass]);

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
    id: s.id, label: s.label, slotOrder: s.slot_order, isBreak: s.is_break,
  }));

  const summaryText = `This week: ${totalWeeklyHours} hrs · ${lectureCount} lectures · ${labCount} labs`;

  return (
    <div className="space-y-3.5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
            {initials}
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground">Good morning, {displayName}</h1>
            <p className="text-[11px] text-muted-foreground">
              {batchLabel && `${batchLabel} · `}{todayStr}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/timetable">
            <Button variant="outline" size="sm" className="gap-1 text-xs">
              Full timetable <ExternalLink className="h-3 w-3" />
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="gap-1 text-xs" disabled>
            Export PDF <FileDown className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Metrics row */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[140px] bg-secondary rounded-xl px-4 py-3">
          <p className="text-[11px] text-muted-foreground mb-1">Today's Classes</p>
          <p className="text-[22px] font-medium text-foreground leading-tight">{todayClasses.length}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {lectureCount > 0 && `${lectureCount} lec`}{labCount > 0 && ` · ${labCount} lab`}
          </p>
        </div>
        <div className="flex-1 min-w-[140px] bg-secondary rounded-xl px-4 py-3">
          <p className="text-[11px] text-muted-foreground mb-1">Next Class In</p>
          <p className="text-[22px] font-medium text-foreground leading-tight">
            {nextMins !== null ? `${nextMins} min` : '—'}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {nextClass ? nextClass.courseName : 'No more today'}
          </p>
        </div>
        <div className="flex-1 min-w-[140px] bg-secondary rounded-xl px-4 py-3">
          <p className="text-[11px] text-muted-foreground mb-1">This Week</p>
          <p className="text-[22px] font-medium text-foreground leading-tight">{totalWeeklyHours} hrs</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{lectureCount + labCount} sessions</p>
        </div>
        <div className="flex-1 min-w-[140px] bg-secondary rounded-xl px-4 py-3">
          <p className="text-[11px] text-muted-foreground mb-1">Announcements</p>
          <p className="text-[22px] font-medium text-foreground leading-tight">{alerts.length}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">active notices</p>
        </div>
      </div>

      {/* Middle: Today's classes + Countdown + Announcements */}
      <div className="grid gap-3.5 lg:grid-cols-[1.5fr_1fr]">
        <StudentScheduleTable
          entries={todayClasses}
          totalWeeklyHours={totalWeeklyHours}
          lectureCount={lectureCount}
          labCount={labCount}
          tutorialCount={0}
          loading={entriesLoading}
        />
        <div className="space-y-3.5">
          {/* Countdown ring widget */}
          {nextClass && nextMins !== null && (
            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
              <div className="relative w-[80px] h-[80px] shrink-0">
                <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                  <circle cx="40" cy="40" r="35" fill="none" stroke="hsl(var(--secondary))" strokeWidth="6" />
                  <circle
                    cx="40" cy="40" r="35" fill="none" stroke="hsl(var(--primary))" strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 35}`}
                    strokeDashoffset={`${2 * Math.PI * 35 * (1 - Math.min(nextMins / 60, 1))}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-foreground">{nextMins}</span>
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{nextClass.courseName}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {nextClass.roomName}{nextClass.floor != null && ` · Floor ${nextClass.floor}`}
                </p>
                <p className="text-[11px] text-muted-foreground">{nextClass.instructorName}</p>
              </div>
            </div>
          )}
          <AnnouncementsPanel />
        </div>
      </div>

      {/* Bottom: Weekly timetable */}
      <WeeklyGrid
        grid={weeklyGrid}
        timeSlots={gridSlots}
        days={DAYS}
        summaryText={summaryText}
        loading={entriesLoading}
        highlightToday
      />
    </div>
  );
}
