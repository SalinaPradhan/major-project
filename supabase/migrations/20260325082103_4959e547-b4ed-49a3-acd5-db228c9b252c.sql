
-- Fix 17: Academic calendar table
CREATE TYPE public.calendar_event_type AS ENUM ('holiday', 'exam_period', 'break', 'special');

CREATE TABLE public.academic_calendar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  event_type calendar_event_type NOT NULL DEFAULT 'holiday',
  start_date date NOT NULL,
  end_date date NOT NULL,
  description text,
  excludes_scheduling boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.academic_calendar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage academic_calendar" ON public.academic_calendar
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Academic calendar viewable by authenticated" ON public.academic_calendar
  FOR SELECT TO authenticated
  USING (true);

-- Fix 18: Room utilization — add target column
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS utilization_target integer DEFAULT 80;
