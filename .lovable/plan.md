

# Revised Plan: Faculty & Student Dashboards — Matching Reference Exactly

## Mismatches Found in Previous Plan

1. **Student dashboard reference has NO swap requests, NO availability grid, NO workload card** — previous plan was correct on this, but missed key student-specific sections: **Announcements panel** and **"Next class in X min" countdown**.

2. **Student reference shows detailed today's classes table** with columns: Time, Subject, Duration ("48 min" countdown), Location (Room + Floor + Block), Instructor — NOT a simple timeline with dots. Previous plan described a faculty-style timeline for students too.

3. **Student reference has an Announcements section** (mid-sem exams, room changes, holidays with urgency badges) — previous plan omitted this entirely.

4. **Student header shows batch info** ("BCA Sem 3 · Section A") + "Full timetable ↗" and "Export PDF ↗" action buttons — previous plan only mentioned 3 metric cards.

5. **Faculty reference "Today's Schedule" is a vertical timeline** with colored left-border dots — this was correct. But the **weekly schedule grid** in the reference shows actual course cells (not just color blocks), and **Availability Preferences** is a separate grid with click-to-cycle behavior — previous plan lumped these together.

6. **Faculty header** includes initials avatar circle + department name + date — correct in previous plan.

7. **Student weekly timetable** shows a full 7-slot × 6-day grid with course-type labels in cells + summary footer ("This week: 16 hrs · 2 lectures · 1 lab · 1 tutorial") — previous plan didn't capture the footer summary.

---

## Corrected Component Map

### Faculty Dashboard (exact match to reference)

```text
┌─ [RM] Good morning, Dr. Rahul Mehta ──── Computer Science · Thu, 26 Mar 2026 ─┐
├─ 4 Stat Cards: Today's classes (4, next at 11:00) │ Weekly load (15/18, 83%)   │
│                Semester courses (3, breakdown)     │ Swap requests (2, pending) │
├───────────────────────────────────────┬─────────────────────────────────────────┤
│ Today's Schedule (timeline)           │ Workload this semester                  │
│ • 09:00-10:00 DSA · BCA-A · LH-3     │ 15/18 hrs · Progress bar                │
│ • 10:00-11:00 DSA · BCA-B · LH-3     │ Lectures 9h · Labs 4h · Tutorials 2h   │
│ • 11:00-12:00 Free period             ├─────────────────────────────────────────┤
│ • 11:00-13:00 DSA Lab · BCA-A · Lab-2 │ Swap Requests                           │
│ • 14:00-15:00 Tutorial DBMS · BCA-C   │ Mon 9AM→Wed 2PM · Pending               │
│                                       │ Fri 2PM→Fri 4PM · Approved              │
├───────────────────────────────────────┼─────────────────────────────────────────┤
│ Weekly Schedule (grid, This/Next wk)  │ Availability Preferences (click grid)   │
│ Mon-Sat × time slots with course cells│ Preferred / Available / Unavailable     │
└───────────────────────────────────────┴─────────────────────────────────────────┘
```

### Student Dashboard (exact match to reference)

```text
┌─ [PS] Good morning, Priya Sharma ─── BCA Sem 3 · Section A · Thu, 26 Mar ────┐
│                                        [Full timetable ↗] [Export PDF ↗]      │
├─ Today's Classes (table, NOT timeline) ───────────────────────────────────────┤
│ Time  │ Subject                │ Duration │ Location              │ Instructor│
│ 09:00 │ DSA                    │ 48 min   │ Lab-2 · Floor 1       │ Dr. Mehta │
│ 10:00 │ DBMS                   │          │ LH-3 · Floor 2        │ Dr. Mehta │
│ ...   │                        │          │                       │           │
│                                        "Next class in 48 min"                 │
│                                        "This week: 16 hrs"                    │
├─ Announcements ───────────────────────┬─ Weekly Timetable ────────────────────┤
│ • Mid-sem exam schedule released      │ Mon-Sat × 7 time slots grid           │
│   Urgent · Today                      │ Color-coded: Lecture/Lab/Tutorial     │
│ • DBMS lecture shifted to LH-4        │                                       │
│   Room change · Yesterday             │                                       │
│ • Holiday: Holi                       │                                       │
│   Holiday · 2 days ago                │                                       │
└───────────────────────────────────────┴───────────────────────────────────────┘
```

