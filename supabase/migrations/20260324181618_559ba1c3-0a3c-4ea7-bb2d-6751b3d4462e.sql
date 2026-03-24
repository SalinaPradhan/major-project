
-- Add role-specific fields to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS student_id text,
  ADD COLUMN IF NOT EXISTS faculty_code text,
  ADD COLUMN IF NOT EXISTS batch_id uuid REFERENCES public.batches(id),
  ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES public.departments(id);
