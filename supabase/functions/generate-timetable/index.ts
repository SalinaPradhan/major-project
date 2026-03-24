import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Types ─────────────────────────────────────────
interface Assignment {
  id: string;
  faculty_id: string;
  course_id: string;
  batch_id: string;
  is_lab: boolean;
  course_lecture_hours: number;
  course_lab_hours: number;
  course_requires_lab: boolean;
}
interface TimeSlot {
  id: string;
  slot_order: number;
  is_break: boolean;
}
interface Room {
  id: string;
  room_type: string;
  capacity: number;
}
interface Gene {
  assignment_id: string;
  room_id: string;
  time_slot_id: string;
  day: string;
}
interface Chromosome {
  genes: Gene[];
  fitness: number;
}

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"];

// ─── Fetch data ────────────────────────────────────
async function fetchData(supabase: any) {
  const [assignRes, slotRes, roomRes, prefRes, facRes] = await Promise.all([
    supabase.from("teaching_assignments").select("id, faculty_id, course_id, batch_id, is_lab, courses(lecture_hours, lab_hours, requires_lab)"),
    supabase.from("time_slots").select("*").order("slot_order"),
    supabase.from("rooms").select("*"),
    supabase.from("faculty_preferences").select("*"),
    supabase.from("faculty").select("id, max_hours_per_day, max_hours_per_week"),
  ]);

  const assignments: Assignment[] = (assignRes.data || []).map((a: any) => ({
    id: a.id,
    faculty_id: a.faculty_id,
    course_id: a.course_id,
    batch_id: a.batch_id,
    is_lab: a.is_lab,
    course_lecture_hours: a.courses?.lecture_hours ?? 3,
    course_lab_hours: a.courses?.lab_hours ?? 0,
    course_requires_lab: a.courses?.requires_lab ?? false,
  }));

  const slots: TimeSlot[] = (slotRes.data || []).filter((s: any) => !s.is_break);
  const rooms: Room[] = roomRes.data || [];
  const preferences = prefRes.data || [];
  const facultyLimits = new Map((facRes.data || []).map((f: any) => [f.id, f]));

  return { assignments, slots, rooms, preferences, facultyLimits };
}

// ─── Expand assignments into required slots ────────
function expandAssignments(assignments: Assignment[]): { assignment_id: string; needs_lab: boolean }[] {
  const expanded: { assignment_id: string; needs_lab: boolean }[] = [];
  for (const a of assignments) {
    const lectureSlots = a.is_lab ? 0 : a.course_lecture_hours;
    const labSlots = a.is_lab ? a.course_lab_hours : 0;
    for (let i = 0; i < lectureSlots; i++) expanded.push({ assignment_id: a.id, needs_lab: false });
    for (let i = 0; i < labSlots; i++) expanded.push({ assignment_id: a.id, needs_lab: true });
  }
  return expanded;
}

// ─── Random chromosome ────────────────────────────
function randomChromosome(
  expandedSlots: { assignment_id: string; needs_lab: boolean }[],
  slots: TimeSlot[],
  rooms: Room[],
  labRoomIds: string[],
  classroomIds: string[],
): Chromosome {
  const genes: Gene[] = expandedSlots.map((es) => {
    const pool = es.needs_lab && labRoomIds.length > 0 ? labRoomIds : classroomIds.length > 0 ? classroomIds : rooms.map(r => r.id);
    return {
      assignment_id: es.assignment_id,
      room_id: pool[Math.floor(Math.random() * pool.length)],
      time_slot_id: slots[Math.floor(Math.random() * slots.length)].id,
      day: DAYS[Math.floor(Math.random() * DAYS.length)],
    };
  });
  return { genes, fitness: 0 };
}