---

## Files to Create

### `src/components/dashboard/FacultyMetrics.tsx`
4 stat cards matching reference exactly. Data from: schedule_entries (today's count), faculty.current_load + max_hours_per_week, teaching_assignments (course count + type breakdown), swap requests (pending count). Each card shows a primary number + subtitle detail.

### `src/components/dashboard/ScheduleTimeline.tsx`
Faculty-only vertical timeline. Fetches published schedule entries filtered by faculty email → faculty_id and today's day_of_week. Each row: time range, colored dot (blue=Lecture, green=Lab, amber=Tutorial), course name, batch + section + room (with capacity), type badge. Free periods shown. Highlights "next class" with blue left border.

### `src/components/dashboard/StudentScheduleTable.tsx`
Student-specific table (NOT the faculty timeline). Columns: Time, Subject, Duration (countdown to next), Location (Room + Floor + Block), Instructor. Footer: "Next class in X min" + "This week: X hrs · breakdown". Data from schedule_entries filtered by student's batch_id from profiles table.

### `src/components/dashboard/AnnouncementsPanel.tsx`
Student-only. Fetches system_alerts and displays as a list with urgency badges (Urgent=red, Room change=amber, Holiday=blue) and relative timestamps ("Today", "Yesterday", "2 days ago").

### `src/components/dashboard/WorkloadCard.tsx`
Faculty-only. Shows X/Y hrs with progress bar + breakdown by session type (Lectures, Labs, Tutorials). Data from teaching_assignments + schedule_entries for current faculty.

### `src/components/dashboard/WeeklyGrid.tsx`
Shared component (used by both dashboards). Displays a time × day grid with course cells. Faculty mode: filtered by faculty_id. Student mode: filtered by batch_id. Color-coded cells. Optional "This week/Next week" toggle for faculty. Summary footer for student ("This week: 16 hrs").

### `src/components/dashboard/AvailabilityGrid.tsx`
Faculty-only. Interactive grid using existing `useFacultyAvailability` + `useSetFacultyPreference`. Click to cycle: Available → Preferred (green) → Unavailable (red). Legend at top.

### `src/components/dashboard/FacultySwapPanel.tsx`
Faculty-only. Uses `useSwapRequests` hook. Shows from→to slots, course + batch + reason, status badges (Pending=amber, Approved=green). Cancel/Details buttons for pending.

## Files to Modify

### `src/pages/FacultyDashboard.tsx`
Complete rewrite with: header (initials avatar + greeting + dept + date), FacultyMetrics, 2-col layout (ScheduleTimeline | WorkloadCard + FacultySwapPanel), 2-col bottom (WeeklyGrid | AvailabilityGrid).

### `src/pages/StudentDashboard.tsx`
Complete rewrite with: header (initials avatar + greeting + batch + section + date + action buttons), StudentScheduleTable, 2-col layout (AnnouncementsPanel | WeeklyGrid).

### `src/hooks/useFaculty.ts`
Add `useFacultyByEmail(email)` to look up the faculty record linked to the current auth user's email — needed to filter schedule entries by faculty_id.

---

## Data Flow

- **Faculty identity**: `auth.user.email` → query `faculty` table by email → get `faculty.id` → filter `schedule_entries` + `teaching_assignments` by faculty_id
- **Student identity**: `auth.user.id` → query `profiles` table → get `batch_id` → filter `schedule_entries` by batch via teaching_assignments join
- **Published schedule**: Find schedule with `status = 'published'`, use its entries
- **Announcements**: Reuse `system_alerts` table (already created), display with type-based badges
- **Availability**: Existing `faculty_preferences` table + hooks (already functional)
- **Swap requests**: Existing `useSwapRequests` hook (returns empty until table exists — shows placeholder)

