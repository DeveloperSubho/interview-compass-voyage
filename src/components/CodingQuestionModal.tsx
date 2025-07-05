
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  tier: string;
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
    title: "",
    slug: "",
    description: "",
    solution: "",
    difficulty: "Easy",
    category: "",
    tier: "Explorer",
    tags: [] as string[],
    github_link: "",
    video_link: ""
  });

  useEffect(() => {
    if (question) {
      setFormData({
        title: question.title,
        slug: question.slug,
        description: question.description,
        solution: question.solution,
        difficulty: question.difficulty,
        category: question.category,
        tier: question.tier,
        tags: question.tags || [],
        github_link: question.github_link || "",
        video_link: question.video_link || ""
      });
    } else {
      setFormData({
        title: "",
        slug: "",
        description: "",
        solution: "",
        difficulty: "Easy",
        category: "",
        tier: "Explorer",
        tags: [],
        github_link: "",
        video_link: ""
      });
    }
  }, [question, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const questionData = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        solution: formData.solution,
        difficulty: formData.difficulty,
        category: formData.category,
        tier: formData.tier,
        tags: formData.tags,
        github_link: formData.github_link || null,
        video_link: formData.video_link || null
      };

      if (question) {
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

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setFormData({ ...formData, tags });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{question ? 'Edit' : 'Add'} Coding Question</DialogTitle>
          <DialogDescription>
            {question ? 'Update the coding question details.' : 'Add a new coding question to the platform.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="url-friendly-identifier"
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="Arrays, Strings, Dynamic Programming, etc."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tier">Pricing Tier</Label>
              <Select value={formData.tier} onValueChange={(value) => setFormData({ ...formData, tier: value })}>
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="solution">Solution</Label>
            <Textarea
              id="solution"
              value={formData.solution}
              onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
              rows={8}
              required
            />
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags.join(', ')}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder="Array, Two Pointers, Sorting"
            />
          </div>

          <div>
            <Label htmlFor="github_link">GitHub Link (optional)</Label>
            <Input
              id="github_link"
              type="url"
              value={formData.github_link}
              onChange={(e) => setFormData({ ...formData, github_link: e.target.value })}
              placeholder="https://github.com/..."
            />
          </div>

          <div>
            <Label htmlFor="video_link">Video Link (optional)</Label>
            <Input
              id="video_link"
              type="url"
              value={formData.video_link}
              onChange={(e) => setFormData({ ...formData, video_link: e.target.value })}
              placeholder="https://youtube.com/..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : question ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CodingQuestionModal;
