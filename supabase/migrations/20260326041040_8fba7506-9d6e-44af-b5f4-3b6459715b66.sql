
-- Create venue_bookings table
CREATE TABLE public.venue_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  host_id uuid NOT NULL,
  host_name text NOT NULL,
  event_name text NOT NULL,
  description text NOT NULL DEFAULT '',
  event_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.venue_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Venue bookings viewable by authenticated" ON public.venue_bookings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create venue bookings" ON public.venue_bookings
  FOR INSERT TO authenticated WITH CHECK (host_id = auth.uid());

CREATE POLICY "Hosts can update own bookings" ON public.venue_bookings
  FOR UPDATE TO authenticated USING (host_id = auth.uid());

CREATE POLICY "Admins can manage venue bookings" ON public.venue_bookings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create venue_requests table
CREATE TABLE public.venue_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.venue_bookings(id) ON DELETE CASCADE,
  requestor_id uuid NOT NULL,
  requestor_name text NOT NULL,
  reason text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

ALTER TABLE public.venue_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Venue requests viewable by authenticated" ON public.venue_requests
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create venue requests" ON public.venue_requests
  FOR INSERT TO authenticated WITH CHECK (requestor_id = auth.uid());

-- Security definer function: only host of booking can review requests
CREATE OR REPLACE FUNCTION public.is_booking_host(_user_id uuid, _booking_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.venue_bookings
    WHERE id = _booking_id AND host_id = _user_id
  )
$$;

CREATE POLICY "Hosts can review requests" ON public.venue_requests
  FOR UPDATE TO authenticated
  USING (public.is_booking_host(auth.uid(), booking_id));

CREATE POLICY "Admins can manage venue requests" ON public.venue_requests
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create system_alerts table
CREATE TABLE public.system_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  message text NOT NULL,
  related_entity_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System alerts viewable by authenticated" ON public.system_alerts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can create alerts" ON public.system_alerts
  FOR INSERT TO authenticated WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.venue_bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.venue_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_alerts;
