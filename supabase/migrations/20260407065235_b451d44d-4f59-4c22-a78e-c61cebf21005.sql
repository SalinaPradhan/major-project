
ALTER TABLE public.swap_requests ADD COLUMN target_faculty_id uuid REFERENCES public.faculty(id) ON DELETE SET NULL;

-- Allow target faculty to update (approve/reject) swap requests directed at them
CREATE POLICY "Target faculty can update incoming swap requests"
ON public.swap_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.faculty f
    WHERE f.id = swap_requests.target_faculty_id
      AND f.email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);