// ─── Fitness function ──────────────────────────────
function evaluate(
  chromo: Chromosome,
  assignmentMap: Map<string, Assignment>,
  facultyLimits: Map<string, any>,
  preferences: any[],
): number {
  let hardPenalty = 0;
  let softScore = 0;

  // Build lookup maps for conflict detection
  const roomSlotKey = (room: string, day: string, slot: string) => `${room}-${day}-${slot}`;
  const facultySlotKey = (fac: string, day: string, slot: string) => `${fac}-${day}-${slot}`;
  const batchSlotKey = (batch: string, day: string, slot: string) => `${batch}-${day}-${slot}`;

  const roomSlots = new Map<string, number>();
  const facultySlots = new Map<string, number>();
  const batchSlots = new Map<string, number>();
  const facultyDayHours = new Map<string, number>();
  const facultyWeekHours = new Map<string, number>();

  for (const gene of chromo.genes) {
    const a = assignmentMap.get(gene.assignment_id);
    if (!a) continue;

    // Hard: Room double-booking
    const rk = roomSlotKey(gene.room_id, gene.day, gene.time_slot_id);
    roomSlots.set(rk, (roomSlots.get(rk) || 0) + 1);
    if ((roomSlots.get(rk) || 0) > 1) hardPenalty += 10;

    // Hard: Faculty double-booking
    const fk = facultySlotKey(a.faculty_id, gene.day, gene.time_slot_id);
    facultySlots.set(fk, (facultySlots.get(fk) || 0) + 1);
    if ((facultySlots.get(fk) || 0) > 1) hardPenalty += 10;

    // Hard: Batch double-booking
    const bk = batchSlotKey(a.batch_id, gene.day, gene.time_slot_id);
    batchSlots.set(bk, (batchSlots.get(bk) || 0) + 1);
    if ((batchSlots.get(bk) || 0) > 1) hardPenalty += 10;

    // Soft: Faculty hours per day
    const fdKey = `${a.faculty_id}-${gene.day}`;
    facultyDayHours.set(fdKey, (facultyDayHours.get(fdKey) || 0) + 1);

    // Soft: Faculty hours per week
    facultyWeekHours.set(a.faculty_id, (facultyWeekHours.get(a.faculty_id) || 0) + 1);
  }

  // Soft: Check faculty daily/weekly limits
  for (const [key, hours] of facultyDayHours) {
    const facId = key.split("-")[0];
    const limits = facultyLimits.get(facId);
    if (limits && hours > limits.max_hours_per_day) {
      softScore -= (hours - limits.max_hours_per_day) * 2;
    }
  }
  for (const [facId, hours] of facultyWeekHours) {
    const limits = facultyLimits.get(facId);
    if (limits && hours > limits.max_hours_per_week) {
      softScore -= (hours - limits.max_hours_per_week) * 2;
    }
  }

  // Soft: Faculty preferences
  for (const gene of chromo.genes) {
    const a = assignmentMap.get(gene.assignment_id);
    if (!a) continue;
    const pref = preferences.find(
      (p: any) => p.faculty_id === a.faculty_id && p.day === gene.day && p.time_slot_id === gene.time_slot_id
    );
    if (pref) softScore += pref.preference; // +1 prefer, -1 avoid
  }

  // Soft: Spread classes across days (penalize too many on one day per batch)
  const batchDayCounts = new Map<string, number>();
  for (const gene of chromo.genes) {
    const a = assignmentMap.get(gene.assignment_id);
    if (!a) continue;
    const key = `${a.batch_id}-${gene.day}`;
    batchDayCounts.set(key, (batchDayCounts.get(key) || 0) + 1);
  }
  for (const count of batchDayCounts.values()) {
    if (count > 6) softScore -= (count - 6);
  }

  chromo.fitness = 1000 - hardPenalty * 100 + softScore;
  return chromo.fitness;
}

// ─── Crossover ─────────────────────────────────────
function crossover(p1: Chromosome, p2: Chromosome): Chromosome {
  const point = Math.floor(Math.random() * p1.genes.length);
  const genes = [...p1.genes.slice(0, point), ...p2.genes.slice(point)].map((g) => ({ ...g }));
  return { genes, fitness: 0 };
}

// ─── Mutation ──────────────────────────────────────
function mutate(chromo: Chromosome, slots: TimeSlot[], roomIds: string[], rate: number) {
  for (const gene of chromo.genes) {
    if (Math.random() < rate) {
      const what = Math.floor(Math.random() * 3);
      if (what === 0) gene.day = DAYS[Math.floor(Math.random() * DAYS.length)];
      else if (what === 1) gene.time_slot_id = slots[Math.floor(Math.random() * slots.length)].id;
      else gene.room_id = roomIds[Math.floor(Math.random() * roomIds.length)];
    }
  }
}

// ─── Tournament selection ──────────────────────────
function tournamentSelect(pop: Chromosome[], size = 3): Chromosome {
  let best: Chromosome | null = null;
  for (let i = 0; i < size; i++) {
    const candidate = pop[Math.floor(Math.random() * pop.length)];
    if (!best || candidate.fitness > best.fitness) best = candidate;
  }
  return best!;
}

