
-- Fix 12: Generation jobs mutex
CREATE TYPE public.job_status AS ENUM ('pending', 'running', 'completed', 'failed');

CREATE TABLE public.generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
  status job_status NOT NULL DEFAULT 'pending',
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage generation_jobs" ON public.generation_jobs
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Generation jobs viewable by authenticated" ON public.generation_jobs
  FOR SELECT TO authenticated
  USING (true);

-- Fix 11: Schedule versioning
CREATE TABLE public.schedule_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
  version_number integer NOT NULL DEFAULT 1,
  fitness_score double precision,
  hard_constraint_violations integer DEFAULT 0,
  soft_constraint_score double precision DEFAULT 0,
  entries_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.schedule_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage schedule_versions" ON public.schedule_versions
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Schedule versions viewable by authenticated" ON public.schedule_versions
  FOR SELECT TO authenticated
  USING (true);

-- Add version tracking to schedules
ALTER TABLE public.schedules ADD COLUMN IF NOT EXISTS current_version integer DEFAULT 0;
