
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SystemDesignProblem {
  id?: string;
  title: string;
  slug: string;
  description: string;
  requirement_discussion: string;
  solution: string;
  design_image: string;
  video_link: string;
  github_link: string;
  tags: string[];
  difficulty: string;
  pricing_tier: string;
  status: string;
}

interface SystemDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  problem?: SystemDesignProblem;
}

const SystemDesignModal = ({ isOpen, onClose, onSuccess, problem }: SystemDesignModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: problem?.title || "",
    slug: problem?.slug || "",
    description: problem?.description || "",
    requirement_discussion: problem?.requirement_discussion || "",
    solution: problem?.solution || "",
    design_image: problem?.design_image || "",
    video_link: problem?.video_link || "",
    github_link: problem?.github_link || "",
    tags: problem?.tags?.join(", ") || "",
    difficulty: problem?.difficulty || "Easy",
    pricing_tier: problem?.pricing_tier || "Explorer",
    status: problem?.status || "Published"
  });

  useEffect(() => {
    setFormData({
      title: problem?.title || "",
      slug: problem?.slug || "",
      description: problem?.description || "",
      requirement_discussion: problem?.requirement_discussion || "",
      solution: problem?.solution || "",
      design_image: problem?.design_image || "",
      video_link: problem?.video_link || "",
      github_link: problem?.github_link || "",
      tags: problem?.tags?.join(", ") || "",
      difficulty: problem?.difficulty || "Easy",
      pricing_tier: problem?.pricing_tier || "Explorer",
      status: problem?.status || "Published"
    });
  }, [problem]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData({ 
      ...formData, 
      title,
      slug: generateSlug(title)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const problemData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      if (problem?.id) {
        // Update existing problem
        const { error } = await supabase
          .from('system_design_problems')
          .update(problemData)
          .eq('id', problem.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "System design problem updated successfully",
        });
      } else {
        // Create new problem
        const { error } = await supabase
          .from('system_design_problems')
          .insert([problemData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "System design problem created successfully",
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving system design problem:', error);
      toast({
        title: "Error",
        description: "Failed to save system design problem",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{problem ? "Edit System Design Problem" : "Add New System Design Problem"}</DialogTitle>
          <DialogDescription>
            {problem ? 'Update the system design problem.' : 'Create a new system design problem.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter problem title"
                required
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="URL-friendly identifier"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="High-level introduction to the problem"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="pricing_tier">Pricing Tier</Label>
              <Select value={formData.pricing_tier} onValueChange={(value) => setFormData({ ...formData, pricing_tier: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pricing tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Explorer">Explorer</SelectItem>
                  <SelectItem value="Builder">Builder</SelectItem>
                  <SelectItem value="Innovator">Innovator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Published">Published</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Load Balancer, Queue, Scalability, etc."
            />
          </div>

          <div>
            <Label htmlFor="requirement_discussion">Requirements Discussion</Label>
            <Textarea
              id="requirement_discussion"
              value={formData.requirement_discussion}
              onChange={(e) => setFormData({ ...formData, requirement_discussion: e.target.value })}
              placeholder="Bullet points or markdown discussion of system requirements"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="solution">Solution</Label>
            <Textarea
              id="solution"
              value={formData.solution}
              onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
              placeholder="Full system design write-up with explanation and flow"
              rows={6}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="design_image">Design Image URL</Label>
              <Input
                id="design_image"
                value={formData.design_image}
                onChange={(e) => setFormData({ ...formData, design_image: e.target.value })}
                placeholder="Link to image diagram"
              />
            </div>

            <div>
              <Label htmlFor="video_link">Video Link</Label>
              <Input
                id="video_link"
                value={formData.video_link}
                onChange={(e) => setFormData({ ...formData, video_link: e.target.value })}
                placeholder="YouTube tutorial link"
              />
            </div>

            <div>
              <Label htmlFor="github_link">GitHub Link</Label>
              <Input
                id="github_link"
                value={formData.github_link}
                onChange={(e) => setFormData({ ...formData, github_link: e.target.value })}
                placeholder="GitHub repository link"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : problem ? "Update Problem" : "Create Problem"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SystemDesignModal;
