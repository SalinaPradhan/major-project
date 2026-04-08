

# Fix Timetable Generation Issues

## Problems Identified

From analyzing the screenshot and the GA code in `supabase/functions/generate-timetable/index.ts`:

### Problem 1: Multiple lectures stacked in one cell (Mon Period 1 shows ECE101, MATH101, MATH101, MATH201)
**Root cause**: The Timetable page displays ALL entries for ALL batches in a single grid. When the schedule covers multiple batches (e.g., CSE2023-A has multiple sections or the schedule includes entries from other batches), they all pile up in the same cell. The grid needs a **batch filter** so you only see one batch's timetable at a time.

### Problem 2: Lecture and Lab in same period for same batch
**Root cause**: The GA's batch-clash constraint (line 134) counts overlaps but doesn't distinguish between lecture and lab types. A batch should have exactly ONE entry per time slot — either a lecture OR a lab, never both. The fitness function already penalizes batch overlaps, but the penalty weight may be insufficient, or the population/generations aren't enough to resolve all conflicts.

### Problem 3: Lecture rooms used as lab rooms
**Root cause**: In `randomChromosome` (line 91-93) and `mutate` (line 185-188), the code correctly filters `room_type === "lab"` for lab assignments. However, it does NOT enforce the reverse: **lectures should only use non-lab rooms** (classrooms, auditoriums, etc.). A lecture can currently be assigned to a lab room. Also, when no suitable rooms are found (line 95), it falls back to ALL rooms — including labs for lectures.

## Fix Plan

### Fix 1: Add batch filter to Timetable page
**File: `src/pages/Timetable.tsx`**
- After selecting a schedule, add a **Batch dropdown** (populated from unique batches in the entries)
- Filter `entries` by selected batch before building the grid
- This immediately solves the "too many lectures in one cell" visual problem — each batch will show at most one entry per slot

### Fix 2: Enforce room-type separation in the GA
**File: `supabase/functions/generate-timetable/index.ts`**

In `randomChromosome()` and `mutate()`:
- For **lab** assignments: only assign to rooms where `room_type === "lab"` (already done)
- For **lecture** assignments: only assign to rooms where `room_type !== "lab"` (NEW)
- Remove the fallback to ALL rooms (`const roomPool = suitableRooms.length > 0 ? suitableRooms : rooms`) — if no suitable room exists, throw a clear error instead of silently assigning wrong room types

In `fitness()`:
- Add a new hard constraint: **lecture assigned to lab room** → penalty (reverse of the existing lab-in-non-lab check)
- This ensures evolutionary pressure also pushes any crossover artifacts toward correct room types

### Fix 3: Strengthen batch-overlap penalty
**File: `supabase/functions/generate-timetable/index.ts`**

The batch overlap check at line 152 already penalizes `count > 1`, but increase the penalty weight for batch clashes to make them as critical as room clashes. A batch having 2+ entries in the same slot is a hard violation that should never survive.

## Files Changed

| File | Change |
|------|--------|
| `src/pages/Timetable.tsx` | Add batch filter dropdown; filter entries by selected batch |
| `supabase/functions/generate-timetable/index.ts` | Enforce lecture rooms != lab; remove unsafe fallback; add reverse room-type penalty in fitness |

## Important Note

After deploying the GA fix, existing timetables will still have the old conflicts. You'll need to **regenerate** the timetable to see clean results.

