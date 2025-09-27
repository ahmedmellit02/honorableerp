-- Add room_types column to hotels table
ALTER TABLE hotels ADD COLUMN room_types integer[] DEFAULT ARRAY[]::integer[];

-- Make city, country, star_rating, distance_from_haram, price_per_night, description, amenities nullable since they're being removed from the form
ALTER TABLE hotels ALTER COLUMN city DROP NOT NULL;
ALTER TABLE hotels ALTER COLUMN country SET DEFAULT NULL;
ALTER TABLE hotels ALTER COLUMN country DROP NOT NULL;