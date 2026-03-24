import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Play, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"];
const DAY_LABELS: Record<string, string> = { monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu", friday: "Fri" };

const useSchedules = () =>
  useQuery({
    queryKey: ["schedules"],
    queryFn: async () => {
      const { data, error } = await supabase.from("schedules").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

const useScheduleEntries = (scheduleId: string | null) =>
  useQuery({
    queryKey: ["schedule-entries", scheduleId],
    enabled: !!scheduleId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schedule_entries")
        .select("*, teaching_assignments(faculty(name), courses(code, name), batches(name, section)), rooms(name), time_slots(label, slot_order, start_time, end_time)")
        .eq("schedule_id", scheduleId!)
        .order("day");
      if (error) throw error;
      return data;
    },
  });

const useTimeSlots = () =>
  useQuery({
    queryKey: ["time-slots"],
    queryFn: async () => {
      const { data, error } = await supabase.from("time_slots").select("*").eq("is_break", false).order("slot_order");
      if (error) throw error;
      return data;
    },
  });

const Generate = () => {
  const qc = useQueryClient();
  const { data: schedules } = useSchedules();
  const { data: timeSlots } = useTimeSlots();
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
  const { data: entries } = useScheduleEntries(selectedSchedule);

  const [generating, setGenerating] = useState(false);
  const [params, setParams] = useState({ name: "", population_size: 50, generations: 200, mutation_rate: 0.05 });

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-timetable", {
        body: {
          name: params.name || `Schedule ${new Date().toLocaleString()}`,
          population_size: params.population_size,
          generations: params.generations,
          mutation_rate: params.mutation_rate,
        },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success(`Generated! Fitness: ${data.fitness?.toFixed(1)}, Violations: ${data.hard_violations}`);
      setSelectedSchedule(data.schedule_id);
      qc.invalidateQueries({ queryKey: ["schedules"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setGenerating(false);
    }
  };

  // Build timetable grid: slot × day
  const buildGrid = () => {
    if (!entries || !timeSlots) return null;
    const grid: Record<string, Record<string, any[]>> = {};
    for (const slot of timeSlots) {
      grid[slot.id] = {};
      for (const day of DAYS) grid[slot.id][day] = [];
    }
    for (const e of entries) {
      if (grid[e.time_slot_id]?.[e.day]) {
        grid[e.time_slot_id][e.day].push(e);
      }
    }
    return grid;
  };

  const grid = buildGrid();

  return (
    <div>
      <PageHeader title="Generate Timetable" description="Configure and run the genetic algorithm">
        <Button size="sm" onClick={handleGenerate} disabled={generating}>
          {generating ? <Loader2 size={16} className="mr-1 animate-spin" /> : <Play size={16} className="mr-1" />}
          {generating ? "Generating..." : "Generate"}
        </Button>
      </PageHeader>

      <div className="p-6 space-y-6">
        {/* Parameters */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">GA Parameters</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs">Schedule Name</Label>
              <Input value={params.name} onChange={(e) => setParams({ ...params, name: e.target.value })} placeholder="Auto-generated" />
            </div>
            <div>
              <Label className="text-xs">Population Size</Label>
              <Input type="number" value={params.population_size} onChange={(e) => setParams({ ...params, population_size: +e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Generations</Label>
              <Input type="number" value={params.generations} onChange={(e) => setParams({ ...params, generations: +e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Mutation Rate</Label>
              <Input type="number" step={0.01} value={params.mutation_rate} onChange={(e) => setParams({ ...params, mutation_rate: +e.target.value })} />
            </div>
          </div>
        </Card>

        {/* Schedule selector */}
        {schedules && schedules.length > 0 && (
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3">View Schedule</h3>
            <Select value={selectedSchedule || ""} onValueChange={(v) => setSelectedSchedule(v)}>
              <SelectTrigger className="w-full md:w-80">
                <SelectValue placeholder="Select a schedule to view" />
              </SelectTrigger>
              <SelectContent>
                {schedules.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} — Fitness: {s.fitness_score?.toFixed(1)} {s.hard_constraint_violations ? `⚠ ${s.hard_constraint_violations}` : "✓"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>
        )}

        {/* Timetable grid */}
        {grid && timeSlots && (
          <Card className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28 text-xs">Time Slot</TableHead>
                  {DAYS.map((d) => (
                    <TableHead key={d} className="text-xs text-center min-w-[160px]">{DAY_LABELS[d]}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeSlots.map((slot) => (
                  <TableRow key={slot.id}>
                    <TableCell className="text-xs font-medium whitespace-nowrap">
                      {slot.label}<br />
                      <span className="text-muted-foreground">{slot.start_time?.slice(0, 5)}–{slot.end_time?.slice(0, 5)}</span>
                    </TableCell>
                    {DAYS.map((day) => {
                      const cellEntries = grid[slot.id]?.[day] || [];
                      return (
                        <TableCell key={day} className="p-1">
                          {cellEntries.map((e: any, i: number) => (
                            <div key={i} className="bg-primary/10 text-foreground rounded p-1.5 mb-1 text-xs leading-tight">
                              <span className="font-semibold">{e.teaching_assignments?.courses?.code}</span>
                              <br />
                              <span className="text-muted-foreground">{e.teaching_assignments?.faculty?.name}</span>
                              <br />
                              <span className="text-muted-foreground">{e.teaching_assignments?.batches?.name}-{e.teaching_assignments?.batches?.section} · {e.rooms?.name}</span>
                            </div>
                          ))}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {!selectedSchedule && (!schedules || schedules.length === 0) && (
          <Card className="p-8 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Calendar size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No schedules yet</p>
              <p className="text-xs mt-1">Configure parameters and click Generate</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Generate;
