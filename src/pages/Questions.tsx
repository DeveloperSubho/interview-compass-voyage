
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Code, Database, Globe, Layers, Server, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  questionCount: number;
  icon: string;
}

const Questions = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [categories, setCategories] = useState<Category[]>([
    {
      id: "1",
      name: "JavaScript",
      description: "Master the fundamentals and advanced concepts of JavaScript.",
      image: "/javascript.png",
      questionCount: 150,
      icon: "Code"
    },
    {
      id: "2",
      name: "React",
      description: "Dive deep into React and build interactive user interfaces.",
      image: "/react.png",
      questionCount: 120,
      icon: "Layers"
    },
    {
      id: "3",
      name: "Java",
      description: "Explore Java programming with questions on core concepts and frameworks.",
      image: "/java.png",
      questionCount: 200,
      icon: "Code"
    },
    {
      id: "4",
      name: "Python",
      description: "Enhance your Python skills with questions covering data structures and algorithms.",
      image: "/python.png",
      questionCount: 180,
      icon: "Zap"
    },
    {
      id: "5",
      name: "Data Structures",
      description: "Strengthen your understanding of data structures and algorithms.",
      image: "/datastructure.png",
      questionCount: 220,
      icon: "Database"
    },
    {
      id: "6",
      name: "System Design",
      description: "Learn how to design scalable and robust systems.",
      image: "/systemdesign.png",
      questionCount: 100,
      icon: "Server"
    },
  ]);
  const [loading, setLoading] = useState(true);

  const iconMap = {
    Code,
    Layers, 
    Database,
    Globe,
    Server,
    Zap
  };

  useEffect(() => {
    fetchCategoriesWithCounts();
  }, []);

  const fetchCategoriesWithCounts = async () => {
    try {
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          if (category.name === 'Java') {
            // Get Java subcategories and their question counts
            const { data: javaCategory } = await supabase
              .from('categories')
              .select('id')
              .eq('name', 'Java')
              .single();

            if (javaCategory) {
              const { data: subcategories } = await supabase
                .from('subcategories')
                .select('id')
                .eq('category_id', javaCategory.id);

              if (subcategories && subcategories.length > 0) {
                const subcategoryIds = subcategories.map(sub => sub.id);
                const { count } = await supabase
                  .from('questions')
                  .select('*', { count: 'exact', head: true })
                  .in('subcategory_id', subcategoryIds);

                return {
                  ...category,
                  questionCount: count || 0
                };
              }
            }
          }
          
          return {
            ...category,
            questionCount: category.questionCount
          };
        })
      );

      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error('Error fetching categories with counts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    if (categoryName === "Java") {
      navigate("/questions/java");
    } else {
      navigate(`/questions/${categoryName}`);
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Code;
    return <IconComponent className="h-6 w-6 text-white" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 dark:bg-slate-900 text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-4 text-slate-400">Loading categories...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 dark:bg-slate-900 text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Explore Interview Questions
        </h1>
        <p className="text-slate-400 text-lg max-w-3xl mb-12">
          Sharpen your skills with our curated questions across various domains. Each category is designed to help you master key concepts and techniques.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card 
              key={category.id} 
              className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105 cursor-pointer"
              onClick={() => handleCategoryClick(category.name)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 bg-gradient-to-r from-[#555879] to-[#98A1BC] rounded-lg flex items-center justify-center">
                    {getIcon(category.icon)}
                  </div>
                  <Badge className="bg-blue-600 text-white">
                    {category.questionCount} Questions
                  </Badge>
                </div>
                <CardTitle className="text-white">{category.name}</CardTitle>
                <CardDescription className="text-slate-400">
                  {category.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Start Practicing
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Questions;
