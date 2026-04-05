

# Why the Published Timetable Shows No Data

## Root Cause

The schedule **"CSE2023-A"** is the only one with status `published`, but it has:
- **0 schedule entries** (never generated)
- **No fitness score** (null)
- **No batch_ids** assigned (empty array)
- **No department_id** set

It was created and published without ever running the genetic algorithm to generate entries. So when you select it on the Timetable page, it correctly says "No entries found."

The other schedules that DO have entries (`CSE Section A - Test`, `CSE Section B - Test`, `CSE 2023-B`) are all in **draft** status.

## Fix

Two things need to happen:

### 1. Auto-select published schedule on Timetable page
Currently the Timetable page starts with no schedule selected. It should auto-select the first published schedule (if any) so users see data immediately.

**File:** `src/pages/Timetable.tsx`
- Use `useEffect` to auto-set `selectedScheduleId` to the first published schedule's ID when schedules load.

### 2. Generate entries for the published schedule (or publish one that has entries)
The published schedule has no data. Two options:
- **Option A:** Change one of the draft schedules that has entries (e.g., "CSE 2023-B" with 23 entries) to `published` status via a database update.
- **Option B:** Generate entries for "CSE2023-A" first, then it will show data.

I recommend **Option A** (update "CSE 2023-B" to published) as an immediate fix, plus add a safeguard in the Scheduler page to prevent publishing schedules that have no entries.

### 3. Add publish guard on Scheduler page
**File:** `src/pages/Scheduler.tsx`
- Add a "Publish" button that only appears on schedules with a fitness score (meaning they've been generated).
- Prevent publishing empty schedules.

## Files

| File | Action |
|------|--------|
| `src/pages/Timetable.tsx` | Auto-select first published schedule on load |
| `src/pages/Scheduler.tsx` | Add Publish/Unpublish button with guard against empty schedules |
| Database | Update "CSE 2023-B" to `published` status so there's a schedule with actual data |

