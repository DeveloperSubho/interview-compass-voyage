
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Code, Database, Globe, Layers, Server, Zap, Plus, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import AddTopicModal from "@/components/AddTopicModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  description: string;
  pricing_tier: string | null;
  questionCount: number;
  icon: string;
}

const Questions = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const iconMap = {
    Code,
    Layers, 
    Database,
    Globe,
    Server,
    Zap
  };

  const getDefaultIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('javascript')) return 'Code';
    if (name.includes('react')) return 'Layers';
    if (name.includes('java')) return 'Code';
    if (name.includes('python')) return 'Zap';
    if (name.includes('data')) return 'Database';
    if (name.includes('system')) return 'Server';
    return 'Code';
  };

  useEffect(() => {
    fetchCategoriesWithCounts();
  }, []);

  const fetchCategoriesWithCounts = async () => {
    try {
      const { data: dbCategories, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const categoriesWithCounts = await Promise.all(
        (dbCategories || []).map(async (category) => {
          const { data: subcategories } = await supabase
            .from('subcategories')
            .select('id')
            .eq('category_id', category.id);

          let questionCount = 0;
          if (subcategories && subcategories.length > 0) {
            const subcategoryIds = subcategories.map(sub => sub.id);
            const { count } = await supabase
              .from('questions')
              .select('*', { count: 'exact', head: true })
              .in('subcategory_id', subcategoryIds);

            questionCount = count || 0;
          }
          
          return {
            ...category,
            questionCount,
            icon: getDefaultIcon(category.name)
          };
        })
      );

      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error('Error fetching categories with counts:', error);
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
    } else {
      navigate(`/questions/${categoryName.toLowerCase().replace(/\s+/g, '-')}`);
    }
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    setDeleteLoading(true);
    try {
      // First get all subcategories for this category
      const { data: subcategories } = await supabase
        .from('subcategories')
        .select('id')
        .eq('category_id', categoryToDelete.id);

      if (subcategories && subcategories.length > 0) {
        const subcategoryIds = subcategories.map(sub => sub.id);
        
        // Delete all questions in these subcategories
        const { error: questionsError } = await supabase
          .from('questions')
          .delete()
          .in('subcategory_id', subcategoryIds);

        if (questionsError) throw questionsError;

        // Delete all subcategories
        const { error: subcategoriesError } = await supabase
          .from('subcategories')
          .delete()
          .eq('category_id', categoryToDelete.id);

        if (subcategoriesError) throw subcategoriesError;
      }

      // Finally delete the category
      const { error: categoryError } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryToDelete.id);

      if (categoryError) throw categoryError;

      toast({
        title: "Success",
        description: "Category deleted successfully",
      });

      fetchCategoriesWithCounts();
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Code;
    return <IconComponent className="h-6 w-6 text-white" />;
  };

  const handleAddCategorySuccess = () => {
    setIsAddCategoryModalOpen(false);
    fetchCategoriesWithCounts();
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Explore Interview Questions
            </h1>
            <p className="text-muted-foreground text-lg max-w-3xl">
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No categories available
              </h3>
              <p className="text-muted-foreground">
                Categories will be added soon.
              </p>
            </div>
          ) : (
            categories.map((category) => (
              <Card 
                key={category.id} 
                className="bg-card border-border hover:bg-accent/70 transition-all duration-300 hover:scale-105 cursor-pointer relative"
                onClick={() => handleCategoryClick(category.name)}
              >
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 z-10 hover:bg-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(category);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 bg-gradient-to-r from-[#555879] to-[#98A1BC] rounded-lg flex items-center justify-center">
                      {getIcon(category.icon)}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className="bg-blue-600 text-white">
                        {category.questionCount} Questions
                      </Badge>
                      {category.pricing_tier && (
                        <Badge className="bg-purple-600 text-white">
                          {category.pricing_tier}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-foreground">{category.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {category.description || `Explore ${category.title} topics and questions`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Start Practicing
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <AddTopicModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onSuccess={handleAddCategorySuccess}
        type="category"
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action will permanently delete the category and all its related subcategories and questions. This action cannot be undone."
        itemName={categoryToDelete?.name || ""}
        loading={deleteLoading}
      />

      <Footer />
    </div>
  );
};

export default Questions;
