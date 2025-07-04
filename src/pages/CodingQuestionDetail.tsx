
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Github, Play, ExternalLink, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProtectedContent from "@/components/ProtectedContent";
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

const CodingQuestionDetail = () => {
  const { category, slug } = useParams();
  const navigate = useNavigate();
  const { hasAccess, isAdmin } = useAuth();
  const { toast } = useToast();
  const [question, setQuestion] = useState<CodingQuestion | null>(null);
  const [loading, setLoading] = useState(true);

  const handleSignInClick = () => {
    toast({
      title: "Sign in required",
      description: "Please sign in to access this content",
    });
  };

  useEffect(() => {
    if (category && slug) {
      fetchQuestion();
    }
  }, [category, slug]);

  const fetchQuestion = async () => {
    try {
      const { data, error } = await supabase
        .from('coding_questions')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      
      setQuestion(data);
    } catch (error) {
      console.error('Error fetching question:', error);
      toast({
        title: "Error",
        description: "Failed to load question",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
      case "Builder":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "Innovator":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  // Allow access if user is admin or has the required tier
  const canAccess = isAdmin || hasAccess(question?.pricing_tier || "");

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading question...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Question Not Found</h1>
            <Button onClick={() => navigate(`/coding/${category}`)}>
              Back to Questions
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
            onClick={() => navigate(`/coding/${category}`)}
            className="text-muted-foreground hover:text-foreground hover:bg-accent mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {category?.replace(/-/g, ' ')} Questions
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Question Header */}
          <Card className="bg-card border-border">
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
                  </div>
                  <CardTitle className="text-2xl md:text-3xl text-foreground mb-4">
                    {question.title}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {question.tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="bg-muted text-muted-foreground"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {question.github_link && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(question.github_link!, '_blank')}
                    >
                      <Github className="h-4 w-4 mr-2" />
                      Code
                    </Button>
                  )}
                  {question.video_link && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(question.video_link!, '_blank')}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Video
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Problem Description */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-xl">Problem Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {question.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Solution - Protected Content */}
          <ProtectedContent 
            requiredTier={isAdmin ? undefined : question.pricing_tier}
            onSignInClick={handleSignInClick}
            showUpgradeMessage={true}
          >
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-xl">Solution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <div className="text-muted-foreground whitespace-pre-wrap">
                    {question.solution}
                  </div>
                </div>
              </CardContent>
            </Card>
          </ProtectedContent>

          {/* Links Section */}
          {(question.github_link || question.video_link) && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-xl">Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {question.github_link && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(question.github_link!, '_blank')}
                    >
                      <Github className="h-4 w-4 mr-2" />
                      View Solution Code
                    </Button>
                  )}
                  {question.video_link && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(question.video_link!, '_blank')}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Watch Explanation Video
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CodingQuestionDetail;
