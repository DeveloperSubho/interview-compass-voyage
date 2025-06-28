
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, ExternalLink, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AddProjectModal from "@/components/AddProjectModal";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  title: string;
  description: string;
  github_url: string;
  type: string;
  level: string;
  technologies: string[];
  duration: string;
  key_features: string[];
  created_at: string;
}

const ProjectManagement = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    if (!profile?.is_admin) {
      navigate('/');
      return;
    }
    fetchProjects();
  }, [profile, navigate]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
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
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project deleted successfully",
      });

      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowAddModal(true);
  };

  const handleAddProject = () => {
    setEditingProject(null);
    setShowAddModal(true);
  };

  const handleProjectSaved = () => {
    fetchProjects();
    setEditingProject(null);
  };

  const getLevelColor = (level: string) => {
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

  if (!profile?.is_admin) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 dark:bg-slate-900 text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-4 text-slate-400">Loading projects...</p>
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
            onClick={() => navigate("/projects")}
            className="text-slate-300 hover:text-white hover:bg-slate-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Project Management
              </h1>
              <p className="text-slate-400 text-lg max-w-2xl">
                Manage and organize all projects in the system.
              </p>
            </div>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleAddProject}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card 
              key={project.id} 
              className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg mb-2">{project.title}</CardTitle>
                    <div className="flex gap-2 mb-2">
                      <Badge className={`${getLevelColor(project.level)} border`}>
                        {project.level}
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-600/20 text-blue-300 border-blue-600/30">
                        {project.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditProject(project)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-slate-700 p-2"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-slate-700 p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-300 text-sm line-clamp-2">
                  {project.description}
                </p>
                
                {project.duration && (
                  <div className="text-sm">
                    <span className="text-slate-400">Duration: </span>
                    <span className="text-slate-300">{project.duration}</span>
                  </div>
                )}

                {project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.slice(0, 3).map((tech) => (
                      <Badge key={tech} variant="secondary" className="bg-slate-700 text-slate-300 text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {project.technologies.length > 3 && (
                      <Badge variant="secondary" className="bg-slate-700 text-slate-300 text-xs">
                        +{project.technologies.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                {project.github_url && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(project.github_url, '_blank')}
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on GitHub
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No Projects Available</h3>
            <p className="text-slate-500 mb-4">Projects will appear here once they are added.</p>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleAddProject}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Project
            </Button>
          </div>
        )}
      </div>

      <AddProjectModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingProject(null);
        }}
        onProjectSaved={handleProjectSaved}
        editingProject={editingProject}
      />

      <Footer />
    </div>
  );
};

export default ProjectManagement;
