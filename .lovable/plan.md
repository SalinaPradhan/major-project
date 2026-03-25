

# Plan: Implement Bug Fix Guide — Full Roadmap

## Status Assessment

| Fix | Status | Action |
|-----|--------|--------|
| 1. Migration conflicts | DONE (Cloud handles this) | Skip |
| 2. teaching_assignments table | DONE (exists with CRUD) | Skip |
| 3-8 | NOT DONE | Phase 1 below |
| 9-16 | NOT DONE | Phase 2 below |
| 14. Mock data | DONE (no mock data exists) | Skip |
| 17-19 | NOT DONE | Phase 3 below |

---

## PHASE 1 — Critical GA & Type Fixes

### Fix 3: Load-aware faculty assignment in GA
**File:** `supabase/functions/generate-timetable/index.ts`
- The GA already uses `teaching_assignments` as source of truth (Fix 2 done), so random faculty selection is already bypassed
- Add a crossover length guard (Fix 7) as defensive coding

### Fix 4: Faculty workload tracking in GA
**File:** `supabase/functions/generate-timetable/index.ts`
- After GA completes, compute per-faculty hours from best chromosome
- Write back to `faculty` table (requires adding `current_load` column)
- **Migration:** `ALTER TABLE faculty ADD COLUMN IF NOT EXISTS current_load integer DEFAULT 0;`

### Fix 5: Fix GA early termination
**File:** `supabase/functions/generate-timetable/index.ts`
- Already partially correct (checks `hardViolations === 0`), but add `generationsWithoutImprovement` counter to avoid premature exit
- Add stagnation detection: break only after 20+ generations with no improvement AND zero hard violations

### Fix 6: Staff role normalization
- No `support_staff` table exists in the current database — this fix is N/A for now (the system doesn't have support staff)

### Fix 7: Crossover length guard
**File:** `supabase/functions/generate-timetable/index.ts`
- Add length check in `crossover()` function — return clone if lengths mismatch
- Switch to uniform crossover for better gene preservation

### Fix 8: Batch time window enforcement
- Current `batches` table has no `class_start_time`/`class_end_time` columns — this fix is N/A unless we add those columns
- Skip for now (time slots come from `time_slots` table)

---

## PHASE 2 — Database & Performance Fixes

### Fix 9: Server-side conflict detection RPC
**Migration:** Create `check_schedule_conflicts` PostgreSQL function
**File:** `src/hooks/useConflictCheck.ts` — Replace client-side O(n) with single RPC call

### Fix 10: Composite indexes
**Migration:** Add indexes on `schedule_entries` for conflict lookups:
- `idx_schedule_entries_conflict(day, time_slot_id, room_id)`
- `idx_schedule_entries_faculty(teaching_assignment_id, day)`

### Fix 11: Schedule versioning
**Migration:** Create `schedule_versions` table, add `version_id` to `schedules`
**File:** `supabase/functions/generate-timetable/index.ts` — Create version record per GA run, stop deleting old entries

### Fix 12: Concurrent GA mutex
**Migration:** Create `generation_jobs` table with `job_status` enum
**File:** `supabase/functions/generate-timetable/index.ts` — Check for running jobs before starting, return 409 if busy

### Fix 13: Enum inconsistency
**Files:**
- `src/types/index.ts` — Change `on-leave` → `on_leave`, `lab-assistant` → `lab_assistant`
- `src/components/resources/StatusBadge.tsx` — Update keys to underscore format

### Fix 15: Pagination
**New file:** `src/hooks/usePaginatedQuery.ts` — Generic paginated query hook
**Modified:** Faculty, Rooms, Batches, Courses pages — Use paginated queries + pagination controls

### Fix 16: PDF export error handling
- No `exportSchedulePdf.ts` exists yet — will create with proper try/catch and toast feedback when PDF export is added

---

## PHASE 3 — New Features

### Fix 17: Academic calendar table
**Migration:** Create `academic_calendar` table
**New files:** Hook + UI page for managing holidays/exam periods
**Modified:** GA edge function — exclude holiday days from scheduling

### Fix 18: Room utilization metrics
**Migration:** Create `room_utilization` view, add `utilization_target` to rooms
**Modified:** Dashboard — Show real utilization percentages

### Fix 19: GA progress streaming
**File:** `supabase/functions/generate-timetable/index.ts` — Use TransformStream for SSE progress
**Modified:** Scheduler UI — Replace fake progress bar with EventSource consumer

---

## Execution Order (strict)

1. **Migration batch 1:** Add `current_load` to faculty
2. **GA edge function rewrite:** Fixes 4, 5, 7 (workload writeback, stagnation detection, crossover guard)
3. **Migration batch 2:** Conflict check RPC + composite indexes (Fixes 9, 10)
4. **Update `useConflictCheck.ts`** to use RPC
5. **Migration batch 3:** Schedule versioning + generation jobs (Fixes 11, 12)
6. **GA edge function update:** Version tagging + mutex logic
7. **Fix 13:** Update `types/index.ts` and `StatusBadge.tsx` enum values
8. **Fix 15:** Create paginated query hook + update list pages
9. **Migration batch 4:** Academic calendar table (Fix 17)
10. **Fix 18:** Room utilization view + dashboard update
11. **Fix 19:** GA progress streaming

## Technical Notes
- All migrations use the database migration tool (auto-approval)
- Edge function changes deploy automatically
- The `types.ts` auto-generated file is never edited — only `src/types/index.ts` is updated
- Fix 6 (staff roles) and Fix 8 (batch time windows) are skipped as those tables/columns don't exist yet
- Fix 14 (mock data) is already clean — no mock imports found