// ─── Main GA ───────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json().catch(() => ({}));
    const populationSize = body.population_size || 50;
    const generations = body.generations || 200;
    const mutationRate = body.mutation_rate || 0.05;
    const scheduleName = body.name || `Schedule ${new Date().toLocaleDateString()}`;

    const { assignments, slots, rooms, preferences, facultyLimits } = await fetchData(supabase);

    if (assignments.length === 0) {
      return new Response(JSON.stringify({ error: "No teaching assignments found. Add assignments first." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (slots.length === 0 || rooms.length === 0) {
      return new Response(JSON.stringify({ error: "No time slots or rooms found." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const assignmentMap = new Map(assignments.map((a) => [a.id, a]));
    const expandedSlots = expandAssignments(assignments);
    const labRoomIds = rooms.filter((r) => r.room_type === "lab").map((r) => r.id);
    const classroomIds = rooms.filter((r) => r.room_type !== "lab").map((r) => r.id);
    const allRoomIds = rooms.map((r) => r.id);

    // Initialize population
    let population: Chromosome[] = [];
    for (let i = 0; i < populationSize; i++) {
      const c = randomChromosome(expandedSlots, slots, rooms, labRoomIds, classroomIds);
      evaluate(c, assignmentMap, facultyLimits, preferences);
      population.push(c);
    }

    // Evolve
    for (let gen = 0; gen < generations; gen++) {
      const newPop: Chromosome[] = [];

      // Elitism: keep top 2
      population.sort((a, b) => b.fitness - a.fitness);
      newPop.push({ genes: population[0].genes.map((g) => ({ ...g })), fitness: population[0].fitness });
      if (population.length > 1) {
        newPop.push({ genes: population[1].genes.map((g) => ({ ...g })), fitness: population[1].fitness });
      }

      while (newPop.length < populationSize) {
        const p1 = tournamentSelect(population);
        const p2 = tournamentSelect(population);
        const child = crossover(p1, p2);
        mutate(child, slots, allRoomIds, mutationRate);
        evaluate(child, assignmentMap, facultyLimits, preferences);
        newPop.push(child);
      }

      population = newPop;
    }

    // Best solution
    population.sort((a, b) => b.fitness - a.fitness);
    const best = population[0];

    // Count hard constraint violations
    const roomConflicts = new Set<string>();
    const facConflicts = new Set<string>();
    const batchConflicts = new Set<string>();
    const seen = { room: new Map<string, number>(), fac: new Map<string, number>(), batch: new Map<string, number>() };

    for (const gene of best.genes) {
      const a = assignmentMap.get(gene.assignment_id)!;
      const rk = `${gene.room_id}-${gene.day}-${gene.time_slot_id}`;
      const fk = `${a.faculty_id}-${gene.day}-${gene.time_slot_id}`;
      const bk = `${a.batch_id}-${gene.day}-${gene.time_slot_id}`;
      seen.room.set(rk, (seen.room.get(rk) || 0) + 1);
      seen.fac.set(fk, (seen.fac.get(fk) || 0) + 1);
      seen.batch.set(bk, (seen.batch.get(bk) || 0) + 1);
    }
    let hardViolations = 0;
    for (const v of seen.room.values()) if (v > 1) hardViolations += v - 1;
    for (const v of seen.fac.values()) if (v > 1) hardViolations += v - 1;
    for (const v of seen.batch.values()) if (v > 1) hardViolations += v - 1;

    // Save schedule
    const { data: schedule, error: schedErr } = await supabase
      .from("schedules")
      .insert({
        name: scheduleName,
        status: "draft",
        fitness_score: best.fitness,
        generation_count: generations,
        population_size: populationSize,
        mutation_rate: mutationRate,
        hard_constraint_violations: hardViolations,
        soft_constraint_score: best.fitness,
      })
      .select()
      .single();

    if (schedErr) throw schedErr;

    // Save entries
    const entries = best.genes.map((gene) => ({
      schedule_id: schedule.id,
      teaching_assignment_id: gene.assignment_id,
      room_id: gene.room_id,
      time_slot_id: gene.time_slot_id,
      day: gene.day,
    }));

    const { error: entryErr } = await supabase.from("schedule_entries").insert(entries);
    if (entryErr) throw entryErr;

    return new Response(
      JSON.stringify({
        schedule_id: schedule.id,
        fitness: best.fitness,
        hard_violations: hardViolations,
        total_entries: entries.length,
        generations,
        population_size: populationSize,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
