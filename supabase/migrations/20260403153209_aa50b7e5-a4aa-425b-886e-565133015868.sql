
CREATE TABLE public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'equipment',
  location text,
  status text NOT NULL DEFAULT 'working',
  assigned_to text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage assets" ON public.assets
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Assets viewable by authenticated" ON public.assets
  FOR SELECT TO authenticated
  USING (true);

CREATE TABLE public.support_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  department text NOT NULL,
  role text NOT NULL DEFAULT 'lab_assistant',
  shift text NOT NULL DEFAULT 'full_day',
  status text NOT NULL DEFAULT 'available',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage support_staff" ON public.support_staff
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Support staff viewable by authenticated" ON public.support_staff
  FOR SELECT TO authenticated
  USING (true);
