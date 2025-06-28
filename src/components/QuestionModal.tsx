
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Question {
  id?: string;
  title: string;
  content: string;
  answer: string;
  type: string;
  level: string;
}

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionSaved: () => void;
  subcategoryId: string;
  subcategoryName: string;
  editingQuestion?: Question | null;
}

const QuestionModal = ({ 
  isOpen, 
  onClose, 
  onQuestionSaved, 
  subcategoryId, 
  subcategoryName,
  editingQuestion 
}: QuestionModalProps) => {
  const [title, setTitle] = useState("");
  const [answer, setAnswer] = useState("");
  const [type, setType] = useState("");
  const [level, setLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const levels = ["Explorer", "Builder", "Innovator"];
  const types = [
    "Basic Java",
    "Advanced Java", 
    "Collection Framework",
    "Errors and Exception",
    "JPA JDBC Hibernate",
    "Java Versions",
    "Unit Testing",
    "Asynchronous Programming"
  ];

  useEffect(() => {
    if (editingQuestion) {
      setTitle(editingQuestion.title);
      setAnswer(editingQuestion.answer);
      setType(editingQuestion.type);
      setLevel(editingQuestion.level);
    } else {
      setTitle("");
      setAnswer("");
      setType("");
      setLevel("");
    }
  }, [editingQuestion, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !answer.trim() || !type || !level) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const questionData = {
        subcategory_id: subcategoryId,
        title: title.trim(),
        content: title.trim(), // Use title as content since we removed content field
        answer: answer.trim(),
        type,
        level,
        tier: level // Set tier same as level
      };

      if (editingQuestion?.id) {
        // Update existing question
        const { error } = await supabase
          .from('questions')
          .update(questionData)
          .eq('id', editingQuestion.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Question updated successfully",
        });
      } else {
        // Insert new question
        const { error } = await supabase
          .from('questions')
          .insert(questionData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Question added successfully",
        });
      }

      onQuestionSaved();
      onClose();
    } catch (error) {
      console.error('Error saving question:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingQuestion ? 'update' : 'add'} question`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-800 border-slate-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center text-white">
            {editingQuestion ? 'Edit Question' : `Add Question to ${subcategoryName}`}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-300">Question Title</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Enter the question title"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-slate-300">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {types.map((t) => (
                    <SelectItem key={t} value={t} className="text-white hover:bg-slate-600">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="level" className="text-slate-300">Level</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {levels.map((l) => (
                    <SelectItem key={l} value={l} className="text-white hover:bg-slate-600">
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="answer" className="text-slate-300">Answer</Label>
            <Textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Detailed answer with explanations. You can use markdown formatting and include image URLs."
              rows={8}
              required
            />
            <p className="text-xs text-slate-400">
              Tip: You can use markdown formatting and include image URLs directly in the answer text.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button"
              variant="outline" 
              onClick={onClose}
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={loading}
            >
              {loading ? "Saving..." : (editingQuestion ? "Update Question" : "Add Question")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionModal;
