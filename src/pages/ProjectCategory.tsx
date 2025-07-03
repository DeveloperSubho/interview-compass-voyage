
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Clock, Github, Lock, edit } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import AddProjectModal from "@/components/AddProjectModal";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  title: string;
  description: string | null;
  type: string;
  level: string;
  pricing_tier: string;
  technologies: string[];
  duration: string | null;
  key_features: string[];
  github_url: string | null;
  created_at: string;
}

const ProjectCategory = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const { user, hasAccess, isAdmin } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    if (type) {
      fetchProjects();
    }
  }, [type]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('type', type)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (project: Project) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (isAdmin || hasAccess(project.pricing_tier)) {
      navigate(`/projects/${type}/${project.id}`);
    } else {
      toast({
        title: "Upgrade Required",
        description: `This project requires ${project.pricing_tier} tier or higher`,
        variant: "destructive",
      });
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsAddProjectModalOpen(true);
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
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

  const handleAddProjectSuccess = () => {
    setIsAddProjectModalOpen(false);
    setEditingProject(null);
    fetchProjects();
  };

  const shouldShowLock = (project: Project) => {
    return user && !isAdmin && !hasAccess(project.pricing_tier);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading projects...</p>
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
            onClick={() => navigate("/projects")}
            className="text-muted-foreground hover:text-foreground hover:bg-accent mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
          
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {type} Projects
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Build real-world {type} projects and enhance your skills with hands-on experience.
              </p>
            </div>
            
            {isAdmin && (
              <Button onClick={() => setIsAddProjectModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {projects.length === 0 ? (
            <Card className="bg-card border-border text-center py-12">
              <CardContent>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                    No Projects Available
                  </h3>
                  <p className="text-muted-foreground">
                    {type} projects will be added soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card 
                  key={project.id} 
                  className="bg-card border-border hover:bg-accent/70 transition-all duration-300 cursor-pointer relative"
                  onClick={() => handleProjectClick(project)}
                >
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProject(project);
                      }}
                    >
                      <edit className="h-4 w-4" />
                    </Button>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex flex-wrap gap-2">
                        <Badge className={`${getDifficultyColor(project.level)} border text-xs`}>
                          Difficulty: {project.level}
                        </Badge>
                        <Badge className={`${getPricingTierColor(project.pricing_tier)} border text-xs`}>
                          {project.pricing_tier}
                        </Badge>
                      </div>
                      {shouldShowLock(project) && (
                        <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                    <CardTitle className="text-foreground text-lg hover:text-blue-400 transition-colors">
                      {project.title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-sm">
                      {project.description || "No description available"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Technologies */}
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.slice(0, 3).map((tech, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="bg-muted text-muted-foreground text-xs"
                          >
                            {tech}
                          </Badge>
                        ))}
                        {project.technologies.length > 3 && (
                          <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">
                            +{project.technologies.length - 3}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Key Features */}
                      {project.key_features.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          <div className="font-medium mb-1">Key Features:</div>
                          <ul className="text-xs space-y-1">
                            {project.key_features.slice(0, 2).map((feature, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <span className="text-blue-400 mt-0.5">•</span>
                                <span>{feature}</span>
                              </li>
                            ))}
                            {project.key_features.length > 2 && (
                              <li className="text-xs text-muted-foreground/70">
                                +{project.key_features.length - 2} more features
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                      
                      {/* Duration and GitHub */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{project.duration || "Variable"}</span>
                        </div>
                        {project.github_url && (
                          <Badge variant="outline" className="text-xs">
                            <Github className="h-3 w-3 mr-1" />
                            Code
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {isAdmin && (
        <AddProjectModal
          isOpen={isAddProjectModalOpen}
          onClose={() => setIsAddProjectModalOpen(false)}
          onSuccess={handleAddProjectSuccess}
          editingProject={editingProject}
        />
      )}

      <Footer />
    </div>
  );
};

export default ProjectCategory;
