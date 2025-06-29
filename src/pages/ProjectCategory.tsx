
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import AddProjectModal from "@/components/AddProjectModal";

interface Project {
  id: string;
  title: string;
  technologies: string[];
  duration: string;
  type: string;
  level: string;
  created_at: string;
}

const ProjectCategory = () => {
  const navigate = useNavigate();
  const { type } = useParams();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      setProjects(projects.filter(p => p.id !== projectId));
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
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
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent capitalize">
                {type} Projects
              </h1>
              <p className="text-muted-foreground text-lg">
                Discover and work on {type?.toLowerCase()} projects to enhance your skills.
              </p>
            </div>
            {isAdmin && (
              <Button onClick={() => setIsAddModalOpen(true)} className="ml-4">
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
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  No Projects Found
                </h3>
                <p className="text-muted-foreground mb-4">
                  There are no {type?.toLowerCase()} projects available yet.
                </p>
                {isAdmin && (
                  <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Project
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {projects.map((project) => (
                <Card 
                  key={project.id} 
                  className="bg-card border-border hover:bg-accent/70 transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/projects/${type}/${project.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${getDifficultyColor(project.level)} border`}>
                            {project.level}
                          </Badge>
                        </div>
                        <CardTitle className="text-foreground text-xl hover:text-blue-400 transition-colors mb-2">
                          {project.title}
                        </CardTitle>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Duration: </span>
                            <span className="text-sm text-foreground">{project.duration}</span>
                          </div>
                        </div>
                      </div>
                      {isAdmin && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground mb-1 block">Technologies:</span>
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.map((tech, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="bg-muted text-muted-foreground text-xs"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <AddProjectModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => {
          setIsAddModalOpen(false);
          fetchProjects();
        }}
        defaultType={type}
      />

      <Footer />
    </div>
  );
};

export default ProjectCategory;
