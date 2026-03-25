
-- Fix 10: Composite indexes for schedule_entries conflict lookups
CREATE INDEX IF NOT EXISTS idx_schedule_entries_conflict ON public.schedule_entries (day, time_slot_id, room_id);
CREATE INDEX IF NOT EXISTS idx_schedule_entries_assignment ON public.schedule_entries (teaching_assignment_id, day);
CREATE INDEX IF NOT EXISTS idx_schedule_entries_schedule ON public.schedule_entries (schedule_id);

-- Fix 9: Server-side conflict detection RPC
CREATE OR REPLACE FUNCTION public.check_schedule_conflicts(p_schedule_id uuid)
RETURNS TABLE (
  conflict_type text,
  day text,
  time_slot_label text,
  entity_name text,
  entry_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Room conflicts
  SELECT
    'room' AS conflict_type,
    se.day::text,
    ts.label AS time_slot_label,
    r.name AS entity_name,
    COUNT(*) AS entry_count
  FROM schedule_entries se
  JOIN time_slots ts ON ts.id = se.time_slot_id
  JOIN rooms r ON r.id = se.room_id
  WHERE se.schedule_id = p_schedule_id
  GROUP BY se.day, se.time_slot_id, se.room_id, ts.label, r.name
  HAVING COUNT(*) > 1

  UNION ALL

  -- Faculty conflicts
  SELECT
    'faculty' AS conflict_type,
    se.day::text,
    ts.label AS time_slot_label,
    f.name AS entity_name,
    COUNT(*) AS entry_count
  FROM schedule_entries se
  JOIN teaching_assignments ta ON ta.id = se.teaching_assignment_id
  JOIN faculty f ON f.id = ta.faculty_id
  JOIN time_slots ts ON ts.id = se.time_slot_id
  WHERE se.schedule_id = p_schedule_id
  GROUP BY se.day, se.time_slot_id, ta.faculty_id, ts.label, f.name
  HAVING COUNT(*) > 1

  UNION ALL

  -- Batch conflicts
  SELECT
    'batch' AS conflict_type,
    se.day::text,
    ts.label AS time_slot_label,
    b.name AS entity_name,
    COUNT(*) AS entry_count
  FROM schedule_entries se
  JOIN teaching_assignments ta ON ta.id = se.teaching_assignment_id
  JOIN batches b ON b.id = ta.batch_id
  JOIN time_slots ts ON ts.id = se.time_slot_id
  WHERE se.schedule_id = p_schedule_id
  GROUP BY se.day, se.time_slot_id, ta.batch_id, ts.label, b.name
  HAVING COUNT(*) > 1;
$$;
