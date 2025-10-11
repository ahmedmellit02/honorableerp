-- Add room_type_capacity column to omra_programs table
ALTER TABLE omra_programs ADD COLUMN room_type_capacity integer;

COMMENT ON COLUMN omra_programs.room_type_capacity IS 'Number of people per room (e.g., 2, 3, 4, 5)';