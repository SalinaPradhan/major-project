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

CREATE POLICY "Admins can manage events" ON public.events FOR ALL
  TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Faculty can create events" ON public.events FOR INSERT
  TO authenticated WITH CHECK (public.has_role(auth.uid(), 'faculty') AND created_by = auth.uid());

CREATE POLICY "Faculty can update own events" ON public.events FOR UPDATE
  TO authenticated USING (public.has_role(auth.uid(), 'faculty') AND created_by = auth.uid());

CREATE POLICY "Events viewable by authenticated" ON public.events FOR SELECT
  TO authenticated USING (true);

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();