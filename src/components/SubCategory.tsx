
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Clock, Code, Plus, Edit, Trash2, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import QuestionModal from "@/components/QuestionModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

interface Question {
  id: string;
  title: string;
  content: string;
  answer: string;
  type: string;
  difficulty: string;
  pricing_tier: string;
  created_at: string;
}

interface Subcategory {
  id: string;
  name: string;
  title: string;
  description: string;
}

const SubCategory = () => {
  const navigate = useNavigate();
  const { category, subcategoryName } = useParams();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  
  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("");
  const [tierFilter, setTierFilter] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | undefined>();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchSubcategoryAndQuestions();
  }, [category, subcategoryName]);

  const fetchSubcategoryAndQuestions = async () => {
    try {
      // Fetch subcategory details
      const { data: subcategoryData, error: subcategoryError } = await supabase
        .from('subcategories')
        .select('*')
        .eq('name', subcategoryName)
        .single();

      if (subcategoryError && subcategoryError.code !== 'PGRST116') {
        throw subcategoryError;
      }

      if (subcategoryData) {
        setSubcategory(subcategoryData);

        // Fetch questions for this subcategory
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('subcategory_id', subcategoryData.id)
          .order('created_at', { ascending: false });

        if (questionsError) throw questionsError;
        setQuestions(questionsData || []);
      }
    } catch (error) {
      console.error('Error fetching subcategory and questions:', error);
      toast({
        title: "Error",
        description: "Failed to load questions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!questionToDelete) return;
    
    setDeleteLoading(true);
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionToDelete.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question deleted successfully",
      });

      fetchSubcategoryAndQuestions();
      setDeleteModalOpen(false);
      setQuestionToDelete(null);
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Explorer":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "Builder":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "Innovator":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getPricingTierColor = (tier: string) => {
    switch (tier) {
      case "Explorer":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "Builder":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      case "Innovator":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = !difficultyFilter || difficultyFilter === "" || question.difficulty === difficultyFilter;
    const matchesTier = !tierFilter || tierFilter === "" || question.pricing_tier === tierFilter;
    
    return matchesSearch && matchesDifficulty && matchesTier;
  });

  const handleQuestionClick = (questionId: string) => {
    navigate(`/questions/${category}/${subcategoryName}/${questionId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading questions...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!subcategory) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-muted-foreground mb-4">Subcategory Not Found</h2>
            <Button onClick={() => navigate(`/questions/${category}`)}>
              Back to {category} Categories
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
            onClick={() => navigate(`/questions/${category}`)}
            className="text-muted-foreground hover:text-foreground hover:bg-accent mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
          
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {subcategory.title || subcategory.name}
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                {subcategory.description || `Practice questions for ${subcategory.name}`}
              </p>
            </div>
            
            {isAdmin && (
              <Button onClick={() => {
                setEditingQuestion(undefined);
                setIsModalOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Difficulties</SelectItem>
              <SelectItem value="Explorer">Explorer</SelectItem>
              <SelectItem value="Builder">Builder</SelectItem>
              <SelectItem value="Innovator">Innovator</SelectItem>
            </SelectContent>
          </Select>

          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by pricing tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Tiers</SelectItem>
              <SelectItem value="Explorer">Explorer</SelectItem>
              <SelectItem value="Builder">Builder</SelectItem>
              <SelectItem value="Innovator">Innovator</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No questions found
              </h3>
              <p className="text-muted-foreground">
                {questions.length === 0 ? "No questions available for this topic." : "Try adjusting your search or filters."}
              </p>
            </div>
          ) : (
            filteredQuestions.map((question, index) => (
              <Card 
                key={question.id} 
                className="bg-card border-border hover:bg-accent/70 transition-all duration-300 cursor-pointer relative"
                onClick={() => handleQuestionClick(question.id)}
              >
                {isAdmin && (
                  <div className="absolute top-2 right-2 z-10 flex gap-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="hover:bg-blue-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingQuestion(question);
                        setIsModalOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="hover:bg-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuestionToDelete(question);
                        setDeleteModalOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-muted-foreground text-sm">#{index + 1}</span>
                        <Badge className={`${getDifficultyColor(question.difficulty)} border`}>
                          {question.difficulty}
                        </Badge>
                        <Badge className={`${getPricingTierColor(question.pricing_tier)} border`}>
                          {question.pricing_tier}
                        </Badge>
                        <Badge variant="secondary" className="bg-blue-600/20 text-blue-300 border-blue-600/30">
                          {question.type}
                        </Badge>
                      </div>
                      <CardTitle className="text-foreground text-lg hover:text-blue-400 transition-colors">
                        {question.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground mt-2">
                        {question.content.substring(0, 150)}...
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>

      <QuestionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingQuestion(undefined);
        }}
        onSuccess={() => {
          setIsModalOpen(false);
          setEditingQuestion(undefined);
          fetchSubcategoryAndQuestions();
        }}
        subcategoryId={subcategory.id}
        subcategoryTitle={subcategory.title || subcategory.name}
        question={editingQuestion}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setQuestionToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Question"
        description="Are you sure you want to delete this question? This action cannot be undone."
        itemName={questionToDelete?.title || ""}
        loading={deleteLoading}
      />

      <Footer />
    </div>
  );
};

export default SubCategory;
