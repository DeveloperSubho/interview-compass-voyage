
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Code, Github, Play, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
  created_at: string;
}

const CodingQuestionDetail = () => {
  const navigate = useNavigate();
  const { category, slug } = useParams();
  const { toast } = useToast();
  const [question, setQuestion] = useState<CodingQuestion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchQuestion();
    }
  }, [slug]);

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
        description: "Failed to load question details",
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Solved":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "In Progress":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "Unsolved":
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const renderContentWithImages = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      const imageUrlPattern = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/gi;
      const matches = line.match(imageUrlPattern);
      
      if (matches) {
        return (
          <div key={index} className="my-4">
            {line.replace(imageUrlPattern, '').trim() && (
              <p className="mb-2">{line.replace(imageUrlPattern, '').trim()}</p>
            )}
            {matches.map((url, imgIndex) => (
              <img 
                key={imgIndex}
                src={url} 
                alt="Content illustration" 
                className="max-w-full h-auto rounded-lg border border-border my-2"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ))}
          </div>
        );
      }
      
      return line ? <p key={index} className="mb-2">{line}</p> : <br key={index} />;
    });
  };

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
            <h2 className="text-2xl font-bold text-muted-foreground mb-4">Question Not Found</h2>
            <Button onClick={() => navigate("/coding")}>
              Back to Coding Questions
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
            Back to Questions
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Question Header */}
          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge className={`${getDifficultyColor(question.difficulty)} border`}>
                      {question.difficulty}
                    </Badge>
                    <Badge className={`${getStatusColor(question.status)} border`}>
                      {question.status}
                    </Badge>
                    {question.is_paid && (
                      <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                        Premium ({question.level_unlock})
                      </Badge>
                    )}
                    <Badge variant="secondary" className="bg-blue-600/20 text-blue-300 border-blue-600/30">
                      {question.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-foreground text-2xl mb-2">
                    {question.title}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 mb-4">
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
                </div>
                <div className="flex items-center gap-2">
                  {question.github_link && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(question.github_link!, '_blank')}
                    >
                      <Github className="h-4 w-4 mr-1" />
                      GitHub
                    </Button>
                  )}
                  {question.video_link && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(question.video_link!, '_blank')}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Video
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Problem Description */}
          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Code className="h-5 w-5" />
                Problem Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <div className="text-muted-foreground leading-relaxed">
                  {renderContentWithImages(question.description)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Solution */}
          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Code className="h-5 w-5" />
                Solution & Explanation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <div className="text-muted-foreground leading-relaxed">
                  {renderContentWithImages(question.solution)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-start items-center">
            <Button 
              variant="outline" 
              className="border-border text-foreground hover:bg-accent"
              onClick={() => navigate(`/coding/${category}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CodingQuestionDetail;
