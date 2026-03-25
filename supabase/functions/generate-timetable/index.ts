import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// --- Types ---

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
  preference: number;
}

interface Faculty {
  id: string;
  max_hours_per_day: number;
  max_hours_per_week: number;
}

interface ExpandedSlot {
  ta_id: string;
  is_lab: boolean;
  faculty_id: string;
  batch_id: string;
  batch_strength: number;
}

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const STAGNATION_LIMIT = 20;

// --- Helper Functions ---

function expandAssignments(assignments: TeachingAssignment[]): ExpandedSlot[] {
  const expanded: ExpandedSlot[] = [];
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
  slots: ExpandedSlot[],
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
  expandedSlots: ExpandedSlot[],
  rooms: Room[],
  facultyMap: Map<string, Faculty>,
  prefMap: Map<string, number>,
): { score: number; hardViolations: number; softScore: number } {
  let hardViolations = 0;
  let softScore = 0;

  const roomMap = new Map(rooms.map((r) => [r.id, r]));
  const roomSlotMap = new Map<string, number>();
  const facultySlotMap = new Map<string, number>();
  const batchSlotMap = new Map<string, number>();
  const facultyDayHours = new Map<string, number>();
  const facultyWeekHours = new Map<string, number>();

  for (let i = 0; i < chromosome.length; i++) {
    const gene = chromosome[i];
    const slot = expandedSlots[i];
    const key_time = `${gene.day}-${gene.time_slot_id}`;

    const roomKey = `room-${gene.room_id}-${key_time}`;
    roomSlotMap.set(roomKey, (roomSlotMap.get(roomKey) || 0) + 1);

    const facKey = `fac-${slot.faculty_id}-${key_time}`;
    facultySlotMap.set(facKey, (facultySlotMap.get(facKey) || 0) + 1);

    const batchKey = `batch-${slot.batch_id}-${key_time}`;
    batchSlotMap.set(batchKey, (batchSlotMap.get(batchKey) || 0) + 1);

    const room = roomMap.get(gene.room_id);
    if (room && room.capacity < slot.batch_strength) hardViolations += 1;
    if (slot.is_lab && room && room.room_type !== "lab") hardViolations += 1;

    const facDayKey = `${slot.faculty_id}-${gene.day}`;
    facultyDayHours.set(facDayKey, (facultyDayHours.get(facDayKey) || 0) + 1);
    facultyWeekHours.set(slot.faculty_id, (facultyWeekHours.get(slot.faculty_id) || 0) + 1);

    const prefKey = `${slot.faculty_id}-${gene.day}-${gene.time_slot_id}`;
    const pref = prefMap.get(prefKey);
    if (pref === 0) hardViolations += 2;
    if (pref === 2) softScore += 1;
  }

  for (const [, count] of roomSlotMap) if (count > 1) hardViolations += (count - 1);
  for (const [, count] of facultySlotMap) if (count > 1) hardViolations += (count - 1);
  for (const [, count] of batchSlotMap) if (count > 1) hardViolations += (count - 1);

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

// Fix 7: Uniform crossover with length guard
function crossover(a: Chromosome, b: Chromosome): Chromosome {
  if (a.length !== b.length) return [...a];
  return a.map((geneA, i) => (Math.random() < 0.5 ? geneA : b[i]));
}

function mutate(
  chromosome: Chromosome,
  rate: number,
  rooms: Room[],
  timeSlots: TimeSlot[],
  expandedSlots: ExpandedSlot[],
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

// Fix 4: Compute per-faculty workload from best chromosome
function computeFacultyWorkload(chromosome: Chromosome, expandedSlots: ExpandedSlot[]): Map<string, number> {
  const workload = new Map<string, number>();
  for (let i = 0; i < chromosome.length; i++) {
    const fid = expandedSlots[i].faculty_id;
    workload.set(fid, (workload.get(fid) || 0) + 1);
  }
  return workload;
}

// --- Main Handler ---

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let jobId: string | undefined;
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { schedule_id, population_size = 50, generation_count = 200, mutation_rate = 0.1 } = await req.json();


    // Fix 12: Mutex — check for running jobs on this schedule
    const { data: runningJobs } = await supabase
      .from("generation_jobs")
      .select("id")
      .eq("schedule_id", schedule_id)
      .eq("status", "running");

    if (runningJobs && runningJobs.length > 0) {
      return new Response(
        JSON.stringify({ error: "A generation is already running for this schedule. Please wait." }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Create job record
    const { data: job } = await supabase
      .from("generation_jobs")
      .insert({ schedule_id, status: "running" })
      .select("id")
      .single();

    jobId = job?.id;

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

    // Fix 5: Stagnation detection
    let bestScoreEver = -Infinity;
    let generationsWithoutImprovement = 0;

    // Evolve
    for (let gen = 0; gen < generation_count; gen++) {
      const newPop = [];

      population.sort((a, b) => b.score - a.score);
      newPop.push(population[0]); // Elitism

      while (newPop.length < population_size) {
        const parentA = tournamentSelect(population);
        const parentB = tournamentSelect(population);
        let child = crossover(parentA, parentB);
        child = mutate(child, mutation_rate, rooms as Room[], timeSlots as TimeSlot[], expandedSlots);
        const f = fitness(child, expandedSlots, rooms as Room[], facultyMap, prefMap);
        newPop.push({ chromosome: child, score: f.score, hardViolations: f.hardViolations, softScore: f.softScore });
      }

      population = newPop;
      population.sort((a, b) => b.score - a.score);

      // Fix 5: Track stagnation
      if (population[0].score > bestScoreEver) {
        bestScoreEver = population[0].score;
        generationsWithoutImprovement = 0;
      } else {
        generationsWithoutImprovement++;
      }

      // Fix 19: Update progress every 10 generations
      if (jobId && gen % 10 === 0) {
        await supabase.from("generation_jobs").update({
          current_generation: gen,
          total_generations: generation_count,
          current_fitness: population[0].score,
          current_violations: population[0].hardViolations,
        }).eq("id", jobId);
      }

      // Only terminate early if zero hard violations AND stagnated
      if (population[0].hardViolations === 0 && generationsWithoutImprovement >= STAGNATION_LIMIT) {
        break;
      }
    }

    // Best solution
    population.sort((a, b) => b.score - a.score);
    const best = population[0];

    // Fix 11: Save version snapshot before overwriting
    const { data: currentSchedule } = await supabase
      .from("schedules")
      .select("current_version")
      .eq("id", schedule_id)
      .single();

    const newVersion = (currentSchedule?.current_version ?? 0) + 1;

    // Snapshot old entries before deleting
    const { data: oldEntries } = await supabase
      .from("schedule_entries")
      .select("*")
      .eq("schedule_id", schedule_id);

    if (oldEntries && oldEntries.length > 0) {
      await supabase.from("schedule_versions").insert({
        schedule_id,
        version_number: currentSchedule?.current_version ?? 0,
        fitness_score: null,
        entries_snapshot: oldEntries,
      });
    }

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

    // Update schedule metadata with version
    await supabase
      .from("schedules")
      .update({
        fitness_score: best.score,
        hard_constraint_violations: best.hardViolations,
        soft_constraint_score: best.softScore,
        generation_count,
        population_size,
        mutation_rate,
        status: "draft",
        current_version: newVersion,
      })
      .eq("id", schedule_id);

    // Fix 4: Write back faculty workload
    const workload = computeFacultyWorkload(best.chromosome, expandedSlots);
    const workloadUpdates = Array.from(workload.entries()).map(([faculty_id, load]) =>
      supabase.from("faculty").update({ current_load: load }).eq("id", faculty_id)
    );
    await Promise.all(workloadUpdates);

    // Fix 12: Mark job completed
    if (jobId) {
      await supabase.from("generation_jobs").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", jobId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        fitness_score: best.score,
        hard_violations: best.hardViolations,
        soft_score: best.softScore,
        entries_count: entries.length,
        version: newVersion,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    // Fix 12: Mark job failed on error
    if (jobId) {
      await supabase.from("generation_jobs").update({ status: "failed", error_message: error.message, completed_at: new Date().toISOString() }).eq("id", jobId);
    }
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
