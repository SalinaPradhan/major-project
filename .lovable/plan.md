

# Plan: Scope AI Scheduler by Department & Batch

## Problem

The edge function `generate-timetable` fetches **all** `teaching_assignments` regardless of which schedule is being generated. So CSE-A and CSE-B both generate the same global timetable. The second one overwrites its own entries but uses the same pool of assignments, rooms, and slots — leading to identical or conflicting results.

## Solution

Add `department_id` and `batch_ids` columns to `schedules`, add Department/Batch pickers to the schedule form, and filter `teaching_assignments` in the edge function.

## Changes

### 1. Database Migration
- Add `department_id uuid` and `batch_ids uuid[]` to `schedules` table

### 2. Schedule Form (`ScheduleFormDialog.tsx`)
- Add optional **Department** dropdown (from `useDepartments`)
- Add optional **Batches** multi-select (from `useBatches`, filtered by selected department)
- Save `department_id` and `batch_ids` to the schedule record

### 3. Edge Function (`generate-timetable/index.ts`)
- Read `department_id` and `batch_ids` from the schedule record
- Filter the `teaching_assignments` query:
  - If `batch_ids` is set → filter `batch_id in batch_ids`
  - Else if `department_id` is set → join through `courses.department_id` to filter
  - Else → use all assignments (current behavior, backward compatible)

### 4. Scheduler Page (`Scheduler.tsx`)
- Show scope label on each schedule card (e.g. "CS Dept • 2 batches" or "All")

### 5. Hook (`useGenerateTimetable.ts`)
- No changes needed — it already passes `scheduleId`, and the edge function will read scope from the schedule record itself

## Files

| File | Action |
|------|--------|
| Database migration | Add 2 columns to `schedules` |
| `supabase/functions/generate-timetable/index.ts` | Filter assignments by scope |
| `src/components/forms/ScheduleFormDialog.tsx` | Add Dept + Batch pickers |
| `src/pages/Scheduler.tsx` | Show scope on cards |

