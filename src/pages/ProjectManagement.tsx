
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, ExternalLink, ArrowLeft, Eye } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AddProjectModal from "@/components/AddProjectModal";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  section?: string;
}

const ProjectManagement = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const section = searchParams.get('section');
  const { profile } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    if (!profile?.is_admin) {
      navigate('/');
      return;
    }
    fetchProjects();
  }, [profile, navigate, section]);

  const fetchProjects = async () => {
    try {
      let query = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (section) {
        query = query.eq('section', section);
      }

      const { data, error } = await query;

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

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
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

  const getSectionTitle = (section: string | null) => {
    if (!section) return "All Projects";
    return section.charAt(0).toUpperCase() + section.slice(1) + " Projects";
  };

  if (!profile?.is_admin) {
    return null;
  }

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

  if (selectedProject) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        
        <div className="container mx-auto px-4 py-16">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedProject(null)}
              className="text-muted-foreground hover:text-foreground hover:bg-accent mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {selectedProject.title}
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                  {selectedProject.description}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleEditProject(selectedProject)}
                  className="border-border text-foreground hover:bg-accent"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteProject(selectedProject.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Badge className={`${getLevelColor(selectedProject.level)} border`}>
                    {selectedProject.level}
                  </Badge>
                  <Badge variant="secondary" className="bg-muted text-muted-foreground">
                    {selectedProject.type}
                  </Badge>
                </div>
                
                {selectedProject.duration && (
                  <div>
                    <span className="text-muted-foreground text-sm">Duration: </span>
                    <span className="text-foreground">{selectedProject.duration}</span>
                  </div>
                )}

                <div>
                  <span className="text-muted-foreground text-sm">Technologies:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedProject.technologies.map((tech) => (
                      <Badge key={tech} variant="secondary" className="bg-muted text-muted-foreground">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                {selectedProject.github_url && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(selectedProject.github_url, '_blank')}
                    className="w-full border-border text-foreground hover:bg-accent"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on GitHub
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Key Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {selectedProject.key_features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="h-2 w-2 bg-blue-400 rounded-full mr-3 mt-2"></div>
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
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
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {getSectionTitle(section)}
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Manage and organize projects in the system.
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
              className="bg-card border-border hover:bg-accent/50 transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-foreground text-lg mb-2">{project.title}</CardTitle>
                    <div className="flex gap-2 mb-2">
                      <Badge className={`${getLevelColor(project.level)} border`}>
                        {project.level}
                      </Badge>
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">
                        {project.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleViewProject(project)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-accent p-2"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditProject(project)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-accent p-2"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-accent p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm line-clamp-2">
                  {project.description}
                </p>
                
                {project.duration && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Duration: </span>
                    <span className="text-foreground">{project.duration}</span>
                  </div>
                )}

                {project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.slice(0, 3).map((tech) => (
                      <Badge key={tech} variant="secondary" className="bg-muted text-muted-foreground text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {project.technologies.length > 3 && (
                      <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">
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
                    className="w-full border-border text-foreground hover:bg-accent"
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
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              No {section ? getSectionTitle(section) : 'Projects'} Available
            </h3>
            <p className="text-muted-foreground mb-4">Projects will appear here once they are added.</p>
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
