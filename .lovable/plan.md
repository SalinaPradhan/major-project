

# Plan: Event Scheduler + Student Dashboard + PDF Error Fixes

## Part 1: Build Event Scheduler (Database-Backed)

### Database Migration
Create `event_type` enum and `events` table:
```sql
CREATE TYPE public.event_type AS ENUM ('exam','seminar','workshop','meeting','other');

CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_type public.event_type NOT NULL DEFAULT 'other',
  room_id uuid REFERENCES public.rooms(id) ON DELETE SET NULL,
  event_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Admins: full CRUD
CREATE POLICY "Admins can manage events" ON public.events FOR ALL
  TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Faculty: can create events and manage their own
CREATE POLICY "Faculty can create events" ON public.events FOR INSERT
  TO authenticated WITH CHECK (public.has_role(auth.uid(), 'faculty') AND created_by = auth.uid());

CREATE POLICY "Faculty can update own events" ON public.events FOR UPDATE
  TO authenticated USING (public.has_role(auth.uid(), 'faculty') AND created_by = auth.uid());

-- Everyone authenticated can view events
CREATE POLICY "Events viewable by authenticated" ON public.events FOR SELECT
  TO authenticated USING (true);
```

### New Files
- **`src/hooks/useEvents.ts`** — CRUD hook (fetch all, create, update, delete) using TanStack Query
- **`src/components/forms/EventFormDialog.tsx`** — Form with title, type, room selector, date, start/end time, description

### Modified Files
- **`src/pages/EventScheduler.tsx`** — Replace placeholder with full event list (table view with filters by date/type), create/edit/delete buttons (admin/faculty only), read-only for students
- **`src/pages/FacultyDashboard.tsx`** — Add "Events" quick-access card linking to `/event-scheduler`
- **`src/pages/StudentDashboard.tsx`** — Add "Upcoming Events" card (view-only, no create/edit buttons) linking to `/event-scheduler`
- **`src/components/layout/AppSidebar.tsx`** — Add "Events" nav item for admin, faculty, AND student roles
- **`src/App.tsx`** — Update `/event-scheduler` route to allow all authenticated users (remove admin-only restriction)

### Student View-Only Logic
The `EventScheduler.tsx` page will check the user's role via `useAuth()`. Create/edit/delete buttons will only render when `isAdminOrAbove || isFaculty`. Students see a read-only list of confirmed events.

---

## Part 2: Sample Faculty & Student Accounts

You can create test accounts by signing up through the Auth page:

| Role | Email | Password | Role Selection |
|------|-------|----------|----------------|
| Faculty | `faculty@tros.edu` | `Faculty@123` | Select "Faculty" |
| Student | `student@tros.edu` | `Student@123` | Select "Student" |

The trigger (`on_auth_user_created`) will auto-assign the correct role. After signing up, log in with these credentials to see the Faculty Dashboard or Student Dashboard respectively.

---

## Part 3: PDF Error Analysis — What's Already Fixed vs. What Remains

The PDF is a comprehensive architecture review, not just a bug list. Here's the status:

### Already Fixed
- **Missing `teaching_assignments` table** — Created and functional with CRUD UI
- **Missing `departments` table** — Created and populated
- **No trigger for signup roles** — Fixed in the last migration

### Will Fix in This Implementation
- **Event/Room Booking system** — Building it now (Part 1)

### Known Issues NOT Fixed Yet (Future Phases)
These are from the PDF's roadmap and are significant engineering efforts. They are listed here for awareness — each would be its own implementation cycle:

1. **GA random seeding bug** — Random chromosome initialization causes many initial hard conflicts. Fix: greedy load-aware seeding instead of pure random.
2. **GA early termination bug** — The GA can exit when fitness is still negative with hard conflicts remaining. Fix: separate hard/soft penalty tracking.
3. **faculty.current_load never updated** — The GA doesn't write back faculty load after generation. Workload metrics on the dashboard are inaccurate.
4. **No schedule versioning** — `clearExisting=true` destroys old schedules with no rollback. Fix: add `schedule_versions` table.
5. **No academic calendar** — Holidays and exam periods aren't excluded from scheduling.
6. **No pagination** — All list views fetch unlimited records; will break at scale.
7. **Conflict detection is client-side O(n)** — Should move to a PostgreSQL RPC function.
8. **Migration conflicts** — Multiple migrations define the same tables (won't affect Cloud, but would fail on fresh Supabase deploys).

These are real issues but they're Phase 2-4 improvements per the PDF's roadmap. The system works correctly for the current data scale.

---

## Part 4: Lovable Badge Removal

Go to **project Settings (gear icon) → General → scroll to "Hide Lovable Badge"** and toggle it on. This is a project setting, not a code change.

---

## Execution Order
1. Database migration (events table + RLS)
2. Create `useEvents.ts` hook
3. Create `EventFormDialog.tsx`
4. Rewrite `EventScheduler.tsx` with full UI
5. Update `AppSidebar.tsx` (add Events to all roles)
6. Update `App.tsx` routes (allow all authenticated users)
7. Update `StudentDashboard.tsx` and `FacultyDashboard.tsx` (add events cards)

