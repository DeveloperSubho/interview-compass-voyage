
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Clock, Plus, Upload, Edit, Trash2, Trash } from "lucide-react";
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
  tier: string;
  created_at: string;
}

const CategoryQuestionList = () => {
  const navigate = useNavigate();
  const { category, subcategoryId } = useParams();
  const location = useLocation();
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);
  const subcategoryName = location.state?.subcategoryName || `${category} Topic`;

  // Get user's subscription tier
  const userTier = profile?.tier || 'Explorer';

  const getTierAccess = (userTier: string) => {
    switch (userTier) {
      case 'Explorer':
        return ['Explorer'];
      case 'Builder':
        return ['Explorer', 'Builder'];
      case 'Innovator':
        return ['Explorer', 'Builder', 'Innovator'];
      default:
        return ['Explorer'];
    }
  };

  useEffect(() => {
    if (subcategoryId) {
      fetchQuestions();
    }
  }, [subcategoryId]);

  useEffect(() => {
    // Filter questions based on user's tier access
    const accessibleTiers = getTierAccess(userTier);
    const filtered = questions.filter(question => 
      profile?.is_admin || accessibleTiers.includes(question.tier || question.level)
    );
    setFilteredQuestions(filtered);
  }, [questions, userTier, profile?.is_admin]);

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

  const handleBulkDelete = async () => {
    if (selectedQuestions.length === 0) {
      toast({
        title: "Error",
        description: "Please select questions to delete",
        variant: "destructive",
      });
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedQuestions.length} question(s)?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .in('id', selectedQuestions);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${selectedQuestions.length} question(s) deleted successfully`,
      });

      setSelectedQuestions([]);
      setBulkDeleteMode(false);
      fetchQuestions();
    } catch (error) {
      console.error('Error bulk deleting questions:', error);
      toast({
        title: "Error",
        description: "Failed to delete questions",
        variant: "destructive",
      });
    }
  };

  const handleSelectQuestion = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedQuestions.length === filteredQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(filteredQuestions.map(q => q.id));
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

  const handleQuestionClick = (questionId: string) => {
    if (!bulkDeleteMode) {
      navigate(`/questions/${category}/${subcategoryId}/${questionId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 dark:bg-slate-900 text-white">
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
    <div className="min-h-screen bg-slate-900 dark:bg-slate-900 text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/questions/${category}`)}
            className="text-slate-300 hover:text-white hover:bg-slate-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {category} Topics
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
                {bulkDeleteMode ? (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setBulkDeleteMode(false);
                        setSelectedQuestions([]);
                      }}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleBulkDelete}
                      className="bg-red-600 hover:bg-red-700 text-white"
                      disabled={selectedQuestions.length === 0}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete Selected ({selectedQuestions.length})
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => setBulkDeleteMode(true)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Bulk Delete
                    </Button>
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
                  </>
                )}
              </div>
            )}
          </div>

          {bulkDeleteMode && profile?.is_admin && (
            <div className="mb-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={selectedQuestions.length === filteredQuestions.length && filteredQuestions.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-slate-300">
                  Select All ({selectedQuestions.length}/{filteredQuestions.length} selected)
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {filteredQuestions.map((question, index) => (
            <Card 
              key={question.id} 
              className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {bulkDeleteMode && profile?.is_admin && (
                      <Checkbox
                        checked={selectedQuestions.includes(question.id)}
                        onCheckedChange={() => handleSelectQuestion(question.id)}
                        className="mt-1"
                      />
                    )}
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
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">5-15 mins</span>
                    </div>
                    {profile?.is_admin && !bulkDeleteMode && (
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
            </Card>
          ))}
        </div>

        {filteredQuestions.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No Questions Available</h3>
            <p className="text-slate-500 mb-4">
              {questions.length > 0 
                ? "You need a higher tier subscription to access these questions."
                : `Questions for ${subcategoryName} will appear here once they are added.`}
            </p>
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
        {filteredQuestions.length > 0 && (
          <div className="mt-16 max-w-4xl mx-auto">
            <Card className="bg-slate-800/30 border-slate-700">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-3 gap-8 text-center">
                  <div>
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      {filteredQuestions.filter(q => q.level === "Explorer").length}
                    </div>
                    <div className="text-slate-300">Explorer Questions</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-yellow-400 mb-2">
                      {filteredQuestions.filter(q => q.level === "Builder").length}
                    </div>
                    <div className="text-slate-300">Builder Questions</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-red-400 mb-2">
                      {filteredQuestions.filter(q => q.level === "Innovator").length}
                    </div>
                    <div className="text-slate-300">Innovator Questions</div>
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

export default CategoryQuestionList;
