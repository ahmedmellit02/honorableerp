-- Create CRM tables for HonorableCRM system

-- Create enums for CRM
CREATE TYPE public.prospect_status AS ENUM ('new', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost');
CREATE TYPE public.prospect_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.activity_type AS ENUM ('call', 'email', 'meeting', 'note', 'quote_sent', 'follow_up');
CREATE TYPE public.quote_status AS ENUM ('draft', 'sent', 'accepted', 'rejected', 'expired');

-- Create prospects table
CREATE TABLE public.prospects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  assigned_to UUID,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  source TEXT,
  status prospect_status NOT NULL DEFAULT 'new',
  priority prospect_priority NOT NULL DEFAULT 'medium',
  budget_range TEXT,
  travel_preferences JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on prospects
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for prospects
CREATE POLICY "Users can view prospects based on role"
ON public.prospects FOR SELECT
USING (
  -- Managers and cashiers can see all prospects
  (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) IN ('manager', 'cashier') OR
  -- Super agents and agents can see their assigned prospects or ones they created
  (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) IN ('super_agent', 'agent') AND 
  (assigned_to = auth.uid() OR user_id = auth.uid()) OR
  -- Suppliers can see prospects related to their services (simplified for now)
  (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) IN ('supplier_accelaero', 'supplier_ttp')
);

CREATE POLICY "Users can insert prospects based on role"
ON public.prospects FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) IN ('manager', 'cashier', 'super_agent', 'agent')
);

CREATE POLICY "Users can update prospects based on role"
ON public.prospects FOR UPDATE
USING (
  -- Managers and cashiers can update all prospects
  (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) IN ('manager', 'cashier') OR
  -- Others can update their assigned prospects or ones they created
  (assigned_to = auth.uid() OR user_id = auth.uid())
);

-- Create activities table
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  type activity_type NOT NULL,
  subject TEXT,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on activities
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for activities
CREATE POLICY "Users can view activities for accessible prospects"
ON public.activities FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.prospects p 
    WHERE p.id = prospect_id AND (
      -- Managers and cashiers can see all
      (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) IN ('manager', 'cashier') OR
      -- Others can see activities for their accessible prospects
      p.assigned_to = auth.uid() OR p.user_id = auth.uid() OR
      -- Suppliers can see activities for their prospects
      (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) IN ('supplier_accelaero', 'supplier_ttp')
    )
  )
);

CREATE POLICY "Users can insert activities for accessible prospects"
ON public.activities FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.prospects p 
    WHERE p.id = prospect_id AND (
      (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) IN ('manager', 'cashier') OR
      p.assigned_to = auth.uid() OR p.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update their own activities"
ON public.activities FOR UPDATE
USING (auth.uid() = user_id);

-- Create quotes table
CREATE TABLE public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  quote_number TEXT UNIQUE NOT NULL,
  service_type TEXT,
  destination TEXT,
  departure_date DATE,
  return_date DATE,
  passengers_count INTEGER DEFAULT 1,
  total_amount NUMERIC(10,2),
  status quote_status NOT NULL DEFAULT 'draft',
  valid_until DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on quotes
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for quotes
CREATE POLICY "Users can view quotes for accessible prospects"
ON public.quotes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.prospects p 
    WHERE p.id = prospect_id AND (
      (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) IN ('manager', 'cashier') OR
      p.assigned_to = auth.uid() OR p.user_id = auth.uid() OR
      (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) IN ('supplier_accelaero', 'supplier_ttp')
    )
  )
);

CREATE POLICY "Users can insert quotes for accessible prospects"
ON public.quotes FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.prospects p 
    WHERE p.id = prospect_id AND (
      (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) IN ('manager', 'cashier') OR
      p.assigned_to = auth.uid() OR p.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update their own quotes"
ON public.quotes FOR UPDATE
USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_prospects_updated_at
  BEFORE UPDATE ON public.prospects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate unique quote numbers
CREATE OR REPLACE FUNCTION public.generate_quote_number()
RETURNS TEXT AS $$
DECLARE
  quote_num TEXT;
BEGIN
  -- Generate quote number format: Q-YYYY-NNNN
  SELECT 'Q-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD((COUNT(*) + 1)::TEXT, 4, '0')
  INTO quote_num
  FROM public.quotes
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  
  RETURN quote_num;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-generate quote numbers
CREATE OR REPLACE FUNCTION public.set_quote_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quote_number IS NULL OR NEW.quote_number = '' THEN
    NEW.quote_number := public.generate_quote_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_quote_number_trigger
  BEFORE INSERT ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_quote_number();

-- Create indexes for better performance
CREATE INDEX idx_prospects_assigned_to ON public.prospects(assigned_to);
CREATE INDEX idx_prospects_status ON public.prospects(status);
CREATE INDEX idx_prospects_created_at ON public.prospects(created_at);
CREATE INDEX idx_activities_prospect_id ON public.activities(prospect_id);
CREATE INDEX idx_activities_user_id ON public.activities(user_id);
CREATE INDEX idx_activities_scheduled_at ON public.activities(scheduled_at);
CREATE INDEX idx_quotes_prospect_id ON public.quotes(prospect_id);
CREATE INDEX idx_quotes_status ON public.quotes(status);