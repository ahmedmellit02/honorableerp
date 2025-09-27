-- Create Omra management tables

-- Create hotels table
CREATE TABLE public.hotels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Saudi Arabia',
  star_rating INTEGER CHECK (star_rating >= 1 AND star_rating <= 5),
  distance_from_haram TEXT,
  price_per_night NUMERIC(10,2),
  description TEXT,
  amenities JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Create omra programs table
CREATE TABLE public.omra_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL,
  price_per_person NUMERIC(10,2) NOT NULL,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  departure_date DATE NOT NULL,
  return_date DATE NOT NULL,
  departure_city TEXT NOT NULL,
  hotels JSONB DEFAULT '[]'::jsonb, -- Array of hotel IDs with dates
  included_services JSONB DEFAULT '[]'::jsonb,
  excluded_services JSONB DEFAULT '[]'::jsonb,
  itinerary JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'full', 'cancelled', 'completed')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  updated_by UUID
);

-- Enable Row Level Security
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omra_programs ENABLE ROW LEVEL SECURITY;

-- Create policies for hotels table
CREATE POLICY "All authenticated users can view active hotels" 
ON public.hotels 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Managers and super agents can insert hotels" 
ON public.hotels 
FOR INSERT 
WITH CHECK (
  (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('manager', 'super_agent'))) 
  AND (auth.uid() = created_by)
);

CREATE POLICY "Managers and super agents can update hotels" 
ON public.hotels 
FOR UPDATE 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('manager', 'super_agent')));

-- Create policies for omra programs table
CREATE POLICY "All authenticated users can view active programs" 
ON public.omra_programs 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Managers and super agents can insert programs" 
ON public.omra_programs 
FOR INSERT 
WITH CHECK (
  (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('manager', 'super_agent'))) 
  AND (auth.uid() = created_by)
);

CREATE POLICY "Managers and super agents can update programs" 
ON public.omra_programs 
FOR UPDATE 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('manager', 'super_agent')));

-- Create triggers for updated_at
CREATE TRIGGER update_hotels_updated_at
BEFORE UPDATE ON public.hotels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_omra_programs_updated_at
BEFORE UPDATE ON public.omra_programs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();