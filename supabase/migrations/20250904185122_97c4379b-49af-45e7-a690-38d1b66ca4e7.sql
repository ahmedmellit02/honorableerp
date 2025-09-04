-- Fix balance record for sale #8357 - change system from TTP to AR
UPDATE public.balance_records 
SET system = 'Accelaero (AR)'
WHERE id = '50862409-636c-4cec-9536-61fdbeed1834' 
  AND description = 'Automatic deduction for sale #8357 - FPUAD ENNACIRI';