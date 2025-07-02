
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Upload, Eye, EyeOff, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CodingQuestionModal from "@/components/CodingQuestionModal";
import CodingBulkImportModal from "@/components/CodingBulkImportModal";
import ProtectedContent from "@/components/ProtectedContent";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CodingQuestion {
  id: string;
  title: string;
  slug: string;
  description: string;
  explanation: string;  // Changed from solution to explanation
  difficulty: string;
  status: string;
  category: string;
  tags: string[];
  github_link: string | null;
  video_link: string | null;
  is_paid: boolean;
  level_unlock: string;
  pricing_tier: string;
  created_at: string;
}

const CodingQuestionList = () => {
  const navigate = useNavigate();
  const { category } = useParams();
  const { user, isAdmin, hasAccess } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<CodingQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<CodingQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<CodingQuestion | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [pricingTierFilter, setPricingTierFilter] = useState("all");
  const [showLockedQuestions, setShowLockedQuestions] = useState(true);

  const handleSignInClick = () => {
    toast({
      title: "Sign in required",
      description: "Please sign in to access this content",
    });
  };

  useEffect(() => {
    if (category) {
      fetchQuestions();
    }
  }, [category]);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchTerm, difficultyFilter, pricingTierFilter, showLockedQuestions]);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('coding_questions')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map solution to explanation for backward compatibility
      const questionsData = data.map(question => ({
        ...question,
        explanation: question.solution || question.explanation || ''
      }));
      
      setQuestions(questionsData || []);
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

  const filterQuestions = () => {
    let filtered = questions.filter(question => {
      const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          question.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesDifficulty = difficultyFilter === "all" || question.difficulty === difficultyFilter;
      const matchesPricingTier = pricingTierFilter === "all" || question.pricing_tier === pricingTierFilter;
      
      // Check if user has access to this question
      const hasAccessToQuestion = hasAccess(question.pricing_tier);
      
      // If showLockedQuestions is false, only show questions user has access to
      const shouldShow = showLockedQuestions || hasAccessToQuestion;
      
      return matchesSearch && matchesDifficulty && matchesPricingTier && shouldShow;
    });

    setFilteredQuestions(filtered);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const { error } = await supabase
        .from('coding_questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      setQuestions(questions.filter(q => q.id !== questionId));
      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  const handleQuestionClick = (question: CodingQuestion) => {
    // Check if user has access to this question
    if (!hasAccess(question.pricing_tier)) {
      // Don't navigate, just show a message (handled by ProtectedContent)
      return;
    }
    navigate(`/coding/${category}/${question.slug}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "Medium":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "Hard":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getPricingTierColor = (tier: string) => {
    switch (tier) {
      case "Explorer":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "Voyager":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "Innovator":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/coding")}
            className="text-muted-foreground hover:text-foreground hover:bg-accent mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent capitalize">
              {category?.replace(/-/g, ' ')} Coding Questions
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Practice coding problems and improve your problem-solving skills.
            </p>
          </div>
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <div className="flex gap-2 mb-6">
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
            <Button variant="outline" onClick={() => setIsBulkImportModalOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Bulk Import
            </Button>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>

          <Select value={pricingTierFilter} onValueChange={setPricingTierFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="Explorer">Explorer</SelectItem>
              <SelectItem value="Voyager">Voyager</SelectItem>
              <SelectItem value="Innovator">Innovator</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setShowLockedQuestions(!showLockedQuestions)}
            className="flex items-center gap-2"
          >
            {showLockedQuestions ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {showLockedQuestions ? "Hide Locked" : "Show Locked"}
          </Button>
        </div>

        {/* Questions List */}
        <div className="max-w-6xl mx-auto">
          {filteredQuestions.length === 0 ? (
            <Card className="bg-card border-border text-center py-12">
              <CardContent>
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  No Questions Found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {questions.length === 0 
                    ? `No coding questions available for ${category?.replace(/-/g, ' ')} yet.`
                    : "Try adjusting your filters to see more questions."
                  }
                </p>
                {isAdmin && questions.length === 0 && (
                  <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Question
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {filteredQuestions.map((question) => {
                const requiresUpgrade = !hasAccess(question.pricing_tier);
                
                return (
                  <Card 
                    key={question.id} 
                    className={`bg-card border-border hover:bg-accent/70 transition-all duration-300 ${requiresUpgrade ? 'opacity-75' : 'cursor-pointer'}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge className={`${getDifficultyColor(question.difficulty)} border`}>
                              {question.difficulty}
                            </Badge>
                            <Badge className={`${getPricingTierColor(question.pricing_tier)} border`}>
                              {question.pricing_tier}
                            </Badge>
                            {question.is_paid && (
                              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                                Premium
                              </Badge>
                            )}
                          </div>
                          
                          <ProtectedContent
                            requiredTier={question.pricing_tier}
                            onSignInClick={handleSignInClick}
                            showUpgradeMessage={true}
                          >
                            <div onClick={() => handleQuestionClick(question)}>
                              <CardTitle className="text-foreground text-xl hover:text-blue-400 transition-colors mb-2 cursor-pointer">
                                {question.title}
                              </CardTitle>
                              <CardDescription className="text-muted-foreground mb-4">
                                {question.description.substring(0, 150)}
                                {question.description.length > 150 && "..."}
                              </CardDescription>
                            </div>
                          </ProtectedContent>
                        </div>
                        
                        {isAdmin && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingQuestion(question);
                                setIsModalOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteQuestion(question.id);
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {question.tags.map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="bg-muted text-muted-foreground text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Statistics */}
        {questions.length > 0 && (
          <div className="mt-16 max-w-6xl mx-auto">
            <Card className="bg-card border-border">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-4 gap-8 text-center">
                  <div>
                    <div className="text-3xl font-bold text-blue-400 mb-2">
                      {filteredQuestions.length}
                    </div>
                    <div className="text-muted-foreground">Available Questions</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      {filteredQuestions.filter(q => q.difficulty === "Easy").length}
                    </div>
                    <div className="text-muted-foreground">Easy</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-yellow-400 mb-2">
                      {filteredQuestions.filter(q => q.difficulty === "Medium").length}
                    </div>
                    <div className="text-muted-foreground">Medium</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-red-400 mb-2">
                      {filteredQuestions.filter(q => q.difficulty === "Hard").length}
                    </div>
                    <div className="text-muted-foreground">Hard</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <CodingQuestionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingQuestion(null);
        }}
        onSuccess={() => {
          setIsModalOpen(false);
          setEditingQuestion(null);
          fetchQuestions();
        }}
        editingQuestion={editingQuestion}
        category={category || ''}
      />

      <CodingBulkImportModal
        isOpen={isBulkImportModalOpen}
        onClose={() => setIsBulkImportModalOpen(false)}
        onSuccess={() => {
          setIsBulkImportModalOpen(false);
          fetchQuestions();
        }}
        category={category || ''}
      />

      <Footer />
    </div>
  );
};

export default CodingQuestionList;
