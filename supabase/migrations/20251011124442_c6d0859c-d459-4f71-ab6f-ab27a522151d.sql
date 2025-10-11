-- First, rename the old column
ALTER TABLE hotels RENAME COLUMN room_types TO room_types_old;

-- Create a new jsonb column for room types with prices
ALTER TABLE hotels ADD COLUMN room_types jsonb DEFAULT '[]'::jsonb;

-- Migrate existing data to new format
UPDATE hotels 
SET room_types = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'capacity', capacity::integer,
      'price', NULL
    )
  )
  FROM unnest(room_types_old) AS capacity
)
WHERE room_types_old IS NOT NULL;

-- Drop the old column
ALTER TABLE hotels DROP COLUMN room_types_old;

COMMENT ON COLUMN hotels.room_types IS 'Array of room type objects with capacity and price per night: [{"capacity": 2, "price": 15000}]';