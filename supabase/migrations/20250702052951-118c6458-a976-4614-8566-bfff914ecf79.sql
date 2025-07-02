
-- Add mobile phone field to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add pricing tier column to coding_questions table
ALTER TABLE public.coding_questions ADD COLUMN IF NOT EXISTS pricing_tier TEXT NOT NULL DEFAULT 'Explorer';

-- Add constraint to ensure valid pricing tiers
ALTER TABLE public.coding_questions ADD CONSTRAINT valid_pricing_tier 
CHECK (pricing_tier IN ('Explorer', 'Voyager', 'Innovator'));

-- Add tier column to projects table if it doesn't exist
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS pricing_tier TEXT NOT NULL DEFAULT 'Explorer';

-- Add constraint to ensure valid pricing tiers for projects
ALTER TABLE public.projects ADD CONSTRAINT valid_project_pricing_tier 
CHECK (pricing_tier IN ('Explorer', 'Voyager', 'Innovator'));

-- Create index for better performance on pricing tier queries
CREATE INDEX IF NOT EXISTS idx_coding_questions_pricing_tier ON public.coding_questions(pricing_tier);
CREATE INDEX IF NOT EXISTS idx_projects_pricing_tier ON public.projects(pricing_tier);

-- Update existing coding questions to have proper pricing tiers based on difficulty
UPDATE public.coding_questions 
SET pricing_tier = CASE 
  WHEN difficulty = 'Easy' THEN 'Explorer'
  WHEN difficulty = 'Medium' THEN 'Voyager'
  WHEN difficulty = 'Hard' THEN 'Innovator'
  ELSE 'Explorer'
END
WHERE pricing_tier = 'Explorer';

-- Update existing projects to have proper pricing tiers based on level
UPDATE public.projects 
SET pricing_tier = CASE 
  WHEN level = 'Explorer' THEN 'Explorer'
  WHEN level = 'Voyager' THEN 'Voyager'
  WHEN level = 'Innovator' THEN 'Innovator'
  ELSE 'Explorer'
END
WHERE pricing_tier = 'Explorer';
