
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Plus, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AddTopicModal from "@/components/AddTopicModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Subcategory {
  id: string;
  name: string;
  description: string | null;
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
  const [loading, setLoading] = useState(true);
  const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<Subcategory | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (category) {
      fetchSubcategories();
    }
  }, [category]);

  const fetchSubcategories = async () => {
    try {
      // First, get the category by name
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('name', category)
        .single();

      if (categoryError) throw categoryError;

      // Then fetch subcategories for this category
      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', categoryData.id)
        .order('created_at', { ascending: false });

      if (subcategoriesError) throw subcategoriesError;

      // Get question counts for each subcategory
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

  const handleSubcategoryClick = (subcategory: Subcategory) => {
    if (!user) {
      onSignInClick();
    } else {
      navigate(`/questions/${category}/${subcategory.id}`);
    }
  };

  const handleDeleteClick = (subcategory: Subcategory) => {
    setSubcategoryToDelete(subcategory);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!subcategoryToDelete) return;

    setDeleteLoading(true);
    try {
      // Delete all questions in this subcategory first
      const { error: questionsError } = await supabase
        .from('questions')
        .delete()
        .eq('subcategory_id', subcategoryToDelete.id);

      if (questionsError) throw questionsError;

      // Then delete the subcategory
      const { error: subcategoryError } = await supabase
        .from('subcategories')
        .delete()
        .eq('id', subcategoryToDelete.id);

      if (subcategoryError) throw subcategoryError;

      toast({
        title: "Success",
        description: "Subcategory deleted successfully",
      });

      fetchSubcategories();
      setIsDeleteModalOpen(false);
      setSubcategoryToDelete(null);
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast({
        title: "Error",
        description: "Failed to delete subcategory",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAddTopicSuccess = () => {
    setIsAddTopicModalOpen(false);
    fetchSubcategories();
  };

  const categoryName = category?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading topics...</p>
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
            Back to Categories
          </Button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {categoryName} Questions
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Choose a {categoryName} topic to practice your knowledge and skills.
              </p>
            </div>
            
            {isAdmin && (
              <Button onClick={() => setIsAddTopicModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Topic
              </Button>
            )}
          </div>
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
                className="bg-card border-border hover:bg-accent/70 transition-all duration-300 hover:scale-105 cursor-pointer relative"
                onClick={() => handleSubcategoryClick(subcategory)}
              >
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 z-10 hover:bg-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(subcategory);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 bg-gradient-to-r from-[#555879] to-[#98A1BC] rounded-lg flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className="bg-blue-600 text-white">
                        {subcategory.questionCount} Questions
                      </Badge>
                      {subcategory.pricing_tier && (
                        <Badge className="bg-purple-600 text-white">
                          {subcategory.pricing_tier}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-foreground">{subcategory.name}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {subcategory.description || `Explore ${subcategory.name} topics and questions`}
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
        categoryName={categoryName}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSubcategoryToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Subcategory"
        description="Are you sure you want to delete this subcategory? This action will permanently delete the subcategory and all its related questions. This action cannot be undone."
        itemName={subcategoryToDelete?.name || ""}
        loading={deleteLoading}
      />

      <Footer />
    </div>
  );
};

export default CategorySection;
