
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  selected_role text;
  user_count INT;
BEGIN
  INSERT INTO public.profiles (user_id, display_name, student_id, faculty_code, batch_id, department_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NEW.raw_user_meta_data->>'student_id',
    NEW.raw_user_meta_data->>'faculty_code',
    NULLIF(NEW.raw_user_meta_data->>'batch_id', '')::uuid,
    NULLIF(NEW.raw_user_meta_data->>'department_id', '')::uuid
  );

  selected_role := COALESCE(NEW.raw_user_meta_data->>'role', '');
  
  IF selected_role = 'admin' THEN
    SELECT COUNT(*) INTO user_count FROM public.user_roles WHERE role = 'admin';
    IF user_count = 0 THEN
      INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
    ELSE
      INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'viewer');
    END IF;
  ELSIF selected_role = 'faculty' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'faculty');
  ELSIF selected_role = 'student' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'viewer');
  END IF;

  RETURN NEW;
END;
$function$;

CREATE POLICY "Faculty can manage own preferences" ON public.faculty_preferences
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.faculty f
    JOIN public.profiles p ON p.department_id = f.department_id
    WHERE f.id = faculty_preferences.faculty_id
    AND p.user_id = auth.uid()
    AND public.has_role(auth.uid(), 'faculty')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.faculty f
    JOIN public.profiles p ON p.department_id = f.department_id
    WHERE f.id = faculty_preferences.faculty_id
    AND p.user_id = auth.uid()
    AND public.has_role(auth.uid(), 'faculty')
  )
);
