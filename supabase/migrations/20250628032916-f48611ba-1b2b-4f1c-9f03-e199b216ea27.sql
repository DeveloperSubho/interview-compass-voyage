
-- First, drop the existing check constraint on questions.level
ALTER TABLE public.questions DROP CONSTRAINT IF EXISTS questions_level_check;

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  github_url TEXT,
  type TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'Explorer',
  technologies TEXT[] NOT NULL DEFAULT '{}',
  duration TEXT,
  key_features TEXT[] NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on projects table
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to projects
CREATE POLICY "Anyone can view projects" 
  ON public.projects 
  FOR SELECT 
  USING (true);

-- Create policy for admin insert access
CREATE POLICY "Admins can create projects" 
  ON public.projects 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Create policy for admin update access
CREATE POLICY "Admins can update projects" 
  ON public.projects 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Create policy for admin delete access
CREATE POLICY "Admins can delete projects" 
  ON public.projects 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Update questions table to change level values
UPDATE public.questions SET level = 'Explorer' WHERE level = 'Basic';
UPDATE public.questions SET level = 'Builder' WHERE level = 'Intermediate';
UPDATE public.questions SET level = 'Innovator' WHERE level = 'Advanced';

-- Add tier column to subcategories
ALTER TABLE public.subcategories ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'Explorer';

-- Add tier column to questions  
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'Explorer';

-- Update existing questions with tier based on level
UPDATE public.questions SET tier = level;

-- Add new check constraint with updated values
ALTER TABLE public.questions ADD CONSTRAINT questions_level_check CHECK (level IN ('Explorer', 'Builder', 'Innovator'));
