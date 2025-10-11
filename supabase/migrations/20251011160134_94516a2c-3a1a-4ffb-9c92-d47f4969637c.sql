-- Update agent from Asri to Ahmed for sales #8471 and #8470
UPDATE public.sales 
SET agent = 'Ahmed' 
WHERE numeric_id IN (8471, 8470) 
AND agent = 'Asri';