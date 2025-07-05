import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Plus, Trash2, Edit, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import AddTopicModal from "@/components/AddTopicModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

interface Subcategory {
  id: string;
  name: string;
  description: string;
  tier: string;
  title: string;
  category_id: string;
  created_at: string;
  updated_at: string;
  questionCount?: number;
}

const CategorySection = () => {
  const navigate = useNavigate();
  const { category } = useParams();
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
    if (category) {
      fetchCategoryAndSubcategories();
    }
  }, [category]);

  const fetchCategoryAndSubcategories = async () => {
    try {
      // First get the category by name
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', category)
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

  const fetchSubcategories = async () => {
    if (!category) return;
    
    try {
      setLoading(true);
      
      // Fetch subcategories for this category
      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', categoryData?.id || '');

      if (subcategoriesError) throw subcategoriesError;

      // If no subcategories found, show message instead of error
      if (!subcategoriesData || subcategoriesData.length === 0) {
        setSubcategories([]);
        return;
      }

      // Count questions for each subcategory
      const subcategoriesWithCount = await Promise.all(
        subcategoriesData.map(async (subcategory) => {
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

      setSubcategories(subcategoriesWithCount);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      // Don't show error toast, just set empty array
      setSubcategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubcategoryClick = (subcategoryName: string) => {
    navigate(`/questions/${category}/${subcategoryName}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, subcategory: Subcategory) => {
    e.stopPropagation();
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

  const handleAddSubcategory = () => {
    if (!categoryData) return;
    setSelectedSubcategory(undefined);
    setIsTopicModalOpen(true);
  };

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

  if (!categoryData) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-muted-foreground mb-4">Category Not Found</h2>
            <Button onClick={() => navigate('/questions')}>
              Back to Categories
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate('/questions')}
              className="text-muted-foreground hover:text-foreground hover:bg-accent mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Categories
            </Button>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {categoryData.title || categoryData.name}
            </h1>
            <p className="text-muted-foreground text-lg max-w-3xl">
              {categoryData.description}
            </p>
          </div>
          
          {isAdmin && (
            <Button onClick={handleAddSubcategory}>
              <Plus className="h-4 w-4 mr-2" />
              Add Topic
            </Button>
          )}
        </div>

        {/* Subcategories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subcategories.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No topics available
              </h3>
              <p className="text-muted-foreground">
                Topics for this category will be added soon.
              </p>
            </div>
          ) : (
            subcategories.map((subcategory) => (
              <Card key={subcategory.id} className="bg-card border-border hover:bg-accent/70 transition-all duration-300 relative cursor-pointer" onClick={() => handleSubcategoryClick(subcategory)}>
                {isAdmin && (
                  <div className="absolute top-2 right-2 z-10 flex gap-1">
                    <Button variant="outline" size="sm" className="hover:bg-blue-700" onClick={(e) => handleEditClick(e, subcategory)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="hover:bg-red-700" onClick={(e) => handleDeleteClick(e, subcategory)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <Badge className={`${getTierColor(subcategory.tier)} border`}>
                      {subcategory.tier}
                    </Badge>
                  </div>
                  <CardTitle className="text-foreground">{subcategory.title || subcategory.name}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {subcategory.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-muted-foreground">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>{subcategory.questionCount || 0} Questions</span>
                    </div>
                    <Button variant="outline" size="sm">
                      View Questions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
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
        itemName={subcategoryToDelete?.title || ""}
        loading={deleteLoading}
      />
    </div>
  );
};

export default CategorySection;
