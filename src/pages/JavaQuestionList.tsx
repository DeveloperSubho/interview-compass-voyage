
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Plus, Upload, Edit, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuestionModal from "@/components/QuestionModal";
import BulkImportModal from "@/components/BulkImportModal";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  title: string;
  content: string;
  answer: string;
  type: string;
  level: string;
  created_at: string;
}

const JavaQuestionList = () => {
  const navigate = useNavigate();
  const { subcategoryId } = useParams();
  const location = useLocation();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const subcategoryName = location.state?.subcategoryName || "Java Topic";

  useEffect(() => {
    if (subcategoryId) {
      fetchQuestions();
    }
  }, [subcategoryId]);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('subcategory_id', subcategoryId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Error",
        description: "Failed to load questions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question deleted successfully",
      });

      fetchQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setShowQuestionModal(true);
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setShowQuestionModal(true);
  };

  const handleQuestionSaved = () => {
    fetchQuestions();
    setEditingQuestion(null);
  };

  const handleBulkImportComplete = () => {
    fetchQuestions();
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "Basic":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "Intermediate":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "Advanced":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const handleQuestionClick = (questionId: string) => {
    navigate(`/questions/java/${subcategoryId}/${questionId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-4 text-slate-400">Loading questions...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/questions/java")}
            className="text-slate-300 hover:text-white hover:bg-slate-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Java Topics
          </Button>
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {subcategoryName} Questions
              </h1>
              <p className="text-slate-400 text-lg max-w-2xl">
                Practice and master these carefully curated questions for {subcategoryName}.
              </p>
            </div>
            {profile?.is_admin && (
              <div className="flex gap-2">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setShowBulkImportModal(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Bulk Import
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleAddQuestion}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {questions.map((question, index) => (
            <Card 
              key={question.id} 
              className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => handleQuestionClick(question.id)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-slate-400 text-sm">#{index + 1}</span>
                      <Badge className={`${getDifficultyColor(question.level)} border`}>
                        {question.level}
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-600/20 text-blue-300 border-blue-600/30">
                        {question.type}
                      </Badge>
                    </div>
                    <CardTitle className="text-white text-lg hover:text-blue-400 transition-colors">
                      {question.title}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">5-15 mins</span>
                    </div>
                    {profile?.is_admin && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditQuestion(question);
                          }}
                          className="text-blue-400 hover:text-blue-300 hover:bg-slate-700 p-2"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuestion(question.id);
                          }}
                          className="text-red-400 hover:text-red-300 hover:bg-slate-700 p-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p 
                  className="text-slate-300 text-sm line-clamp-2 cursor-pointer"
                  onClick={() => handleQuestionClick(question.id)}
                >
                  {question.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {questions.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No Questions Available</h3>
            <p className="text-slate-500 mb-4">Questions for {subcategoryName} will appear here once they are added.</p>
            {profile?.is_admin && (
              <div className="flex gap-2 justify-center">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setShowBulkImportModal(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Bulk Import Questions
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleAddQuestion}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Question
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        {questions.length > 0 && (
          <div className="mt-16 max-w-4xl mx-auto">
            <Card className="bg-slate-800/30 border-slate-700">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-3 gap-8 text-center">
                  <div>
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      {questions.filter(q => q.level === "Basic").length}
                    </div>
                    <div className="text-slate-300">Basic Questions</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-yellow-400 mb-2">
                      {questions.filter(q => q.level === "Intermediate").length}
                    </div>
                    <div className="text-slate-300">Intermediate Questions</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-red-400 mb-2">
                      {questions.filter(q => q.level === "Advanced").length}
                    </div>
                    <div className="text-slate-300">Advanced Questions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <QuestionModal
        isOpen={showQuestionModal}
        onClose={() => {
          setShowQuestionModal(false);
          setEditingQuestion(null);
        }}
        onQuestionSaved={handleQuestionSaved}
        subcategoryId={subcategoryId!}
        subcategoryName={subcategoryName}
        editingQuestion={editingQuestion}
      />

      <BulkImportModal
        isOpen={showBulkImportModal}
        onClose={() => setShowBulkImportModal(false)}
        onImportComplete={handleBulkImportComplete}
        subcategoryId={subcategoryId!}
        subcategoryName={subcategoryName}
      />

      <Footer />
    </div>
  );
};

export default JavaQuestionList;
