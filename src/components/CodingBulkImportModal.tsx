import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CodingBulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CodingBulkImportModal = ({ isOpen, onClose, onSuccess }: CodingBulkImportModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [jsonData, setJsonData] = useState("");

  const exampleData = `[
  {
    "title": "Two Sum",
    "slug": "two-sum",
    "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    "difficulty": "Easy",
    "category": "Arrays",
    "tags": ["array", "hash table"],
    "tier": "Explorer",
    "solution": "Use a hash map to store each number and its index. Then, iterate through the array and check if target - num exists in the hash map.",
    "video_link": "https://www.youtube.com/watch?v=KLlXCFS5ObI",
    "github_link": "https://github.com/username/repo/blob/main/two-sum.py"
  },
  {
    "title": "Reverse Linked List",
    "slug": "reverse-linked-list",
    "description": "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    "difficulty": "Medium",
    "category": "Linked Lists",
    "tags": ["linked list", "recursion"],
    "tier": "Builder",
    "solution": "Iteratively change the next pointer of each node to point to the previous node.",
    "video_link": "https://www.youtube.com/watch?v=O0Byj0Vs4CA",
    "github_link": "https://github.com/username/repo/blob/main/reverse-linked-list.java"
  }
]`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const questions = JSON.parse(jsonData);
      
      if (!Array.isArray(questions)) {
        throw new Error("Data must be an array of questions");
      }

      const { error } = await supabase
        .from('coding_questions')
        .insert(questions);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully imported ${questions.length} coding questions`,
      });

      setJsonData("");
      onSuccess();
    } catch (error) {
      console.error('Error importing coding questions:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to import coding questions",
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
          <DialogTitle>Bulk Import Coding Questions</DialogTitle>
          <DialogDescription>
            Import multiple coding questions using JSON format. Use the example below as a reference.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="jsonData">JSON Data</Label>
            <Textarea
              id="jsonData"
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              placeholder="Paste your JSON data here..."
              rows={12}
              className="font-mono text-sm"
              required
            />
          </div>

          <div>
            <Label>Example Format:</Label>
            <div className="mt-2 p-4 bg-muted rounded-lg">
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                {exampleData}
              </pre>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Importing..." : "Import Questions"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CodingBulkImportModal;
