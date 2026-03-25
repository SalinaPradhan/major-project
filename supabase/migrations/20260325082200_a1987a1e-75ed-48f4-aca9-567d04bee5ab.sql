
-- Fix 19: Add progress tracking columns to generation_jobs
ALTER TABLE public.generation_jobs ADD COLUMN IF NOT EXISTS current_generation integer DEFAULT 0;
ALTER TABLE public.generation_jobs ADD COLUMN IF NOT EXISTS total_generations integer DEFAULT 0;
ALTER TABLE public.generation_jobs ADD COLUMN IF NOT EXISTS current_fitness double precision;
ALTER TABLE public.generation_jobs ADD COLUMN IF NOT EXISTS current_violations integer;

-- Enable realtime for generation_jobs so UI can subscribe
ALTER PUBLICATION supabase_realtime ADD TABLE public.generation_jobs;
