-- Update sale #8502 to #8501 to remove the gap
UPDATE sales 
SET numeric_id = 8501 
WHERE numeric_id = 8502;