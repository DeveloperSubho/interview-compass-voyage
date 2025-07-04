
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Github, Clock, Lightbulb } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProtectedContent from "@/components/ProtectedContent";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  title: string;
  description: string | null;
  type: string;
  difficulty: string;
  pricing_tier: string;
  technologies: string[];
  duration: string | null;
  key_features: string[];
  github_url: string | null;
  created_at: string;
}

const ProjectDetail = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { hasAccess, isAdmin } = useAuth();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const handleSignInClick = () => {
    toast({
      title: "Sign in required",
      description: "Please sign in to access this content",
    });
  };

  useEffect(() => {
    if (type && id) {
      fetchProject();
    }
  }, [type, id]);

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast({
        title: "Error",
        description: "Failed to load project",
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
      case "Innovator":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "Builder":
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
            <p className="mt-4 text-muted-foreground">Loading project...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
            <Button onClick={() => navigate(`/projects/${type}`)}>
              Back to Projects
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
            onClick={() => navigate(`/projects/${type}`)}
            className="text-muted-foreground hover:text-foreground hover:bg-accent mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {type} Projects
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Project Header */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <Badge className={`${getDifficultyColor(project.difficulty)} border`}>
                      {project.difficulty}
                    </Badge>
                    <Badge className={`${getPricingTierColor(project.pricing_tier)} border`}>
                      {project.pricing_tier}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl md:text-3xl text-foreground mb-4">
                    {project.title}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-muted-foreground text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Duration: {project.duration || "Variable"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Project Description */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-xl">Project Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {project.description || "No description available for this project."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Technologies */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-xl">Technologies Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="bg-muted text-muted-foreground"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Key Features - Protected Content */}
          <ProtectedContent 
            requiredTier={isAdmin ? undefined : project.pricing_tier}
            onSignInClick={handleSignInClick}
            showUpgradeMessage={true}
          >
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Key Features & Implementation Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.key_features.length > 0 ? (
                    <ul className="space-y-2">
                      {project.key_features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">
                      Key features and implementation details will be provided for this project.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </ProtectedContent>

          {/* Resources Section */}
          {project.github_url && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-xl">Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button
                    variant="outline"
                    onClick={() => window.open(project.github_url!, '_blank')}
                  >
                    <Github className="h-4 w-4 mr-2" />
                    View Source Code
                  </Button>
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

export default ProjectDetail;
