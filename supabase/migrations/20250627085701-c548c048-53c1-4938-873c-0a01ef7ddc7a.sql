
-- Create subcategories table for Java sub-sections
CREATE TABLE public.subcategories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  answer TEXT NOT NULL,
  type TEXT NOT NULL, -- Basic Java, Advanced Java, etc
  level TEXT CHECK (level IN ('Basic', 'Intermediate', 'Advanced')) NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Subcategories policies (public read, admin write)
CREATE POLICY "Anyone can view subcategories" ON public.subcategories
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage subcategories" ON public.subcategories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Questions policies (public read, admin write)
CREATE POLICY "Anyone can view questions" ON public.questions
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage questions" ON public.questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Insert Java subcategories
INSERT INTO public.subcategories (category_id, name, description) 
SELECT id, 'Basic Java', 'Fundamentals of Java programming language'
FROM public.categories WHERE name = 'Java';

INSERT INTO public.subcategories (category_id, name, description) 
SELECT id, 'Collection Framework', 'Java Collections API and data structures'
FROM public.categories WHERE name = 'Java';

INSERT INTO public.subcategories (category_id, name, description) 
SELECT id, 'Errors and Exception', 'Exception handling and error management'
FROM public.categories WHERE name = 'Java';

INSERT INTO public.subcategories (category_id, name, description) 
SELECT id, 'JPA JDBC Hibernate', 'Database connectivity and ORM frameworks'
FROM public.categories WHERE name = 'Java';

INSERT INTO public.subcategories (category_id, name, description) 
SELECT id, 'Java Versions', 'Features across different Java versions'
FROM public.categories WHERE name = 'Java';

INSERT INTO public.subcategories (category_id, name, description) 
SELECT id, 'Unit Testing', 'Testing frameworks and best practices'
FROM public.categories WHERE name = 'Java';

INSERT INTO public.subcategories (category_id, name, description) 
SELECT id, 'Advanced Java', 'Advanced Java concepts and features'
FROM public.categories WHERE name = 'Java';

INSERT INTO public.subcategories (category_id, name, description) 
SELECT id, 'Asynchronous Programming', 'Concurrent and parallel programming'
FROM public.categories WHERE name = 'Java';

-- Insert sample questions for Basic Java
INSERT INTO public.questions (subcategory_id, title, content, answer, type, level, created_by)
SELECT 
  s.id,
  'What is Java?',
  'Explain what Java is and its key characteristics.',
  'Java is a high-level, object-oriented programming language developed by Sun Microsystems (now Oracle). Key characteristics include:

## Platform Independence
Java code is compiled into bytecode that runs on the Java Virtual Machine (JVM), making it platform-independent ("Write Once, Run Anywhere").

## Object-Oriented
Java follows OOP principles like encapsulation, inheritance, and polymorphism.

## Memory Management
Automatic garbage collection handles memory management.

## Security
Built-in security features and sandbox execution environment.

## Multithreading
Native support for concurrent programming.

## Rich API
Extensive standard library for various programming needs.',
  'Basic Java',
  'Basic',
  (SELECT id FROM auth.users LIMIT 1)
FROM public.subcategories s 
WHERE s.name = 'Basic Java';

INSERT INTO public.questions (subcategory_id, title, content, answer, type, level, created_by)
SELECT 
  s.id,
  'Difference between == and === in Java',
  'Explain the difference between == and === operators in Java.',
  'Actually, Java only has the == operator. There is no === operator in Java (that exists in JavaScript).

## == Operator in Java

The == operator in Java works differently for primitives and objects:

### For Primitives
```java
int a = 5;
int b = 5;
System.out.println(a == b); // true - compares values
```

### For Objects
```java
String str1 = new String("Hello");
String str2 = new String("Hello");
System.out.println(str1 == str2); // false - compares references

// Use .equals() for content comparison
System.out.println(str1.equals(str2)); // true - compares content
```

## Key Points
- == compares references for objects, values for primitives
- Use .equals() method for object content comparison
- String literals are interned, so == might work for string literals but not for new String() objects',
  'Basic Java',
  'Basic',
  (SELECT id FROM auth.users LIMIT 1)
FROM public.subcategories s 
WHERE s.name = 'Basic Java';
