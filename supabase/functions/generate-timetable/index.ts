import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Gene {
  teaching_assignment_id: string;
  room_id: string;
  time_slot_id: string;
  day: string;
}

type Chromosome = Gene[];

interface TeachingAssignment {
  id: string;
  faculty_id: string;
  course_id: string;
  batch_id: string;
  is_lab: boolean;
  course: { lecture_hours: number; lab_hours: number };
  batch: { strength: number };
}

interface Room {
  id: string;
  capacity: number;
  room_type: string;
}

interface TimeSlot {
  id: string;
  is_break: boolean;
}

interface FacultyPref {
  faculty_id: string;
  day: string;
  time_slot_id: string;
  preference: number; // 0=unavailable, 1=available, 2=preferred
}

interface Faculty {
  id: string;
  max_hours_per_day: number;
  max_hours_per_week: number;
}

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function expandAssignments(assignments: TeachingAssignment[]): { ta_id: string; is_lab: boolean; faculty_id: string; batch_id: string; batch_strength: number }[] {
  const expanded: { ta_id: string; is_lab: boolean; faculty_id: string; batch_id: string; batch_strength: number }[] = [];
  for (const a of assignments) {
    const hours = a.is_lab ? a.course.lab_hours : a.course.lecture_hours;
    for (let i = 0; i < hours; i++) {
      expanded.push({
        ta_id: a.id,
        is_lab: a.is_lab,
        faculty_id: a.faculty_id,
        batch_id: a.batch_id,
        batch_strength: a.batch?.strength ?? 30,
      });
    }
  }
  return expanded;
}

function randomChromosome(
  slots: { ta_id: string; is_lab: boolean; batch_strength: number }[],
  rooms: Room[],
  timeSlots: TimeSlot[],
): Chromosome {
  const nonBreakSlots = timeSlots.filter((ts) => !ts.is_break);
  return slots.map((s) => {
    const suitableRooms = rooms.filter((r) => {
      if (s.is_lab && r.room_type !== "lab") return false;
      return r.capacity >= s.batch_strength;
    });
    const roomPool = suitableRooms.length > 0 ? suitableRooms : rooms;
    return {
      teaching_assignment_id: s.ta_id,
      room_id: roomPool[Math.floor(Math.random() * roomPool.length)].id,
      time_slot_id: nonBreakSlots[Math.floor(Math.random() * nonBreakSlots.length)].id,
      day: DAYS[Math.floor(Math.random() * DAYS.length)],
    };
  });
}

function fitness(
  chromosome: Chromosome,
  expandedSlots: { ta_id: string; faculty_id: string; batch_id: string; is_lab: boolean; batch_strength: number }[],
  rooms: Room[],
  facultyMap: Map<string, Faculty>,
  prefMap: Map<string, number>,
): { score: number; hardViolations: number; softScore: number } {
  let hardViolations = 0;
  let softScore = 0;

  const roomMap = new Map(rooms.map((r) => [r.id, r]));

  // Build slot keys for conflict detection
  const roomSlotMap = new Map<string, number>();
  const facultySlotMap = new Map<string, number>();
  const batchSlotMap = new Map<string, number>();
  const facultyDayHours = new Map<string, number>();
  const facultyWeekHours = new Map<string, number>();

  for (let i = 0; i < chromosome.length; i++) {
    const gene = chromosome[i];
    const slot = expandedSlots[i];
    const key_time = `${gene.day}-${gene.time_slot_id}`;

    // Room conflict
    const roomKey = `room-${gene.room_id}-${key_time}`;
    roomSlotMap.set(roomKey, (roomSlotMap.get(roomKey) || 0) + 1);

    // Faculty conflict
    const facKey = `fac-${slot.faculty_id}-${key_time}`;
    facultySlotMap.set(facKey, (facultySlotMap.get(facKey) || 0) + 1);

    // Batch conflict
    const batchKey = `batch-${slot.batch_id}-${key_time}`;
    batchSlotMap.set(batchKey, (batchSlotMap.get(batchKey) || 0) + 1);

    // Room capacity check
    const room = roomMap.get(gene.room_id);
    if (room && room.capacity < slot.batch_strength) hardViolations += 1;

    // Lab in non-lab room
    if (slot.is_lab && room && room.room_type !== "lab") hardViolations += 1;

    // Faculty hours tracking
    const facDayKey = `${slot.faculty_id}-${gene.day}`;
    facultyDayHours.set(facDayKey, (facultyDayHours.get(facDayKey) || 0) + 1);
    facultyWeekHours.set(slot.faculty_id, (facultyWeekHours.get(slot.faculty_id) || 0) + 1);

    // Soft: faculty preference
    const prefKey = `${slot.faculty_id}-${gene.day}-${gene.time_slot_id}`;
    const pref = prefMap.get(prefKey);
    if (pref === 0) hardViolations += 2; // unavailable = hard constraint
    if (pref === 2) softScore += 1; // preferred slot bonus
  }

  // Count conflicts (value > 1 means overlap)
  for (const [, count] of roomSlotMap) if (count > 1) hardViolations += (count - 1);
  for (const [, count] of facultySlotMap) if (count > 1) hardViolations += (count - 1);
  for (const [, count] of batchSlotMap) if (count > 1) hardViolations += (count - 1);

  // Faculty max hours
  for (const [key, hours] of facultyDayHours) {
    const facId = key.split("-")[0];
    const fac = facultyMap.get(facId);
    if (fac && hours > fac.max_hours_per_day) hardViolations += (hours - fac.max_hours_per_day);
  }
  for (const [facId, hours] of facultyWeekHours) {
    const fac = facultyMap.get(facId);
    if (fac && hours > fac.max_hours_per_week) hardViolations += (hours - fac.max_hours_per_week);
  }

  const score = 1000 - hardViolations * 10 + softScore;
  return { score, hardViolations, softScore };
}

