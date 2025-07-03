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
import { edit, trash2 as Trash2 } from "lucide-react";

interface CodingQuestion {
  id?: string;
  title: string;
  slug: string;
  description: string;
  solution: string;
  difficulty: string;
  status: string;
  category: string;
  tags: string[];
  github_link: string;
  video_link: string;
  is_paid: boolean;
  level_unlock: string;
  pricing_tier: string;
}

interface CodingQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingQuestion?: CodingQuestion | null;
  categoryName: string;
}

const CodingQuestionModal = ({ isOpen, onClose, onSuccess, editingQuestion, categoryName }: CodingQuestionModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CodingQuestion>({
    title: "",
    slug: "",
    description: "",
    solution: "",
    difficulty: "Easy",
    status: "Unsolved",
    category: categoryName,
    tags: [],
    github_link: "",
    video_link: "",
    is_paid: false,
    level_unlock: "Beginner",
    pricing_tier: "Explorer"
  });

  useEffect(() => {
    if (editingQuestion) {
      setFormData(editingQuestion);
    } else {
      setFormData({
        title: "",
        slug: "",
        description: "",
        solution: "",
        difficulty: "Easy",
        status: "Unsolved",
        category: categoryName,
        tags: [],
        github_link: "",
        video_link: "",
        is_paid: false,
        level_unlock: "Beginner",
        pricing_tier: "Explorer"
      });
    }
  }, [editingQuestion, categoryName, isOpen]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const slug = formData.slug || generateSlug(formData.title);
      const questionData = {
        ...formData,
        slug,
        tags: Array.isArray(formData.tags) ? formData.tags : []
      };

      if (editingQuestion) {
        const { error } = await supabase
          .from('coding_questions')
          .update(questionData)
          .eq('id', editingQuestion.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Question updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('coding_questions')
          .insert([questionData]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Question created successfully",
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving question:', error);
      toast({
        title: "Error",
        description: "Failed to save question",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({ ...prev, tags }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingQuestion ? 'Edit Question' : 'Add New Question'}
          </DialogTitle>
          <DialogDescription>
            {editingQuestion ? 'Update the question details below.' : 'Fill in the details to create a new coding question.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="Auto-generated from title"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="solution">Explanation</Label>
            <Textarea
              id="solution"
              value={formData.solution}
              onChange={(e) => setFormData(prev => ({ ...prev, solution: e.target.value }))}
              rows={6}
              placeholder="Provide a detailed explanation of the solution approach..."
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}>
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
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unsolved">Unsolved</SelectItem>
                  <SelectItem value="Solved">Solved</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="pricing_tier">Pricing Tier</Label>
              <Select value={formData.pricing_tier} onValueChange={(value) => setFormData(prev => ({ ...prev, pricing_tier: value }))}>
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
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder="Array, String, Dynamic Programming"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="github_link">GitHub Link</Label>
              <Input
                id="github_link"
                value={formData.github_link}
                onChange={(e) => setFormData(prev => ({ ...prev, github_link: e.target.value }))}
                placeholder="https://github.com/..."
              />
            </div>
            <div>
              <Label htmlFor="video_link">Video Link</Label>
              <Input
                id="video_link"
                value={formData.video_link}
                onChange={(e) => setFormData(prev => ({ ...prev, video_link: e.target.value }))}
                placeholder="https://youtube.com/..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : (editingQuestion ? "Update" : "Create")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CodingQuestionModal;
