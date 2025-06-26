
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  tier TEXT CHECK (tier IN ('Explorer', 'Builder', 'Innovator')) DEFAULT 'Explorer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pages table for storing content
CREATE TABLE public.pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  difficulty TEXT CHECK (difficulty IN ('Basic', 'Intermediate', 'Advanced')),
  tier TEXT CHECK (tier IN ('Explorer', 'Builder', 'Innovator')) DEFAULT 'Explorer',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT CHECK (tier IN ('Explorer', 'Builder', 'Innovator')) DEFAULT 'Explorer',
  status TEXT CHECK (status IN ('active', 'inactive', 'cancelled')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories policies (public read, admin write)
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage categories" ON public.categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Pages policies (public read based on tier, admin write)
CREATE POLICY "Anyone can view pages" ON public.pages
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage pages" ON public.pages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- User subscriptions policies
CREATE POLICY "Users can view their own subscription" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" ON public.user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription" ON public.user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, first_name, last_name)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  );
  
  -- Create default Explorer subscription
  INSERT INTO public.user_subscriptions (user_id, tier)
  VALUES (new.id, 'Explorer');
  
  RETURN new;
END;
$$;

-- Trigger to automatically create profile and subscription on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert default admin user profile (will be created when admin signs up)
-- Insert default categories
INSERT INTO public.categories (name, description, tier) VALUES
  ('Java', 'Core Java concepts, OOP, collections, multithreading', 'Explorer'),
  ('Spring & Spring Boot', 'Framework concepts, dependency injection, REST APIs', 'Builder'),
  ('System Design', 'Scalability, architecture patterns, distributed systems', 'Builder'),
  ('Design Patterns', 'Common patterns, implementation strategies', 'Innovator'),
  ('ReactJS', 'Component lifecycle, hooks, state management', 'Explorer'),
  ('Message Queues', 'Apache Kafka, RabbitMQ, event-driven architecture', 'Innovator'),
  ('Cloud', 'AWS, Azure, microservices, containerization', 'Builder');

-- Insert sample pages
INSERT INTO public.pages (category_id, title, content, difficulty, tier) VALUES
  ((SELECT id FROM public.categories WHERE name = 'Java'), 'What is Java?', 'Java is a high-level, object-oriented programming language...', 'Basic', 'Explorer'),
  ((SELECT id FROM public.categories WHERE name = 'Java'), 'Java Collections Framework', 'The Java Collections Framework provides...', 'Intermediate', 'Explorer'),
  ((SELECT id FROM public.categories WHERE name = 'Spring & Spring Boot'), 'Introduction to Spring Boot', 'Spring Boot is a framework that...', 'Intermediate', 'Builder'),
  ((SELECT id FROM public.categories WHERE name = 'System Design'), 'Load Balancing Concepts', 'Load balancing is the process of...', 'Advanced', 'Builder');