function crossover(a: Chromosome, b: Chromosome): Chromosome {
  const point = Math.floor(Math.random() * a.length);
  return [...a.slice(0, point), ...b.slice(point)];
}

function mutate(
  chromosome: Chromosome,
  rate: number,
  rooms: Room[],
  timeSlots: TimeSlot[],
  expandedSlots: { is_lab: boolean; batch_strength: number }[],
): Chromosome {
  const nonBreakSlots = timeSlots.filter((ts) => !ts.is_break);
  return chromosome.map((gene, i) => {
    if (Math.random() > rate) return gene;
    const s = expandedSlots[i];
    const suitableRooms = rooms.filter((r) => {
      if (s.is_lab && r.room_type !== "lab") return false;
      return r.capacity >= s.batch_strength;
    });
    const roomPool = suitableRooms.length > 0 ? suitableRooms : rooms;
    return {
      ...gene,
      room_id: roomPool[Math.floor(Math.random() * roomPool.length)].id,
      time_slot_id: nonBreakSlots[Math.floor(Math.random() * nonBreakSlots.length)].id,
      day: DAYS[Math.floor(Math.random() * DAYS.length)],
    };
  });
}

function tournamentSelect(population: { chromosome: Chromosome; score: number }[], size = 3): Chromosome {
  let best = population[Math.floor(Math.random() * population.length)];
  for (let i = 1; i < size; i++) {
    const contender = population[Math.floor(Math.random() * population.length)];
    if (contender.score > best.score) best = contender;
  }
  return best.chromosome;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { schedule_id, population_size = 50, generation_count = 200, mutation_rate = 0.1 } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all data
    const [
      { data: assignments },
      { data: rooms },
      { data: timeSlots },
      { data: facultyList },
      { data: preferences },
    ] = await Promise.all([
      supabase.from("teaching_assignments").select("*, course:courses(lecture_hours, lab_hours), batch:batches(strength)"),
      supabase.from("rooms").select("*"),
      supabase.from("time_slots").select("*"),
      supabase.from("faculty").select("*"),
      supabase.from("faculty_preferences").select("*"),
    ]);

    if (!assignments?.length || !rooms?.length || !timeSlots?.length) {
      return new Response(
        JSON.stringify({ error: "Missing data: need teaching assignments, rooms, and time slots" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const expandedSlots = expandAssignments(assignments as TeachingAssignment[]);
    const facultyMap = new Map((facultyList || []).map((f: Faculty) => [f.id, f]));
    const prefMap = new Map((preferences || []).map((p: FacultyPref) => [`${p.faculty_id}-${p.day}-${p.time_slot_id}`, p.preference]));

    // Initialize population
    let population = Array.from({ length: population_size }, () => {
      const chr = randomChromosome(expandedSlots, rooms as Room[], timeSlots as TimeSlot[]);
      const f = fitness(chr, expandedSlots, rooms as Room[], facultyMap, prefMap);
      return { chromosome: chr, score: f.score, hardViolations: f.hardViolations, softScore: f.softScore };
    });

    // Evolve
    for (let gen = 0; gen < generation_count; gen++) {
      const newPop = [];

      // Elitism: keep best
      population.sort((a, b) => b.score - a.score);
      newPop.push(population[0]);

      while (newPop.length < population_size) {
        const parentA = tournamentSelect(population);
        const parentB = tournamentSelect(population);
        let child = crossover(parentA, parentB);
        child = mutate(child, mutation_rate, rooms as Room[], timeSlots as TimeSlot[], expandedSlots);
        const f = fitness(child, expandedSlots, rooms as Room[], facultyMap, prefMap);
        newPop.push({ chromosome: child, score: f.score, hardViolations: f.hardViolations, softScore: f.softScore });
      }

      population = newPop;

      // Early termination if perfect
      if (population[0].hardViolations === 0) break;
    }

    // Best solution
    population.sort((a, b) => b.score - a.score);
    const best = population[0];

    // Delete old entries for this schedule
    await supabase.from("schedule_entries").delete().eq("schedule_id", schedule_id);

    // Insert new entries
    const entries = best.chromosome.map((gene) => ({
      schedule_id,
      teaching_assignment_id: gene.teaching_assignment_id,
      room_id: gene.room_id,
      time_slot_id: gene.time_slot_id,
      day: gene.day,
    }));

    if (entries.length > 0) {
      const { error: insertError } = await supabase.from("schedule_entries").insert(entries);
      if (insertError) throw insertError;
    }

    // Update schedule metadata
    await supabase
      .from("schedules")
      .update({
        fitness_score: best.score,
        hard_constraint_violations: best.hardViolations,
        soft_constraint_score: best.softScore,
        generation_count,
        population_size,
        mutation_rate,
        status: best.hardViolations === 0 ? "draft" : "draft",
      })
      .eq("id", schedule_id);

    return new Response(
      JSON.stringify({
        success: true,
        fitness_score: best.score,
        hard_violations: best.hardViolations,
        soft_score: best.softScore,
        entries_count: entries.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
