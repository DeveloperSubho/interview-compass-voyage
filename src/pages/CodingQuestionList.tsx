
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Upload, Clock, Trophy, Code, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import CodingQuestionModal from "@/components/CodingQuestionModal";
import CodingBulkImportModal from "@/components/CodingBulkImportModal";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CodingQuestion {
  id: string;
  title: string;
  slug: string;
  description: string;
  solution: string;
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
  const { category } = useParams();
  const navigate = useNavigate();
  const { user, hasAccess, isAdmin } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<CodingQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);

  useEffect(() => {
    if (category) {
      fetchQuestions();
    }
  }, [category]);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('coding_questions')
        .select('*')
        .eq('category', category?.replace(/-/g, ' '))
        .order('created_at', { ascending: false });

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

  const handleQuestionClick = (question: CodingQuestion) => {
    // Show content but require sign-in on click
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    // Admin can access all questions
    if (isAdmin || hasAccess(question.pricing_tier)) {
      navigate(`/coding/${category}/${question.slug}`);
    } else {
      toast({
        title: "Upgrade Required",
        description: `This question requires ${question.pricing_tier} tier or higher`,
        variant: "destructive",
      });
    }
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

  const handleModalSuccess = () => {
    setIsQuestionModalOpen(false);
    setIsBulkImportModalOpen(false);
    fetchQuestions();
  };

  const shouldShowLock = (question: CodingQuestion) => {
    return user && !isAdmin && !hasAccess(question.pricing_tier);
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
            Back to Coding Categories
          </Button>
          
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent capitalize">
                {category?.replace(/-/g, ' ')} Questions
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Practice coding problems and improve your programming skills with detailed solutions.
              </p>
            </div>
            
            {isAdmin && (
              <div className="flex gap-2">
                <Button onClick={() => setIsQuestionModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
                <Button variant="outline" onClick={() => setIsBulkImportModalOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Bulk Import
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto space-y-4">
          {questions.length === 0 ? (
            <Card className="bg-card border-border text-center py-12">
              <CardContent>
                <Code className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  No Questions Available
                </h3>
                <p className="text-muted-foreground">
                  Questions for {category?.replace(/-/g, ' ')} will be added soon.
                </p>
              </CardContent>
            </Card>
          ) : (
            questions.map((question) => (
              <Card 
                key={question.id} 
                className="bg-card border-border hover:bg-accent/70 transition-all duration-300 cursor-pointer"
                onClick={() => handleQuestionClick(question)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-4 flex-wrap">
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
                        {shouldShowLock(question) && (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <CardTitle className="text-foreground text-xl hover:text-blue-400 transition-colors">
                        {question.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground mt-2">
                        {question.description.length > 150 
                          ? `${question.description.substring(0, 150)}...` 
                          : question.description
                        }
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {question.tags.slice(0, 3).map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="bg-muted text-muted-foreground text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {question.tags.length > 3 && (
                      <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">
                        +{question.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Created {new Date(question.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {question.github_link && (
                        <Badge variant="outline" className="text-xs">
                          Code Available
                        </Badge>
                      )}
                      {question.video_link && (
                        <Badge variant="outline" className="text-xs">
                          Video Available
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Practice Stats */}
        {questions.length > 0 && (
          <div className="mt-16 max-w-4xl mx-auto">
            <Card className="bg-card border-border">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-3 gap-8 text-center">
                  <div>
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      {questions.filter(q => q.difficulty === "Easy").length}
                    </div>
                    <div className="text-muted-foreground">Easy Questions</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-yellow-400 mb-2">
                      {questions.filter(q => q.difficulty === "Medium").length}
                    </div>
                    <div className="text-muted-foreground">Medium Questions</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-red-400 mb-2">
                      {questions.filter(q => q.difficulty === "Hard").length}
                    </div>
                    <div className="text-muted-foreground">Hard Questions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {isAdmin && (
        <>
          <CodingQuestionModal
            isOpen={isQuestionModalOpen}
            onClose={() => setIsQuestionModalOpen(false)}
            onSuccess={handleModalSuccess}
            category={category || ""}
          />

          <CodingBulkImportModal
            isOpen={isBulkImportModalOpen}
            onClose={() => setIsBulkImportModalOpen(false)}
            onSuccess={handleModalSuccess}
            category={category || ""}
          />
        </>
      )}

      <Footer />
    </div>
  );
};

export default CodingQuestionList;
