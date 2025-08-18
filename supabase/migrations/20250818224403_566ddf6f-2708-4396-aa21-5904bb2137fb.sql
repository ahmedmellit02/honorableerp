-- Add new enum values (must be in separate transaction from usage)
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'manager';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'super_agent';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'supplier_accelaero';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'supplier_ttp';