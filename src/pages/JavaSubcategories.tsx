import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Trash2, FileText, Lightbulb, Code, Settings, Building, BookOpen, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import AddTopicModal from "@/components/AddTopicModal";

interface Subcategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  questionCount: number;
  created_at: string;
}

const iconMap = {
  'FileText': FileText,
  'Lightbulb': Lightbulb,
  'Code': Code,
  'Settings': Settings,
  'Building': Building,
  'BookOpen': BookOpen,
  'Zap': Zap,
};

const JavaSubcategories = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchSubcategories();
  }, []);

  const fetchSubcategories = async () => {
    try {
      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category', 'Java')
        .order('created_at', { ascending: true });

      if (subcategoriesError) throw subcategoriesError;

      // Fetch question counts for each subcategory
      const subcategoriesWithCounts = await Promise.all(
        (subcategoriesData || []).map(async (subcategory) => {
          const { count } = await supabase
            .from('questions')
            .select('*', { count: 'exact', head: true })
            .eq('subcategory_id', subcategory.id);

          return {
            ...subcategory,
            icon: subcategory.icon || 'Code', // Provide default icon
            questionCount: count || 0
          };
        })
      );

      setSubcategories(subcategoriesWithCounts);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      toast({
        title: "Error",
        description: "Failed to load Java subcategories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    if (!confirm('Are you sure you want to delete this subcategory? This will also delete all questions in this subcategory.')) {
      return;
    }

    try {
      // First delete all questions in this subcategory
      const { error: questionsError } = await supabase
        .from('questions')
        .delete()
        .eq('subcategory_id', subcategoryId);

      if (questionsError) throw questionsError;

      // Then delete the subcategory
      const { error: subcategoryError } = await supabase
        .from('subcategories')
        .delete()
        .eq('id', subcategoryId);

      if (subcategoryError) throw subcategoryError;

      setSubcategories(subcategories.filter(s => s.id !== subcategoryId));
      toast({
        title: "Success",
        description: "Subcategory and all its questions deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast({
        title: "Error",
        description: "Failed to delete subcategory",
        variant: "destructive",
      });
    }
  };

  const handleTopicAdded = () => {
    setIsAddModalOpen(false);
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
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/questions")}
            className="text-muted-foreground hover:text-foreground hover:bg-accent mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Questions
          </Button>
          
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Java Questions
              </h1>
              <p className="text-muted-foreground text-lg">
                Choose a Java topic to practice your knowledge and skills.
              </p>
            </div>
            {isAdmin && (
              <Button onClick={() => setIsAddModalOpen(true)} className="ml-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Topic
              </Button>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {subcategories.length === 0 ? (
            <Card className="bg-card border-border text-center py-12">
              <CardContent>
                <Code className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  No Topics Available
                </h3>
                <p className="text-muted-foreground mb-4">
                  There are no Java topics available yet.
                </p>
                {isAdmin && (
                  <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Topic
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {subcategories.map((subcategory) => {
                const IconComponent = iconMap[subcategory.icon as keyof typeof iconMap] || Code;
                
                return (
                  <Card 
                    key={subcategory.id} 
                    className="bg-card border-border hover:bg-accent/70 transition-all duration-300 cursor-pointer group"
                    onClick={() => navigate(`/questions/java/${subcategory.id}`)}
                  >
                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-xl text-foreground group-hover:text-blue-400 transition-colors">
                        {subcategory.name}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {subcategory.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="secondary" className="bg-muted text-muted-foreground">
                          {subcategory.questionCount} {subcategory.questionCount === 1 ? 'Question' : 'Questions'}
                        </Badge>
                        {isAdmin && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSubcategory(subcategory.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full border-border text-foreground hover:bg-accent"
                        disabled={subcategory.questionCount === 0}
                      >
                        {subcategory.questionCount === 0 ? 'No Questions Yet' : 'Start Practicing'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AddTopicModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onTopicAdded={handleTopicAdded}
        category="Java"
      />

      <Footer />
    </div>
  );
};

export default JavaSubcategories;
