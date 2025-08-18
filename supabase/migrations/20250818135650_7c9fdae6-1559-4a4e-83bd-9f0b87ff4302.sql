-- Drop the existing check constraint
ALTER TABLE balance_records DROP CONSTRAINT IF EXISTS balance_records_system_check;

-- Add a new check constraint that includes "Carte"
ALTER TABLE balance_records ADD CONSTRAINT balance_records_system_check 
CHECK (system IN ('Top Travel Trip (TTP)', 'Accelaero (AR)', 'Carte'));