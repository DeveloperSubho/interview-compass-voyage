
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Github, Play, Image as ImageIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SystemDesignProblem {
  id: string;
  title: string;
  slug: string;
  description: string;
  requirement_discussion: string | null;
  solution: string | null;
  design_image: string | null;
  video_link: string | null;
  github_link: string | null;
  tags: string[];
  difficulty: string;
  pricing_tier: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const SystemDesignDetail = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { toast } = useToast();
  const [problem, setProblem] = useState<SystemDesignProblem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchProblem();
    }
  }, [slug]);

  const fetchProblem = async () => {
    try {
      const { data, error } = await supabase
        .from('system_design_problems')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'Published')
        .single();

      if (error) throw error;
      setProblem(data);
    } catch (error) {
      console.error('Error fetching system design problem:', error);
      toast({
        title: "Error",
        description: "Failed to load system design problem",
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
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      case "Innovator":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
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
            <p className="mt-4 text-muted-foreground">Loading system design problem...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-muted-foreground mb-4">Problem Not Found</h2>
            <Button onClick={() => navigate('/system-design')}>
              Back to System Design
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
            onClick={() => navigate('/system-design')}
            className="text-muted-foreground hover:text-foreground hover:bg-accent mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to System Design
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Problem Header */}
          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`${getDifficultyColor(problem.difficulty)} border`}>
                      {problem.difficulty}
                    </Badge>
                    <Badge className={`${getPricingTierColor(problem.pricing_tier)} border`}>
                      {problem.pricing_tier}
                    </Badge>
                  </div>
                  <CardTitle className="text-foreground text-2xl mb-2">
                    {problem.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {problem.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Tags */}
          {problem.tags.length > 0 && (
            <Card className="bg-card border-border mb-8">
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                  {problem.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Requirements Discussion */}
          {problem.requirement_discussion && (
            <Card className="bg-card border-border mb-8">
              <CardHeader>
                <CardTitle className="text-foreground">Requirements Discussion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {problem.requirement_discussion}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Design Image */}
          {problem.design_image && (
            <Card className="bg-card border-border mb-8">
              <CardHeader>
                <CardTitle className="text-foreground">System Design Diagram</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={problem.design_image}
                  alt="System Design Diagram"
                  className="w-full h-auto rounded-lg border border-border"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Solution */}
          {problem.solution && (
            <Card className="bg-card border-border mb-8">
              <CardHeader>
                <CardTitle className="text-foreground">Solution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {problem.solution}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Links */}
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                {problem.video_link && (
                  <Button asChild variant="outline">
                    <a href={problem.video_link} target="_blank" rel="noopener noreferrer">
                      <Play className="h-4 w-4 mr-2" />
                      Watch Video
                    </a>
                  </Button>
                )}
                {problem.github_link && (
                  <Button asChild variant="outline">
                    <a href={problem.github_link} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4 mr-2" />
                      View Code
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SystemDesignDetail;
