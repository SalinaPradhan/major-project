

# Feature #6: Student/Faculty Tools

Three sub-features: (A) iCal/.ics export, (B) PDF timetable export, (C) Enhanced swap request workflow with peer notifications.

## What Already Exists
- Swap requests: full CRUD with `swap_requests` table, `FacultySwapPanel`, `SwapRequestFormDialog` -- faculty can create/cancel swaps
- Student dashboard: has a disabled "Export PDF" button, weekly grid, today's schedule
- Faculty dashboard: has swap panel, schedule timeline, workload card
- Schedule entries are fully queryable with room/course/faculty/batch joins

## Implementation Plan

### A. iCal/.ics Calendar Export (Student + Faculty Dashboards)

**New file: `src/lib/icalExport.ts`**
- Utility function that takes an array of schedule entries and generates a valid `.ics` file string
- Each class becomes a `VEVENT` with `DTSTART`, `DTEND`, `SUMMARY` (course name), `LOCATION` (room), `DESCRIPTION` (faculty name)
- Map day-of-week to next occurrence dates for recurring weekly events using `RRULE:FREQ=WEEKLY`
- Trigger browser download of the `.ics` file

**Update `StudentDashboard.tsx`**:
- Add "Sync Calendar" button next to the disabled PDF button
- On click, generate .ics from the student's published schedule entries (filtered by batch)

**Update `FacultyDashboard.tsx`**:
- Add "Sync Calendar" button
- Generate .ics from the faculty's schedule entries

### B. PDF Timetable Export (Enable the Disabled Button)

**New file: `src/lib/pdfExport.ts`**
- Install `jspdf` + `jspdf-autotable` (already mentioned in project knowledge as planned)
- Build a weekly timetable table (days x time slots) and render as PDF
- Include header with student/faculty name, batch, semester info

**Update `StudentDashboard.tsx`**:
- Enable the "Export PDF" button, wire it to the PDF generator
- Pass the weekly grid data to generate the timetable PDF

**Update `FacultyDashboard.tsx`**:
- Add "Export PDF" button with same logic

### C. Enhanced Swap Request Workflow

**Database migration**: Add `target_faculty_id` column to `swap_requests` table to support peer-to-peer swaps (faculty A requests to swap a slot with faculty B).

**Update `SwapRequestFormDialog.tsx`**:
- Add a "Swap With" faculty dropdown so requesters can target a specific peer
- Show the target faculty's schedule for the requested day/slot

**Update `FacultySwapPanel.tsx`**:
- Show "Incoming" vs "Outgoing" tabs
- Incoming: swaps where `target_faculty_id` matches current faculty -- show Approve/Reject buttons
- Outgoing: swaps created by current faculty -- show Cancel button

**Update `useSwapRequests.ts`**:
- Add query for incoming swap requests (`target_faculty_id = current faculty`)
- Add approve/reject mutations

**System alert on swap approval**:
- When a swap is approved, insert a `system_alerts` row notifying both parties

## File Changes Summary

| File | Action |
|------|--------|
| `src/lib/icalExport.ts` | Create -- .ics generation utility |
| `src/lib/pdfExport.ts` | Create -- PDF timetable generator |
| `src/pages/StudentDashboard.tsx` | Edit -- enable PDF, add iCal button |
| `src/pages/FacultyDashboard.tsx` | Edit -- add PDF + iCal buttons |
| `src/components/dashboard/FacultySwapPanel.tsx` | Edit -- incoming/outgoing tabs |
| `src/components/dashboard/SwapRequestFormDialog.tsx` | Edit -- add target faculty picker |
| `src/hooks/useSwapRequests.ts` | Edit -- add incoming query, target_faculty support |
| DB migration | Add `target_faculty_id` to `swap_requests` |
| `package.json` | Add `jspdf` + `jspdf-autotable` |

## Build Order
1. iCal export utility + wire to both dashboards
2. PDF export utility + enable button on both dashboards
3. DB migration for peer-to-peer swaps
4. Enhanced swap UI (incoming/outgoing tabs, target faculty picker)

