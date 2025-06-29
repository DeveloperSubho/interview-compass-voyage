
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultType?: string;
}

const AddProjectModal = ({ isOpen, onClose, onSuccess, defaultType }: AddProjectModalProps) => {
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
    key_features: "",
    github_url: "",
  });

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

      const { error } = await supabase
        .from('projects')
        .insert([
          {
            title: formData.title,
            description: formData.description,
            technologies: technologiesArray,
            duration: formData.duration,
            type: formData.type,
            level: formData.level,
            key_features: keyFeaturesArray,
            github_url: formData.github_url || null,
            created_by: user.id,
          },
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project added successfully",
      });

      setFormData({
        title: "",
        description: "",
        technologies: "",
        duration: "",
        type: defaultType || "",
        level: "Explorer",
        key_features: "",
        github_url: "",
      });

      onSuccess();
    } catch (error) {
      console.error('Error adding project:', error);
      toast({
        title: "Error",
        description: "Failed to add project",
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
      key_features: "",
      github_url: "",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
          <DialogDescription>
            Create a new project for users to practice and learn from.
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
              <Label htmlFor="level">Difficulty Level</Label>
              <Select 
                value={formData.level} 
                onValueChange={(value) => setFormData({ ...formData, level: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Explorer">Explorer</SelectItem>
                  <SelectItem value="Builder">Builder</SelectItem>
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
              {loading ? "Adding..." : "Add Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectModal;
