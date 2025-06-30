
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Code, Plus, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AddTopicModal from "@/components/AddTopicModal";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Subcategory {
  id: string;
  name: string;
  description: string;
  questionCount?: number;
  tier?: string;
  category_id?: string;
}

const CategorySection = () => {
  const navigate = useNavigate();
  const { category } = useParams();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);

  useEffect(() => {
    if (category) {
      fetchSubcategories();
    }
  }, [category]);

  const fetchSubcategories = async () => {
    try {
      // Get the category first
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', category)
        .single();

      if (categoryError || !categoryData) {
        console.log('Category not found:', category);
        setSubcategories([]);
        setLoading(false);
        return;
      }

      // Get subcategories for this category
      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', categoryData.id)
        .order('name');

      if (subcategoriesError) {
        console.error('Subcategories error:', subcategoriesError);
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
      console.error('Error fetching subcategories:', error);
      setSubcategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubcategoryClick = (subcategoryId: string, subcategoryName: string) => {
    navigate(`/questions/${category}/${subcategoryId}`, { 
      state: { subcategoryName } 
    });
  };

  const handleAddTopic = () => {
    setShowAddTopicModal(true);
  };

  const handleTopicAdded = () => {
    fetchSubcategories();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading {category} subcategories...</p>
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
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent capitalize">
                {category} Topics
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Explore different {category} topics and master your interview preparation with comprehensive questions and answers.
              </p>
            </div>
            {profile?.is_admin && (
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleAddTopic}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Topic
              </Button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subcategories.map((subcategory) => (
            <Card 
              key={subcategory.id} 
              className="bg-card border-border hover:bg-accent/50 transition-all duration-300 hover:scale-105 cursor-pointer"
              onClick={() => handleSubcategoryClick(subcategory.id, subcategory.name)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 bg-gradient-to-r from-[#555879] to-[#98A1BC] rounded-lg flex items-center justify-center">
                    <Code className="h-6 w-6 text-white" />
                  </div>
                  <Badge className="bg-blue-600 text-white">
                    {subcategory.questionCount} Questions
                  </Badge>
                </div>
                <CardTitle className="text-foreground">{subcategory.name}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {subcategory.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Questions
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {subcategories.length === 0 && (
          <div className="text-center py-16">
            <Code className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">No Topics Available</h3>
            <p className="text-muted-foreground">{category} topics will appear here once they are added.</p>
            {profile?.is_admin && (
              <Button 
                className="mt-4 bg-green-600 hover:bg-green-700 text-white"
                onClick={handleAddTopic}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Topic
              </Button>
            )}
          </div>
        )}
      </div>

      <AddTopicModal
        isOpen={showAddTopicModal}
        onClose={() => setShowAddTopicModal(false)}
        onTopicAdded={handleTopicAdded}
        categoryName={category}
      />

      <Footer />
    </div>
  );
};

export default CategorySection;
