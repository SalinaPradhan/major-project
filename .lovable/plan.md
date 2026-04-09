

# Fix Timetable: Missing Periods + Premier Venue Exclusion

## Issues Found

1. **Missing periods (1, 6, 7, 8)**: The `timeSlots` array on the Timetable page is built only from time slots that appear in the schedule entries. Since the GA only assigned entries to periods 2, 3, 4, 5 — periods 1, 6, 7, 8 (plus breaks) don't appear. The grid should show ALL time slots, not just those with entries.

2. **CINEPLEX assigned as lecture room**: The GA's `getRoomPool` filters `room_type !== "lab"`, which includes `cineplex`. Premier venues (cineplex, auditorium, conference_hall, indoor_stadium) must be excluded from the GA entirely — they're managed via Venue Management.

3. **Only 6 entries generated**: With only 2 courses and 1 batch, the GA produced very few entries. This is likely correct given the teaching assignments, but the empty grid should still show all 8 periods for context.

## Plan

### Fix 1: Show all time slots in the Timetable grid
**File: `src/pages/Timetable.tsx`**

- Fetch ALL time slots from the database independently (new query or separate supabase call), instead of deriving them from entries only
- Add a new hook call or inline query: `supabase.from('time_slots').select('*').order('slot_order')`
- This ensures periods 1, 6, 7, 8 and break/lunch rows always appear

### Fix 2: Exclude premier venues from GA
**File: `supabase/functions/generate-timetable/index.ts`**

- In the room-fetching query (where rooms are loaded), add a filter to exclude premier venue types: `cineplex`, `auditorium`, `conference_hall`, `indoor_stadium`
- Alternatively, filter in `getRoomPool`: exclude rooms where `room_type` is one of the premier venue types
- This prevents the GA from ever assigning lectures to CINEPLEX, Auditorium, etc.

### Fix 3: Create a `useTimeSlots` hook
**File: `src/hooks/useTimeSlots.ts`** (new)

- Simple query hook: `supabase.from('time_slots').select('*').order('slot_order')`
- Used by Timetable page to get the complete list of periods

## Files Changed

| File | Change |
|------|--------|
| `src/hooks/useTimeSlots.ts` | New hook to fetch all time slots |
| `src/pages/Timetable.tsx` | Use `useTimeSlots` for complete grid; stop deriving slots from entries |
| `supabase/functions/generate-timetable/index.ts` | Exclude premier venue room types from GA room pool |

After these fixes, regenerating the timetable will avoid CINEPLEX, and the grid will always show all 8 periods.

