CREATE TABLE public.swap_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL,
  faculty_id uuid NOT NULL,
  requester_name text NOT NULL,
  from_day public.day_of_week NOT NULL,
  from_slot_id uuid NOT NULL REFERENCES public.time_slots(id),
  to_day public.day_of_week NOT NULL,
  to_slot_id uuid NOT NULL REFERENCES public.time_slots(id),
  reason text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.swap_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Swap requests viewable by authenticated"
  ON public.swap_requests FOR SELECT TO authenticated USING (true);

CREATE POLICY "Faculty can create own swap requests"
  ON public.swap_requests FOR INSERT TO authenticated
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Faculty can update own swap requests"
  ON public.swap_requests FOR UPDATE TO authenticated
  USING (requester_id = auth.uid());

CREATE POLICY "Admins can manage swap requests"
  ON public.swap_requests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));