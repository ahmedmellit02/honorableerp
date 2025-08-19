-- Add new columns to sales table for enhanced flight and RW data
ALTER TABLE public.sales 
ADD COLUMN from_airport TEXT,
ADD COLUMN to_airport TEXT,
ADD COLUMN has_registration BOOLEAN DEFAULT false,
ADD COLUMN rw_date DATE,
ADD COLUMN rw_time TIME;

-- Remove the notes column that's no longer needed
ALTER TABLE public.sales 
DROP COLUMN IF EXISTS notes;