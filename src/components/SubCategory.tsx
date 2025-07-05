import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FileText, Plus, Edit, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuestionModal from "@/components/QuestionModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  title: string;
  content: string;
  answer: string;
  type: string;
  difficulty: string;
  pricing_tier: string;
  subcategory_id: string;
  created_at: string;
  updated_at: string;
}

interface Subcategory {
  id: string;
  name: string;
  description: string;
  tier: string;
  title: string;
  category_id: string;
  created_at: string;
  updated_at: string;
}

const SubCategory = () => {
  const navigate = useNavigate();
  const { category, subcategoryName } = useParams();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subcategoryData, setSubcategoryData] = useState<Subcategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | undefined>();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchSubcategoryAndQuestions();
  }, [category, subcategoryName]);

  const fetchSubcategoryAndQuestions = async () => {
    if (!category || !subcategoryName) return;

    try {
      setLoading(true);

      // Fetch subcategory details
      const { data: subcategory, error: subcategoryError } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', category)
        .eq('name', subcategoryName)
        .single();

      if (subcategoryError) throw subcategoryError;
      setSubcategoryData(subcategory);

      // Fetch questions for this subcategory
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('subcategory_id', subcategory.id)
        .order(sortBy, { ascending: false });

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionModalSuccess = () => {
    setIsQuestionModalOpen(false);
    setSelectedQuestion(undefined);
    fetchQuestions();
  };

  const handleAddQuestion = () => {
    if (!subcategoryData) return;
    setSelectedQuestion(undefined);
    setIsQuestionModalOpen(true);
  };

  const fetchQuestions = async () => {
    if (!subcategoryData) return;

    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('subcategory_id', subcategoryData.id)
        .order(sortBy, { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Error",
        description: "Failed to load questions",
        variant: "destructive",
      });
    }
  };

  const getTierColor = (tier: string) => {
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

  const filteredQuestions = questions.filter(question =>
    question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuestionClick = (questionId: string) => {
    navigate(`/questions/${category}/${subcategoryName}/${questionId}`);
  };

  const handleEditClick = (e: React.MouseEvent, question: Question) => {
    e.stopPropagation();
    setSelectedQuestion(question);
    setIsQuestionModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, question: Question) => {
    e.stopPropagation();
    setQuestionToDelete(question);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
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

      fetchQuestions();
      setIsDeleteModalOpen(false);
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

  if (!subcategoryData) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-muted-foreground mb-4">Topic Not Found</h2>
            <Button onClick={() => navigate(`/questions/${category}`)}>
              Back to {category} Topics
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {subcategoryData.title || subcategoryData.name}
            </h1>
            <p className="text-muted-foreground text-lg max-w-3xl">
              {subcategoryData.description}
            </p>
          </div>
          
          {isAdmin && (
            <Button onClick={handleAddQuestion}>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          )}
        </div>

        {/* Questions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuestions.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No questions available
              </h3>
              <p className="text-muted-foreground">
                Questions for this topic will be added soon.
              </p>
            </div>
          ) : (
            filteredQuestions.map((question) => (
              <Card key={question.id} className="bg-card border-border hover:bg-accent/70 transition-all duration-300 relative cursor-pointer" onClick={() => handleQuestionClick(question.id)}>
                {isAdmin && (
                  <div className="absolute top-2 right-2 z-10 flex gap-1">
                    <Button variant="outline" size="sm" className="hover:bg-blue-700" onClick={(e) => handleEditClick(e, question)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="hover:bg-red-700" onClick={(e) => handleDeleteClick(e, question)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <Badge className={`${getTierColor(question.pricing_tier)} border`}>
                      {question.pricing_tier}
                    </Badge>
                  </div>
                  <CardTitle className="text-foreground">{question.title}</CardTitle>
                  <CardDescription className="text-muted-foreground line-clamp-3">
                    {question.content}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-muted-foreground">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>{question.type}</span>
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

      <QuestionModal
        isOpen={isQuestionModalOpen}
        onClose={() => {
          setIsQuestionModalOpen(false);
          setSelectedQuestion(undefined);
        }}
        onSuccess={handleQuestionModalSuccess}
        question={selectedQuestion}
        subcategoryId={subcategoryData?.id}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setQuestionToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
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
