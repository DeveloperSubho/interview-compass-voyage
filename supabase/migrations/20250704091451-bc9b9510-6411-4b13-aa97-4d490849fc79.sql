
-- Create system_design_problems table with correct structure
CREATE TABLE public.system_design_problems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  requirement_discussion TEXT,
  solution TEXT,
  design_image TEXT,
  video_link TEXT,
  github_link TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  difficulty TEXT NOT NULL DEFAULT 'Easy' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  pricing_tier TEXT NOT NULL DEFAULT 'Explorer' CHECK (pricing_tier IN ('Explorer', 'Builder', 'Innovator')),
  status TEXT NOT NULL DEFAULT 'Published' CHECK (status IN ('Published', 'Draft')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.system_design_problems ENABLE ROW LEVEL SECURITY;

-- Create policies for system_design_problems
CREATE POLICY "Anyone can view published system design problems" 
  ON public.system_design_problems 
  FOR SELECT 
  USING (status = 'Published');

CREATE POLICY "Admins can manage system design problems" 
  ON public.system_design_problems 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- Create indexes for better performance
CREATE INDEX idx_system_design_problems_difficulty ON public.system_design_problems(difficulty);
CREATE INDEX idx_system_design_problems_pricing_tier ON public.system_design_problems(pricing_tier);
CREATE INDEX idx_system_design_problems_tags ON public.system_design_problems USING GIN(tags);
CREATE INDEX idx_system_design_problems_status ON public.system_design_problems(status);
