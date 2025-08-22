-- Update RLS policy to allow cashiers to classify expenses instead of only Asri
DROP POLICY IF EXISTS "Only Asri can classify expenses" ON public.expenses;

CREATE POLICY "Only cashiers can classify expenses" 
ON public.expenses 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'cashier'::app_role
  ) 
  AND (classification IS NULL OR auth.uid() = classified_by)
);