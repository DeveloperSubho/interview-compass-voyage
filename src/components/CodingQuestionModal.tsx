
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CodingQuestion {
  id?: string;
  title: string;
  slug: string;
  description: string;
  solution: string;
  difficulty: string;
  category: string;
  tags: string[];
  pricing_tier: string;
  video_link?: string;
  github_link?: string;
}

interface CodingQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  question?: CodingQuestion;
}

const CodingQuestionModal = ({ isOpen, onClose, onSuccess, question }: CodingQuestionModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: question?.title || "",
    slug: question?.slug || "",
    description: question?.description || "",
    solution: question?.solution || "",
    difficulty: question?.difficulty || "Easy",
    category: question?.category || "",
    tags: question?.tags?.join(", ") || "",
    pricing_tier: question?.pricing_tier || "Explorer",
    video_link: question?.video_link || "",
    github_link: question?.github_link || ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const questionData = {
        ...formData,
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag)
      };

      if (question?.id) {
        // Update existing question
        const { error } = await supabase
          .from('coding_questions')
          .update(questionData)
          .eq('id', question.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Coding question updated successfully",
        });
      } else {
        // Create new question
        const { error } = await supabase
          .from('coding_questions')
          .insert([questionData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Coding question created successfully",
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving coding question:', error);
      toast({
        title: "Error",
        description: "Failed to save coding question",
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
          <DialogTitle>{question ? "Edit Coding Question" : "Add New Coding Question"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter question title"
                required
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="question-slug"
                required
              />
            </div>
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
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Arrays, Strings"
                required
              />
            </div>

            <div>
              <Label htmlFor="pricing_tier">Pricing Tier</Label>
              <Select value={formData.pricing_tier} onValueChange={(value) => setFormData({ ...formData, pricing_tier: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pricing tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Explorer">Explorer</SelectItem>
                  <SelectItem value="Innovator">Innovator</SelectItem>
                  <SelectItem value="Builder">Builder</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="array, sorting, algorithm"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter problem description"
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="solution">Solution</Label>
            <Textarea
              id="solution"
              value={formData.solution}
              onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
              placeholder="Enter the solution with explanation"
              rows={6}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="video_link">Video Link (Optional)</Label>
              <Input
                id="video_link"
                value={formData.video_link}
                onChange={(e) => setFormData({ ...formData, video_link: e.target.value })}
                placeholder="https://youtube.com/..."
              />
            </div>

            <div>
              <Label htmlFor="github_link">GitHub Link (Optional)</Label>
              <Input
                id="github_link"
                value={formData.github_link}
                onChange={(e) => setFormData({ ...formData, github_link: e.target.value })}
                placeholder="https://github.com/..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : question ? "Update Question" : "Create Question"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CodingQuestionModal;
