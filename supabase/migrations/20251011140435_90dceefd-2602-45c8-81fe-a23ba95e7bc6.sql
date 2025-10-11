-- Delete all pelerin payments first (due to foreign key)
DELETE FROM public.pelerin_payments;

-- Delete all pelerins
DELETE FROM public.pelerins;

-- Delete all omra programs
DELETE FROM public.omra_programs;

-- Delete all hotels
DELETE FROM public.hotels;