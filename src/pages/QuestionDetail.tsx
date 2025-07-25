
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Code } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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

const QuestionDetail = () => {
  const navigate = useNavigate();
  const { category, subcategoryName, questionId } = useParams();
  const { toast } = useToast();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (questionId) {
      fetchQuestion();
    }
  }, [questionId]);

  const fetchQuestion = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('id', questionId)
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

  const getDifficultyColor = (pricing_tier: string) => {
    switch (pricing_tier) {
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

  const renderAnswerWithImages = (answer: string) => {
    const lines = answer.split('\n');
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
                alt="Answer illustration"
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
            <Button onClick={() => navigate(`/questions/${category}`)}>
              Back to ${category} Topics
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
            onClick={() => navigate(`/questions/${category}/${subcategoryName}`)}
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
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`${getDifficultyColor(question.pricing_tier)} border`}>
                      {question.pricing_tier}
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-600/20 text-blue-300 border-blue-600/30">
                      {question.type}
                    </Badge>
                  </div>
                  <CardTitle className="text-foreground text-2xl mb-2">
                    {question.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {question.content}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Question Answer */}
          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Code className="h-5 w-5" />
                Answer & Explanation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <div className="text-muted-foreground leading-relaxed">
                  {renderAnswerWithImages(question.answer)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default QuestionDetail;
