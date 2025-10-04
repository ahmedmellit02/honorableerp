-- Add departure and arrival airport columns to omra_programs table
ALTER TABLE public.omra_programs 
ADD COLUMN departure_airport text,
ADD COLUMN arrival_airport text;