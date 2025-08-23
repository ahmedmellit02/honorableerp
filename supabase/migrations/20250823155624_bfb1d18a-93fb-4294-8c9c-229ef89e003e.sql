-- Fix the RLS policy for expense approval to be more robust
DROP POLICY IF EXISTS "Only managers can approve expenses" ON public.expenses;

CREATE POLICY "Only managers can approve expenses" 
ON public.expenses 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'manager'::app_role
  )
  AND approved = false
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'manager'::app_role
  )
);