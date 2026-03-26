
-- Tighten system_alerts INSERT policy to only allow inserts with valid alert_type
DROP POLICY IF EXISTS "Authenticated can create alerts" ON public.system_alerts;
CREATE POLICY "Authenticated can create alerts" ON public.system_alerts
  FOR INSERT TO authenticated
  WITH CHECK (alert_type IN ('venue_booking', 'general'));
