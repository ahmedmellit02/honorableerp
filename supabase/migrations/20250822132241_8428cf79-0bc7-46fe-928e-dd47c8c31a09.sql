-- Add classification and approval columns to expenses table
ALTER TABLE public.expenses 
ADD COLUMN classification TEXT CHECK (classification IN ('V', 'F', 'O')),
ADD COLUMN approved BOOLEAN DEFAULT FALSE,
ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN approved_by UUID,
ADD COLUMN classified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN classified_by UUID;

-- Update RLS policies to remove delete for everyone
DROP POLICY IF EXISTS "Users can delete their own expenses" ON public.expenses;

-- Add policy for classification (only for specific user - Asri)
CREATE POLICY "Only Asri can classify expenses" 
ON public.expenses 
FOR UPDATE 
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'honorablevoyage@gmail.com'
  AND (classification IS NULL OR auth.uid() = classified_by)
);

-- Add policy for approval (only managers)
CREATE POLICY "Only managers can approve expenses" 
ON public.expenses 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'manager'
  )
  AND approved = FALSE
);