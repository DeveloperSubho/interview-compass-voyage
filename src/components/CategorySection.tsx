
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Upload, BookOpen, Lock, ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import AddTopicModal from "./AddTopicModal";
import BulkImportModal from "./BulkImportModal";
import ProtectedContent from "./ProtectedContent";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface Category {
  id: string;
  name: string;
  description: string | null;
  tier: string | null;
}

interface Subcategory {
  id: string;
  name: string;
  description: string | null;
  tier: string | null;
  category_id: string | null;
}

interface Question {
  id: string;
  title: string;
  tier: string | null;
  level: string;
  type: string;
  subcategory_id: string | null;
}

interface CategorySectionProps {
  onSignInClick: () => void;
}

const CategorySection = ({ onSignInClick }: CategorySectionProps) => {
  const { isAdmin, hasAccess } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { category } = useParams();
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);

  useEffect(() => {
    if (category) {
      fetchCategoryData();
    }
  }, [category]);

  const fetchCategoryData = async () => {
    setLoading(true);
    try {
      const categoryName = category?.replace(/-/g, ' ') || '';
      console.log('Searching for category:', categoryName);
      
      // Try multiple approaches to find the category
      let categoryData = null;
      
      // 1. Try case-insensitive search
      const { data: ilikeCategoryData, error: ilikeError } = await supabase
        .from('categories')
        .select('*')
        .ilike('name', categoryName)
        .single();

      if (!ilikeError && ilikeCategoryData) {
        categoryData = ilikeCategoryData;
      } else {
        // 2. Try exact match
        const { data: exactCategoryData, error: exactError } = await supabase
          .from('categories')
          .select('*')
          .eq('name', categoryName)
          .single();

        if (!exactError && exactCategoryData) {
          categoryData = exactCategoryData;
        } else {
          // 3. Try with capitalized name
          const capitalizedName = categoryName.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ');
          
          const { data: capitalizedCategoryData, error: capitalizedError } = await supabase
            .from('categories')
            .select('*')
            .eq('name', capitalizedName)
            .single();

          if (!capitalizedError && capitalizedCategoryData) {
            categoryData = capitalizedCategoryData;
          }
        }
      }

      if (!categoryData) {
        console.error("Category not found:", categoryName);
        toast({
          title: "Error",
          description: "Category not found",
          variant: "destructive",
        });
        return;
      }

      console.log('Found category:', categoryData);
      setCurrentCategory(categoryData);

      // Fetch subcategories for this category
      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', categoryData.id)
        .order('created_at', { ascending: false });

      if (subcategoriesError) throw subcategoriesError;
      console.log('Found subcategories:', subcategoriesData);
      setSubcategories(subcategoriesData || []);

      // Fetch questions for all subcategories
      if (subcategoriesData && subcategoriesData.length > 0) {
        const subcategoryIds = subcategoriesData.map(sub => sub.id);
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .in('subcategory_id', subcategoryIds);

        if (questionsError) throw questionsError;
        setQuestions(questionsData || []);
      }
    } catch (error) {
      console.error("Error fetching category data:", error);
      toast({
        title: "Error",
        description: "Failed to load category data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setIsAddTopicModalOpen(false);
    setIsBulkImportModalOpen(false);
    fetchCategoryData();
  };

  const getQuestionCount = (subcategoryId: string) => {
    return questions.filter(q => q.subcategory_id === subcategoryId).length;
  };

  const canAccessContent = (tier: string | null) => {
    if (!tier) return true;
    return isAdmin || hasAccess(tier);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!currentCategory) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
            <Button onClick={() => navigate('/questions')}>
              Back to Questions
            </Button>
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
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/questions")}
            className="text-muted-foreground hover:text-foreground hover:bg-accent mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Questions
          </Button>
          
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent capitalize">
              {currentCategory.name} Questions
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {currentCategory.description || `Explore ${currentCategory.name} topics and questions`}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {isAdmin && (
            <div className="flex gap-2">
              <Button onClick={() => setIsAddTopicModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Subcategory
              </Button>
              <Button variant="outline" onClick={() => setIsBulkImportModalOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Bulk Import
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subcategories.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No subcategories available
                </h3>
                <p className="text-muted-foreground">
                  Subcategories for {currentCategory.name} will be added soon.
                </p>
              </div>
            ) : (
              subcategories.map((subcategory) => {
                const questionCount = getQuestionCount(subcategory.id);
                const requiresUpgrade = subcategory.tier && !canAccessContent(subcategory.tier);

                return (
                  <Card key={subcategory.id} className={`hover:shadow-lg transition-shadow ${requiresUpgrade ? 'opacity-75' : ''}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            {subcategory.name}
                            {requiresUpgrade && <Lock className="h-4 w-4 text-muted-foreground" />}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {subcategory.description || "Explore various topics and questions"}
                          </CardDescription>
                        </div>
                        {subcategory.tier && (
                          <Badge variant={requiresUpgrade ? "secondary" : "default"}>
                            {subcategory.tier}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {questionCount} questions
                        </div>
                        
                        <ProtectedContent 
                          requiredTier={subcategory.tier || undefined}
                          onSignInClick={onSignInClick}
                          showUpgradeMessage={true}
                        >
                          <Link 
                            to={`/questions/${category}/${subcategory.id}`}
                            className="block"
                          >
                            <Button className="w-full">
                              Explore {subcategory.name}
                            </Button>
                          </Link>
                        </ProtectedContent>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        <AddTopicModal
          isOpen={isAddTopicModalOpen}
          onClose={() => setIsAddTopicModalOpen(false)}
          onSuccess={handleSuccess}
          type="subcategory"
          categoryId={currentCategory.id}
        />

        <BulkImportModal
          isOpen={isBulkImportModalOpen}
          onClose={() => setIsBulkImportModalOpen(false)}
          onSuccess={handleSuccess}
        />
      </div>
      
      <Footer />
    </div>
  );
};

export default CategorySection;
