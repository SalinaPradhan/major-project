ALTER TABLE public.schedules
  ADD COLUMN department_id uuid REFERENCES public.departments(id),
  ADD COLUMN batch_ids uuid[] DEFAULT '{}';