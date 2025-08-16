-- Update the SELECT policy for sales table to allow all authenticated users to view all sales
DROP POLICY "Users can view their own sales" ON public.sales;

CREATE POLICY "All authenticated users can view all sales" 
ON public.sales 
FOR SELECT 
TO authenticated
USING (true);