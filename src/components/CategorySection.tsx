
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AddTopicModal from "@/components/AddTopicModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Subcategory {
  id: string;
  name: string;
  description: string;
  pricing_tier: string | null;
  questionCount: number;
}

interface CategorySectionProps {
  onSignInClick: () => void;
}

const CategorySection = ({ onSignInClick }: CategorySectionProps) => {
  const { category } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState(false);

  useEffect(() => {
    if (category) {
      fetchSubcategories();
    }
  }, [category]);

  const fetchSubcategories = async () => {
    try {
      // First get category info
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .ilike('name', category?.replace('-', ' ') || '')
        .single();

      if (categoryError) throw categoryError;
      setCategoryInfo(categoryData);

      // Then get subcategories with question counts
      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', categoryData.id)
        .order('created_at', { ascending: false });

      if (subcategoriesError) throw subcategoriesError;

      const subcategoriesWithCounts = await Promise.all(
        (subcategoriesData || []).map(async (subcategory) => {
          const { count } = await supabase
            .from('questions')
            .select('*', { count: 'exact', head: true })
            .eq('subcategory_id', subcategory.id);

          return {
            ...subcategory,
            questionCount: count || 0
          };
        })
      );

      setSubcategories(subcategoriesWithCounts);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      toast({
        title: "Error",
        description: "Failed to load subcategories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubcategoryClick = (subcategoryId: string) => {
    if (!user) {
      onSignInClick();
    } else {
      navigate(`/questions/${category}/${subcategoryId}`);
    }
  };

  const handleAddTopicSuccess = () => {
    setIsAddTopicModalOpen(false);
    fetchSubcategories();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading subcategories...</p>
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
              {categoryInfo?.name || category?.replace('-', ' ')} Questions
            </h1>
            <p className="text-muted-foreground text-lg max-w-3xl">
              {categoryInfo?.description || `Explore ${category?.replace('-', ' ')} topics and questions`}
            </p>
          </div>
          
          {isAdmin && (
            <Button onClick={() => setIsAddTopicModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Topic
            </Button>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subcategories.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No topics available
              </h3>
              <p className="text-muted-foreground">
                Topics will be added soon for this category.
              </p>
            </div>
          ) : (
            subcategories.map((subcategory) => (
              <Card 
                key={subcategory.id} 
                className="bg-card border-border hover:bg-accent/70 transition-all duration-300 hover:scale-105 cursor-pointer"
                onClick={() => handleSubcategoryClick(subcategory.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 bg-gradient-to-r from-[#555879] to-[#98A1BC] rounded-lg flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <Badge className="bg-blue-600 text-white">
                      {subcategory.questionCount} Questions
                    </Badge>
                  </div>
                  <CardTitle className="text-foreground">{subcategory.name}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {subcategory.description || `Explore ${subcategory.name} questions`}
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

      <AddTopicModal
        isOpen={isAddTopicModalOpen}
        onClose={() => setIsAddTopicModalOpen(false)}
        onSuccess={handleAddTopicSuccess}
        type="subcategory"
        categoryId={categoryInfo?.id}
      />

      <Footer />
    </div>
  );
};

export default CategorySection;
