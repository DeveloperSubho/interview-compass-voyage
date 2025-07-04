
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Plus, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import AddTopicModal from "@/components/AddTopicModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

interface Subcategory {
  id: string;
  name: string;
  description: string | null;
  pricing_tier: string | null;
  questionCount: number;
}

const CategorySection = () => {
  const navigate = useNavigate();
  const { categoryName } = useParams();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryId, setCategoryId] = useState<string>("");
  const [isAddSubcategoryModalOpen, setIsAddSubcategoryModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<Subcategory | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (categoryName) {
      fetchCategoryAndSubcategories();
    }
  }, [categoryName]);

  const fetchCategoryAndSubcategories = async () => {
    try {
      // First get the category by name
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', categoryName?.replace(/-/g, ' '))
        .single();

      if (categoryError) {
        console.error('Error fetching category:', categoryError);
        setSubcategories([]);
        setLoading(false);
        return;
      }

      if (!categoryData) {
        setSubcategories([]);
        setLoading(false);
        return;
      }

      setCategoryId(categoryData.id);

      // Then get subcategories for this category
      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', categoryData.id)
        .order('created_at', { ascending: false });

      if (subcategoriesError) {
        console.error('Error fetching subcategories:', subcategoriesError);
        setSubcategories([]);
        setLoading(false);
        return;
      }

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
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load subcategories",
        variant: "destructive",
      });
      setSubcategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubcategoryClick = (subcategoryName: string) => {
    navigate(`/questions/${categoryName}/${subcategoryName.toLowerCase().replace(/\s+/g, '-')}`);
  };

  const handleDeleteClick = (subcategory: Subcategory) => {
    setSubcategoryToDelete(subcategory);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!subcategoryToDelete) return;

    setDeleteLoading(true);
    try {
      // First delete all questions in this subcategory
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

      fetchCategoryAndSubcategories();
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

  const handleAddSubcategorySuccess = () => {
    setIsAddSubcategoryModalOpen(false);
    fetchCategoryAndSubcategories();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading subcategories...</p>
        </div>
      </div>
    );
  }

  return (
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent capitalize">
              {categoryName?.replace(/-/g, ' ')} Topics
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Choose a topic to start practicing questions and improve your skills.
            </p>
          </div>
          
          {isAdmin && (
            <Button onClick={() => setIsAddSubcategoryModalOpen(true)}>
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
              onClick={() => handleSubcategoryClick(subcategory.name)}
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
                  {subcategory.description || `Explore ${subcategory.name} questions and concepts`}
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

      <AddTopicModal
        isOpen={isAddSubcategoryModalOpen}
        onClose={() => setIsAddSubcategoryModalOpen(false)}
        onSuccess={handleAddSubcategorySuccess}
        type="subcategory"
        categoryId={categoryId}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSubcategoryToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Topic"
        description="Are you sure you want to delete this topic? This action will permanently delete the topic and all its related questions. This action cannot be undone."
        itemName={subcategoryToDelete?.name || ""}
        loading={deleteLoading}
      />
    </div>
  );
};

export default CategorySection;
