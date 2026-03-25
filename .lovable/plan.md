

# Plan: Redesign Event Scheduler with Calendar View

## What Changes

Replace the current table-only Event Scheduler page with a calendar-based UI inspired by the uploaded venue components. The page will feature:

1. **Calendar grid** showing events on their dates with color-coded dots/bars by event type
2. **Click-on-date modal** showing that day's events with details (time, room, host) and a "Book This Date" button for admin/faculty
3. **Type filter + legend** showing color codes for exam, seminar, workshop, meeting, other
4. **Table view toggle** — keep the existing table as an alternative view via tabs (Calendar / List)
5. **Role-based actions** — admin/faculty see "Add Event" and edit/delete; students see read-only

## Files to Create/Modify

### New: `src/components/events/EventCalendar.tsx`
Adapted from the uploaded `VenueCalendar.tsx`:
- Replace `VenueBooking` types with the existing `Event` type from `useEvents`
- Replace `VENUE_COLORS`/`VENUE_LABELS` with event type colors (exam=red, seminar=blue, workshop=amber, meeting=green, other=gray)
- Calendar grid with month navigation, day cells showing event titles
- Click a day → dialog showing event cards with time, room, description
- "Add Event" button in the day dialog (hidden for students via `readOnly` prop)

### Modified: `src/pages/EventScheduler.tsx`
- Add tabs: "Calendar" (default) and "List" (existing table)
- Calendar tab renders `EventCalendar` with events from `useEvents`
- Pass `readOnly={!canManage}` to hide action buttons for students
- Keep existing table view under "List" tab
- Clicking "Add Event" from calendar opens `EventFormDialog` with pre-filled date

### Modified: `src/types/venue.ts` (no changes needed)
The venue types stay as-is. We'll create separate event-type color maps in the calendar component.

## Event Type Color Map
```text
exam       → hsl(0, 84%, 60%)    red
seminar    → hsl(221, 83%, 53%)  blue  
workshop   → hsl(38, 92%, 50%)   amber
meeting    → hsl(142, 71%, 45%)  green
other      → hsl(240, 5%, 65%)   gray
```

## Technical Details
- No database changes needed — uses existing `events` table
- No new hooks — reuses `useEvents()` 
- Calendar component maps `Event[]` by `event_date` field, grouped per day
- Day click dialog shows event cards styled like the uploaded venue cards (colored borders, icons for time/room)
- Mobile responsive: calendar cells shrink, dialog shows scrollable event list

