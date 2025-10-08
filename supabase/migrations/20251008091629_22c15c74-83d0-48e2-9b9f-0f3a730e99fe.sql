-- Create pelerins (pilgrims) table for Omra programs
CREATE TABLE public.pelerins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID NOT NULL REFERENCES public.omra_programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  contacts JSONB DEFAULT '[]'::jsonb,
  advance_payment NUMERIC DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pelerins ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "All authenticated users can view pelerins"
  ON public.pelerins
  FOR SELECT
  USING (true);

CREATE POLICY "Managers and super agents can insert pelerins"
  ON public.pelerins
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('manager', 'super_agent')
    )
    AND auth.uid() = created_by
  );

CREATE POLICY "Managers and super agents can update pelerins"
  ON public.pelerins
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('manager', 'super_agent')
    )
  );

CREATE POLICY "Managers and super agents can delete pelerins"
  ON public.pelerins
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('manager', 'super_agent')
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_pelerins_updated_at
  BEFORE UPDATE ON public.pelerins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();