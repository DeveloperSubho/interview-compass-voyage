import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AddTopicModal from "@/components/AddTopicModal";
import AuthModal from "@/components/AuthModal";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  description: string | null;
  tier: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const Questions = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const formattedName = categoryName.toLowerCase().replace(/\s+/g, '-');
    if (categoryName === "Java") {
      navigate(`/java-subcategories`);
    } else {
      navigate(`/categories/${formattedName}`);
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!isAdmin) return;
    
    if (!confirm(`Are you sure you want to delete the "${categoryName}" category? This will also delete all subcategories and questions related to this category.`)) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Category deleted successfully",
      });

      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const getTierColor = (tier: string | null) => {
    switch (tier) {
      case "Voyager":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "Innovator":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      case "Explorer":
      default:
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    }
  };

  const handleAddCategorySuccess = () => {
    setIsAddCategoryModalOpen(false);
    fetchCategories();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading categories...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-16">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Explore Interview Questions
            </h1>
            <p className="text-muted-foreground text-xl max-w-3xl">
              Sharpen your skills with our curated questions across various domains. Each category is designed to help you master key concepts and techniques.
            </p>
          </div>
          
          {isAdmin && (
            <Button onClick={() => setIsAddCategoryModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {categories.map((category) => (
            <Card 
              key={category.id}
              className="bg-card border-border hover:bg-accent/70 transition-all duration-300 cursor-pointer group relative"
              onClick={() => handleCategoryClick(category.name)}
            >
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCategory(category.id, category.name);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">
                    {category.name === "Java" ? "☕" : 
                     category.name === "Spring & Spring Boot" ? "🌱" :
                     category.name === "System Design" ? "🏗️" :
                     category.name === "Design Patterns" ? "🎨" :
                     category.name === "ReactJS" ? "⚛️" :
                     category.name === "Message Queues" ? "📬" : "💼"}
                  </div>
                  <Badge className={`${getTierColor(category.tier)} border`}>
                    0 Questions
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-bold text-foreground group-hover:text-blue-400 transition-colors">
                  {category.name}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {category.description || `${category.name} concepts and interview questions`}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <span className="mr-2">📚</span>
                  Start Practicing
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {isAdmin && (
        <AddTopicModal
          isOpen={isAddCategoryModalOpen}
          onClose={() => setIsAddCategoryModalOpen(false)}
          onSuccess={handleAddCategorySuccess}
          type="category"
        />
      )}

      <Footer />
    </div>
  );
};

export default Questions;
