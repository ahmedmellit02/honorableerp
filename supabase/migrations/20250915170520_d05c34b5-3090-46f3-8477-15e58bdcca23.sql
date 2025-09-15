-- Fix the numeric ID gap in sales table
-- Update the last sale from #8392 to #8390
UPDATE public.sales 
SET numeric_id = 8390 
WHERE id = '91e7d4b0-99ca-496b-af59-f459ef6516a8';

-- Reset the sequence to start from 8391 for the next sale
SELECT setval('sales_numeric_id_seq', 8390, true);