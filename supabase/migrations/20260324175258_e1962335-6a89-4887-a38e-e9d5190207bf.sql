-- Timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ENUM types
CREATE TYPE public.room_type AS ENUM ('classroom', 'lab', 'auditorium');
CREATE TYPE public.day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday');
CREATE TYPE public.schedule_status AS ENUM ('draft', 'published', 'archived');

-- 1. DEPARTMENTS
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Departments are viewable by all authenticated" ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Departments are manageable by all authenticated" ON public.departments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. FACULTY
CREATE TABLE public.faculty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  max_hours_per_day INT NOT NULL DEFAULT 6,
  max_hours_per_week INT NOT NULL DEFAULT 18,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Faculty viewable by authenticated" ON public.faculty FOR SELECT TO authenticated USING (true);
CREATE POLICY "Faculty manageable by authenticated" ON public.faculty FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER update_faculty_updated_at BEFORE UPDATE ON public.faculty FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. COURSES
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  credit_hours INT NOT NULL DEFAULT 3,
  lecture_hours INT NOT NULL DEFAULT 3,
  lab_hours INT NOT NULL DEFAULT 0,
  requires_lab BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Courses viewable by authenticated" ON public.courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Courses manageable by authenticated" ON public.courses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. ROOMS
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  capacity INT NOT NULL DEFAULT 30,
  room_type public.room_type NOT NULL DEFAULT 'classroom',
  has_projector BOOLEAN NOT NULL DEFAULT true,
  building TEXT,
  floor INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rooms viewable by authenticated" ON public.rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Rooms manageable by authenticated" ON public.rooms FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. BATCHES
CREATE TABLE public.batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  semester INT NOT NULL DEFAULT 1,
  section TEXT NOT NULL DEFAULT 'A',
  strength INT NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(name, section)
);
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Batches viewable by authenticated" ON public.batches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Batches manageable by authenticated" ON public.batches FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON public.batches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. TIME SLOTS
CREATE TABLE public.time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_order INT NOT NULL,
  is_break BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(start_time, end_time)
);
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Time slots viewable by authenticated" ON public.time_slots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Time slots manageable by authenticated" ON public.time_slots FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. TEACHING ASSIGNMENTS
CREATE TABLE public.teaching_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL REFERENCES public.faculty(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  is_lab BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(faculty_id, course_id, batch_id)
);
ALTER TABLE public.teaching_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Assignments viewable by authenticated" ON public.teaching_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Assignments manageable by authenticated" ON public.teaching_assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. FACULTY PREFERENCES
CREATE TABLE public.faculty_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL REFERENCES public.faculty(id) ON DELETE CASCADE,
  day public.day_of_week NOT NULL,
  time_slot_id UUID NOT NULL REFERENCES public.time_slots(id) ON DELETE CASCADE,
  preference INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(faculty_id, day, time_slot_id)
);
ALTER TABLE public.faculty_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Preferences viewable by authenticated" ON public.faculty_preferences FOR SELECT TO authenticated USING (true);
CREATE POLICY "Preferences manageable by authenticated" ON public.faculty_preferences FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9. SCHEDULES
CREATE TABLE public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status public.schedule_status NOT NULL DEFAULT 'draft',
  fitness_score FLOAT,
  generation_count INT,
  population_size INT,
  mutation_rate FLOAT,
  hard_constraint_violations INT DEFAULT 0,
  soft_constraint_score FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Schedules viewable by authenticated" ON public.schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Schedules manageable by authenticated" ON public.schedules FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON public.schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. SCHEDULE ENTRIES
CREATE TABLE public.schedule_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
  teaching_assignment_id UUID NOT NULL REFERENCES public.teaching_assignments(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  time_slot_id UUID NOT NULL REFERENCES public.time_slots(id) ON DELETE CASCADE,
  day public.day_of_week NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.schedule_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Entries viewable by authenticated" ON public.schedule_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Entries manageable by authenticated" ON public.schedule_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_entries_schedule ON public.schedule_entries(schedule_id);
CREATE INDEX idx_entries_room_day_slot ON public.schedule_entries(room_id, day, time_slot_id);
CREATE INDEX idx_entries_day_slot ON public.schedule_entries(day, time_slot_id);

-- 11. Default time slots
INSERT INTO public.time_slots (label, start_time, end_time, slot_order, is_break) VALUES
  ('Period 1', '08:00', '08:50', 1, false),
  ('Period 2', '09:00', '09:50', 2, false),
  ('Period 3', '10:00', '10:50', 3, false),
  ('Break', '10:50', '11:10', 4, true),
  ('Period 4', '11:10', '12:00', 5, false),
  ('Period 5', '12:00', '12:50', 6, false),
  ('Lunch', '12:50', '13:40', 7, true),
  ('Period 6', '13:40', '14:30', 8, false),
  ('Period 7', '14:30', '15:20', 9, false),
  ('Period 8', '15:30', '16:20', 10, false);