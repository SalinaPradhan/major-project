import { useState, useMemo, useEffect } from "react";
import { useSchedules, useScheduleEntries } from "@/hooks/useSchedules";
import { useTimeSlots } from "@/hooks/useTimeSlots";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
const DAY_LABELS: Record<string, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
};

const COLORS = [
  "bg-primary/15 border-primary/30 text-foreground",
  "bg-accent/15 border-accent/30 text-foreground",
  "bg-destructive/10 border-destructive/30 text-foreground",
  "bg-secondary border-secondary text-foreground",
  "bg-muted border-muted text-foreground",
];

export default function Timetable() {
  const { data: schedules = [] } = useSchedules();
  const { isStudent } = useAuth();
  const published = useMemo(() => schedules.filter((s) => s.status === "published"), [schedules]);
  const allSchedules = isStudent ? published : schedules;
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");
  const [selectedBatchId, setSelectedBatchId] = useState<string>("all");

  // Auto-select first published schedule on load
  useEffect(() => {
    if (!selectedScheduleId && published.length > 0) {
      setSelectedScheduleId(published[0].id);
    }
  }, [published, selectedScheduleId]);
  const { data: entries = [] } = useScheduleEntries(selectedScheduleId || null);
  const { data: allTimeSlots = [] } = useTimeSlots();

  // Extract unique batches from entries
  const batches = useMemo(() => {
    const batchMap = new Map<string, { id: string; name: string }>();
    entries.forEach((e: any) => {
      const batch = e.teaching_assignment?.batch;
      const batchId = e.teaching_assignment?.batch_id;
      if (batchId && batch) {
        batchMap.set(batchId, { id: batchId, name: batch.name || batchId });
      }
    });
    return [...batchMap.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [entries]);

  // Auto-select first batch when entries load
  useEffect(() => {
    if (batches.length > 0 && selectedBatchId === "all") {
      setSelectedBatchId(batches[0].id);
    }
  }, [batches, selectedBatchId]);

  // Reset batch selection when schedule changes
  useEffect(() => {
    setSelectedBatchId("all");
  }, [selectedScheduleId]);

  // Filter entries by selected batch
  const filteredEntries = useMemo(() => {
    if (selectedBatchId === "all") return entries;
    return entries.filter((e: any) => e.teaching_assignment?.batch_id === selectedBatchId);
  }, [entries, selectedBatchId]);

  // Build a color map for courses
  const courseColorMap = useMemo(() => {
    const map = new Map<string, string>();
    const courseIds = [...new Set(filteredEntries.map((e: any) => e.teaching_assignment?.course_id))];
    courseIds.forEach((id, i) => {
      if (id) map.set(id, COLORS[i % COLORS.length]);
    });
    return map;
  }, [filteredEntries]);

  // Use all time slots from DB (sorted by slot_order)
  const timeSlots = allTimeSlots;

  // Build grid lookup: day -> time_slot_id -> entry[]
  const grid = useMemo(() => {
    const g: Record<string, Record<string, any[]>> = {};
    DAYS.forEach((d) => {
      g[d] = {};
    });
    filteredEntries.forEach((e: any) => {
      if (!g[e.day]) g[e.day] = {};
      if (!g[e.day][e.time_slot_id]) g[e.day][e.time_slot_id] = [];
      g[e.day][e.time_slot_id].push(e);
    });
    return g;
  }, [filteredEntries]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Calendar className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Timetable</h1>
        </div>
        <div className="flex items-center gap-3">
          {allSchedules.length > 0 && (
            <Select value={selectedScheduleId} onValueChange={setSelectedScheduleId}>
              <SelectTrigger className="w-60">
                <SelectValue placeholder="Select a schedule" />
              </SelectTrigger>
              <SelectContent>
                {allSchedules.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} <span className="text-muted-foreground ml-1">({s.status})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {batches.length > 0 && selectedScheduleId && (
            <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                {batches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {!selectedScheduleId ? (
        <Card className="glass-card">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center py-12">
              {allSchedules.length === 0
                ? "No schedules available yet. Generate one from the AI Scheduler."
                : "Select a schedule above to view the timetable."}
            </p>
          </CardContent>
        </Card>
      ) : filteredEntries.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center py-12">No entries found for this schedule.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="p-2 border border-border bg-muted text-muted-foreground font-medium text-left w-20">
                  Day
                </th>
                {timeSlots.map((ts) => (
                  <th
                    key={ts.id}
                    className={cn(
                      "p-2 border border-border text-center font-medium min-w-[120px]",
                      ts.is_break ? "bg-muted/50 text-muted-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <div className="text-xs">{ts.label}</div>
                    <div className="text-[10px] opacity-70">
                      {ts.start_time?.slice(0, 5)}–{ts.end_time?.slice(0, 5)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day) => (
                <tr key={day}>
                  <td className="p-2 border border-border bg-muted font-medium text-foreground">{DAY_LABELS[day]}</td>
                  {timeSlots.map((ts) => {
                    if (ts.is_break) {
                      return (
                        <td
                          key={ts.id}
                          className="p-1 border border-border bg-muted/30 text-center text-[10px] text-muted-foreground"
                        >
                          Break
                        </td>
                      );
                    }
                    const cellEntries = grid[day]?.[ts.id] || [];
                    return (
                      <td key={ts.id} className="p-1 border border-border align-top">
                        {cellEntries.map((entry: any) => {
                          const ta = entry.teaching_assignment;
                          const colorClass = courseColorMap.get(ta?.course_id) || COLORS[0];
                          return (
                            <div key={entry.id} className={cn("rounded-md border p-1.5 mb-1 last:mb-0", colorClass)}>
                              <div className="font-semibold text-xs">{ta?.course?.code}</div>
                              <div className="text-[10px] opacity-80">{ta?.faculty?.name}</div>
                              <div className="text-[10px] opacity-70">{entry.room?.name}</div>
                              {ta?.is_lab && (
                                <Badge variant="outline" className="text-[9px] h-4 mt-0.5">
                                  Lab
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
