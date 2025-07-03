
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id?: string;
  title: string;
  description: string | null;
  type: string;
  level: string;
  pricing_tier: string;
  technologies: string[];
  duration: string | null;
  key_features: string[];
  github_url: string | null;
  created_at?: string;
}

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultType?: string;
  editingProject?: Project | null;
}

const AddProjectModal = ({ isOpen, onClose, onSuccess, defaultType, editingProject }: AddProjectModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    technologies: "",
    duration: "",
    type: defaultType || "",
    level: "Explorer",
    pricing_tier: "Explorer",
    key_features: "",
    github_url: "",
  });

  useEffect(() => {
    if (editingProject) {
      setFormData({
        title: editingProject.title,
        description: editingProject.description || "",
        technologies: editingProject.technologies.join(", "),
        duration: editingProject.duration || "",
        type: editingProject.type,
        level: editingProject.level,
        pricing_tier: editingProject.pricing_tier,
        key_features: editingProject.key_features.join(", "),
        github_url: editingProject.github_url || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        technologies: "",
        duration: "",
        type: defaultType || "",
        level: "Explorer",
        pricing_tier: "Explorer",
        key_features: "",
        github_url: "",
      });
    }
  }, [editingProject, defaultType, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const technologiesArray = formData.technologies
        .split(',')
        .map(tech => tech.trim())
        .filter(tech => tech.length > 0);

      const keyFeaturesArray = formData.key_features
        .split(',')
        .map(feature => feature.trim())
        .filter(feature => feature.length > 0);

      const projectData = {
        title: formData.title,
        description: formData.description,
        technologies: technologiesArray,
        duration: formData.duration,
        type: formData.type,
        level: formData.level,
        pricing_tier: formData.pricing_tier,
        key_features: keyFeaturesArray,
        github_url: formData.github_url || null,
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
          .insert([
            {
              ...projectData,
              created_by: user.id,
            },
          ]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Project added successfully",
        });
      }

      setFormData({
        title: "",
        description: "",
        technologies: "",
        duration: "",
        type: defaultType || "",
        level: "Explorer",
        pricing_tier: "Explorer",
        key_features: "",
        github_url: "",
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingProject ? 'update' : 'add'} project`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      technologies: "",
      duration: "",
      type: defaultType || "",
      level: "Explorer",
      pricing_tier: "Explorer",
      key_features: "",
      github_url: "",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
          <DialogDescription>
            {editingProject ? 'Update the project details below.' : 'Create a new project for users to practice and learn from.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Project Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData({ ...formData, type: value })}
                required
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
            </div>

            <div>
              <Label htmlFor="pricing_tier">Pricing Tier</Label>
              <Select 
                value={formData.pricing_tier} 
                onValueChange={(value) => setFormData({ ...formData, pricing_tier: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Explorer">Explorer</SelectItem>
                  <SelectItem value="Voyager">Voyager</SelectItem>
                  <SelectItem value="Innovator">Innovator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="e.g., 2-3 weeks"
              required
            />
          </div>

          <div>
            <Label htmlFor="technologies">Technologies</Label>
            <Input
              id="technologies"
              value={formData.technologies}
              onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
              placeholder="React, Node.js, MongoDB (comma-separated)"
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              Enter technologies separated by commas
            </p>
          </div>

          <div>
            <Label htmlFor="key_features">Key Features</Label>
            <Textarea
              id="key_features"
              value={formData.key_features}
              onChange={(e) => setFormData({ ...formData, key_features: e.target.value })}
              placeholder="User authentication, Real-time chat, Responsive design (comma-separated)"
              rows={3}
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              Enter key features separated by commas
            </p>
          </div>

          <div>
            <Label htmlFor="github_url">GitHub URL (Optional)</Label>
            <Input
              id="github_url"
              type="url"
              value={formData.github_url}
              onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
              placeholder="https://github.com/username/repository"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (editingProject ? "Updating..." : "Adding...") : (editingProject ? "Update Project" : "Add Project")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectModal;
