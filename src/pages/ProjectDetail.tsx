
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ExternalLink, Edit, Save, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  duration: string;
  type: string;
  level: string;
  key_features: string[];
  github_url: string | null;
  created_at: string;
}

const ProjectDetail = () => {
  const navigate = useNavigate();
  const { type, id } = useParams();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState<Project | null>(null);

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProject(data);
      setEditedProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast({
        title: "Error",
        description: "Failed to load project details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editedProject) return;

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          title: editedProject.title,
          description: editedProject.description,
          technologies: editedProject.technologies,
          duration: editedProject.duration,
          type: editedProject.type,
          level: editedProject.level,
          key_features: editedProject.key_features,
          github_url: editedProject.github_url,
        })
        .eq('id', id);

      if (error) throw error;

      setProject(editedProject);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Project updated successfully",
      });
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditedProject(project);
    setIsEditing(false);
  };

  const handleArrayChange = (value: string, field: 'technologies' | 'key_features') => {
    if (!editedProject) return;
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setEditedProject({
      ...editedProject,
      [field]: array
    });
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
            <h2 className="text-2xl font-bold text-muted-foreground mb-4">Project Not Found</h2>
            <Button onClick={() => navigate("/projects")}>
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

        <div className="max-w-4xl mx-auto">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`${getDifficultyColor(project.level)} border`}>
                      {project.level}
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-600/20 text-blue-300 border-blue-600/30">
                      {project.type}
                    </Badge>
                  </div>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Project Title</Label>
                        <Input
                          id="title"
                          value={editedProject?.title || ''}
                          onChange={(e) => setEditedProject(prev => prev ? {...prev, title: e.target.value} : null)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ) : (
                    <CardTitle className="text-foreground text-2xl mb-2">
                      {project.title}
                    </CardTitle>
                  )}
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button onClick={handleSave} size="sm">
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button onClick={handleCancel} variant="outline" size="sm">
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Description</h3>
                {isEditing ? (
                  <Textarea
                    value={editedProject?.description || ''}
                    onChange={(e) => setEditedProject(prev => prev ? {...prev, description: e.target.value} : null)}
                    rows={4}
                    className="w-full"
                  />
                ) : (
                  <p className="text-muted-foreground">{project.description}</p>
                )}
              </div>

              {/* Technologies */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Technologies</h3>
                {isEditing ? (
                  <div>
                    <Input
                      value={editedProject?.technologies.join(', ') || ''}
                      onChange={(e) => handleArrayChange(e.target.value, 'technologies')}
                      placeholder="Enter technologies separated by commas"
                    />
                    <p className="text-sm text-muted-foreground mt-1">Separate technologies with commas</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <Badge key={index} variant="secondary" className="bg-muted text-muted-foreground">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Key Features */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Key Features</h3>
                {isEditing ? (
                  <div>
                    <Input
                      value={editedProject?.key_features.join(', ') || ''}
                      onChange={(e) => handleArrayChange(e.target.value, 'key_features')}
                      placeholder="Enter key features separated by commas"
                    />
                    <p className="text-sm text-muted-foreground mt-1">Separate features with commas</p>
                  </div>
                ) : (
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {project.key_features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Duration and Type */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Duration</h3>
                  {isEditing ? (
                    <Input
                      value={editedProject?.duration || ''}
                      onChange={(e) => setEditedProject(prev => prev ? {...prev, duration: e.target.value} : null)}
                    />
                  ) : (
                    <p className="text-muted-foreground">{project.duration}</p>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Project Type</h3>
                  {isEditing ? (
                    <Select
                      value={editedProject?.type || ''}
                      onValueChange={(value) => setEditedProject(prev => prev ? {...prev, type: value} : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Java">Java</SelectItem>
                        <SelectItem value="Spring Boot">Spring Boot</SelectItem>
                        <SelectItem value="ReactJS">ReactJS</SelectItem>
                        <SelectItem value="Full-Stack">Full-Stack</SelectItem>
                        <SelectItem value="Database">Database</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-muted-foreground">{project.type}</p>
                  )}
                </div>
              </div>

              {/* Level */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Difficulty Level</h3>
                {isEditing ? (
                  <Select
                    value={editedProject?.level || ''}
                    onValueChange={(value) => setEditedProject(prev => prev ? {...prev, level: value} : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Explorer">Explorer</SelectItem>
                      <SelectItem value="Builder">Builder</SelectItem>
                      <SelectItem value="Innovator">Innovator</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-muted-foreground">{project.level}</p>
                )}
              </div>

              {/* GitHub Link */}
              {(project.github_url || isEditing) && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">GitHub Repository</h3>
                  {isEditing ? (
                    <Input
                      value={editedProject?.github_url || ''}
                      onChange={(e) => setEditedProject(prev => prev ? {...prev, github_url: e.target.value} : null)}
                      placeholder="https://github.com/username/repository"
                    />
                  ) : project.github_url ? (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View on GitHub
                    </a>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProjectDetail;
