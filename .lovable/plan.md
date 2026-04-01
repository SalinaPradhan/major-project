

# Plan: Make Swap Requests & Availability Grid Functional

## Current State

- **Availability Grid**: Already functional — reads/writes `faculty_preferences` table via `useFacultyAvailability` hook. Clicking cells cycles through Available → Preferred → Unavailable. Works if `facultyId` is linked.
- **Swap Requests**: Entirely hardcoded — no database table exists. Buttons (Cancel, Details, New swap request) are non-functional stubs.

## What Needs to Be Done

### 1. Create `swap_requests` database table

```sql
CREATE TABLE public.swap_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL,  -- references auth.users
  faculty_id uuid NOT NULL,    -- references faculty record
  requester_name text NOT NULL,
  from_day day_of_week NOT NULL,
  from_slot_id uuid NOT NULL,  -- references time_slots
  to_day day_of_week NOT NULL,
  to_slot_id uuid NOT NULL,    -- references time_slots
  reason text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',  -- pending/approved/rejected
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.swap_requests ENABLE ROW LEVEL SECURITY;

-- Faculty can view all swap requests
CREATE POLICY "Swap requests viewable by authenticated"
  ON public.swap_requests FOR SELECT TO authenticated USING (true);

-- Faculty can create their own swap requests
CREATE POLICY "Faculty can create own swap requests"
  ON public.swap_requests FOR INSERT TO authenticated
  WITH CHECK (requester_id = auth.uid());

-- Faculty can update (cancel) their own requests
CREATE POLICY "Faculty can update own swap requests"
  ON public.swap_requests FOR UPDATE TO authenticated
  USING (requester_id = auth.uid());

-- Admins can manage all
CREATE POLICY "Admins can manage swap requests"
  ON public.swap_requests FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));
```

### 2. Update `useSwapRequests.ts` — Connect to real table

- Replace hardcoded sample data with Supabase queries joining `time_slots` for slot labels
- Implement `useCreateSwapRequest` to insert into the table
- Implement `useUpdateSwapRequestStatus` (cancel = set status to 'rejected')
- Filter by current user's `requester_id`

### 3. Create `SwapRequestFormDialog.tsx` — New swap request form

A dialog triggered by the "+ New swap request" button with:
- **From**: Day dropdown + Period/slot dropdown (pre-populated from faculty's current schedule entries)
- **To**: Day dropdown + Period/slot dropdown
- **Reason**: Text area
- Submits to `swap_requests` table via the mutation hook

### 4. Update `FacultySwapPanel.tsx` — Wire up buttons

- **Cancel button**: Calls `useUpdateSwapRequestStatus` with status `'rejected'` (with confirmation)
- **Details button**: Opens a detail dialog/popover showing full swap info
- **"+ New swap request" button**: Opens the `SwapRequestFormDialog`
- Pass `facultyId` and `userId` as props from `FacultyDashboard`

### 5. Insert sample swap request data

Insert 3 sample rows into the new `swap_requests` table matching the faculty user so the panel shows data immediately.

## Files to Create/Modify

| File | Action |
|------|--------|
| Database migration | Create `swap_requests` table + RLS |
| `src/hooks/useSwapRequests.ts` | Rewrite to use Supabase |
| `src/components/dashboard/SwapRequestFormDialog.tsx` | New — form dialog |
| `src/components/dashboard/FacultySwapPanel.tsx` | Wire Cancel/Details/New buttons |
| `src/pages/FacultyDashboard.tsx` | Pass `facultyId`/`userId` to SwapPanel |

## Note on Availability Grid

The Availability Grid is **already functional** — it reads/writes the `faculty_preferences` table. Clicking a cell cycles through the 3 states and persists to the database. No changes needed unless the RLS policy is blocking writes for the faculty user (which we can verify after implementing).

