
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

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
}

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectSaved: () => void;
  editingProject?: Project | null;
}

const AddProjectModal = ({ isOpen, onClose, onProjectSaved, editingProject }: AddProjectModalProps) => {
  const [title, setTitle] = useState(editingProject?.title || "");
  const [description, setDescription] = useState(editingProject?.description || "");
  const [githubUrl, setGithubUrl] = useState(editingProject?.github_url || "");
  const [type, setType] = useState(editingProject?.type || "");
  const [level, setLevel] = useState(editingProject?.level || "Explorer");
  const [technologies, setTechnologies] = useState<string[]>(editingProject?.technologies || []);
  const [duration, setDuration] = useState(editingProject?.duration || "");
  const [keyFeatures, setKeyFeatures] = useState<string[]>(editingProject?.key_features || []);
  const [newTech, setNewTech] = useState("");
  const [newFeature, setNewFeature] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const projectTypes = [
    "Java",
    "Spring Boot", 
    "ReactJS",
    "Full-Stack",
    "Database"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !type.trim()) {
      toast({
        title: "Error",
        description: "Title and type are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const projectData = {
        title: title.trim(),
        description: description.trim() || null,
        github_url: githubUrl.trim() || null,
        type: type.trim(),
        level,
        technologies,
        duration: duration.trim() || null,
        key_features: keyFeatures
      };

      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProject.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Project updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('projects')
          .insert(projectData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Project added successfully",
        });
      }

      resetForm();
      onProjectSaved();
      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: "Error",
        description: "Failed to save project",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setGithubUrl("");
    setType("");
    setLevel("Explorer");
    setTechnologies([]);
    setDuration("");
    setKeyFeatures([]);
    setNewTech("");
    setNewFeature("");
  };

  const addTechnology = () => {
    if (newTech.trim() && !technologies.includes(newTech.trim())) {
      setTechnologies([...technologies, newTech.trim()]);
      setNewTech("");
    }
  };

  const removeTechnology = (tech: string) => {
    setTechnologies(technologies.filter(t => t !== tech));
  };

  const addFeature = () => {
    if (newFeature.trim() && !keyFeatures.includes(newFeature.trim())) {
      setKeyFeatures([...keyFeatures, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const removeFeature = (feature: string) => {
    setKeyFeatures(keyFeatures.filter(f => f !== feature));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border text-foreground max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center text-foreground">
            {editingProject ? "Edit Project" : "Add New Project"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-muted-foreground">Title *</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-input border-border text-foreground"
                placeholder="Project title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type" className="text-muted-foreground">Type *</Label>
              <Select value={type} onValueChange={setType} required>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {projectTypes.map((projectType) => (
                    <SelectItem key={projectType} value={projectType}>
                      {projectType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level" className="text-muted-foreground">Level</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="Explorer">Explorer</SelectItem>
                  <SelectItem value="Builder">Builder</SelectItem>
                  <SelectItem value="Innovator">Innovator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="text-muted-foreground">Duration</Label>
              <Input
                id="duration"
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="bg-input border-border text-foreground"
                placeholder="e.g., 2-3 weeks"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-muted-foreground">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-input border-border text-foreground"
              placeholder="Project description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="githubUrl" className="text-muted-foreground">GitHub URL</Label>
            <Input
              id="githubUrl"
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="bg-input border-border text-foreground"
              placeholder="https://github.com/username/project"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Technologies</Label>
            <div className="flex gap-2">
              <Input
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                className="bg-input border-border text-foreground flex-1"
                placeholder="Add technology"
              />
              <Button type="button" onClick={addTechnology} className="bg-blue-600 hover:bg-blue-700">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {technologies.map((tech) => (
                <Badge key={tech} className="bg-blue-600 text-white flex items-center gap-1">
                  {tech}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeTechnology(tech)} />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Key Features</Label>
            <div className="flex gap-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                className="bg-input border-border text-foreground flex-1"
                placeholder="Add key feature"
              />
              <Button type="button" onClick={addFeature} className="bg-green-600 hover:bg-green-700">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {keyFeatures.map((feature) => (
                <Badge key={feature} className="bg-green-600 text-white flex items-center gap-1">
                  {feature}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeFeature(feature)} />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button"
              variant="outline" 
              onClick={onClose}
              className="flex-1 border-border text-foreground hover:bg-accent"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={loading}
            >
              {loading ? "Saving..." : (editingProject ? "Update Project" : "Add Project")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectModal;
