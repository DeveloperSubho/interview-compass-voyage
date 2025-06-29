
-- Create coding_questions table
CREATE TABLE public.coding_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  solution TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  status TEXT NOT NULL DEFAULT 'Unsolved' CHECK (status IN ('Unsolved', 'Solved', 'In Progress')),
  category TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  github_link TEXT,
  video_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_paid BOOLEAN NOT NULL DEFAULT false,
  level_unlock TEXT NOT NULL DEFAULT 'Beginner' CHECK (level_unlock IN ('Beginner', 'Intermediate', 'Expert'))
);

-- Create indexes for performance on searchable/filterable fields
CREATE INDEX idx_coding_questions_difficulty ON public.coding_questions (difficulty);
CREATE INDEX idx_coding_questions_category ON public.coding_questions (category);
CREATE INDEX idx_coding_questions_status ON public.coding_questions (status);
CREATE INDEX idx_coding_questions_is_paid ON public.coding_questions (is_paid);
CREATE INDEX idx_coding_questions_level_unlock ON public.coding_questions (level_unlock);
CREATE INDEX idx_coding_questions_tags ON public.coding_questions USING GIN (tags);
CREATE INDEX idx_coding_questions_title ON public.coding_questions (title);
CREATE INDEX idx_coding_questions_created_at ON public.coding_questions (created_at);

-- Add Row Level Security (RLS)
ALTER TABLE public.coding_questions ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (users can view all questions)
CREATE POLICY "Anyone can view coding questions" 
  ON public.coding_questions 
  FOR SELECT 
  USING (true);

-- Create policy for admin insert
CREATE POLICY "Admins can create coding questions" 
  ON public.coding_questions 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Create policy for admin update
CREATE POLICY "Admins can update coding questions" 
  ON public.coding_questions 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Create policy for admin delete
CREATE POLICY "Admins can delete coding questions" 
  ON public.coding_questions 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Create coding_categories table for admin-managed categories
CREATE TABLE public.coding_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS for coding_categories
ALTER TABLE public.coding_categories ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to categories
CREATE POLICY "Anyone can view coding categories" 
  ON public.coding_categories 
  FOR SELECT 
  USING (true);

-- Create policy for admin management of categories
CREATE POLICY "Admins can manage coding categories" 
  ON public.coding_categories 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Insert some default categories
INSERT INTO public.coding_categories (name, description) VALUES
  ('Basic', 'Fundamental programming problems'),
  ('Advanced', 'Complex algorithmic challenges'),
  ('Leetcode', 'Popular Leetcode-style problems'),
  ('Array', 'Array manipulation problems'),
  ('String', 'String processing problems'),
  ('Dynamic Programming', 'DP-based solutions');
