
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CodingBulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoryName: string;
}

const CodingBulkImportModal = ({ isOpen, onClose, onSuccess, categoryName }: CodingBulkImportModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [csvData, setCsvData] = useState("");
  const [defaultPricingTier, setDefaultPricingTier] = useState("Explorer");

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !csvData.trim()) {
      toast({
        title: "Error",
        description: "Please provide CSV data to import",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const lines = csvData.trim().split('\n');

      if (lines.length === 0) {
        toast({
          title: "Error",
          description: "No data to import",
          variant: "destructive",
        });
        return;
      }

      const questions = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const columns = line.split(',').map(col => col.trim().replace(/^"|"$/g, ''));

        if (columns.length < 6) {
          toast({
            title: "Error",
            description: `Invalid format at line ${i + 1}. Expected: Title, Description, Explanation, Difficulty, Tags, GitHub Link, Video Link, Pricing Tier (optional)`,
            variant: "destructive",
          });
          return;
        }

        const tags = columns[4] ? columns[4].split(';').map(tag => tag.trim()).filter(tag => tag) : [];
        const pricingTier = columns[7] || defaultPricingTier;

        questions.push({
          title: columns[0],
          slug: generateSlug(columns[0]),
          description: columns[1],
          solution: columns[2], // This is now the explanation
          difficulty: columns[3] || 'Easy',
          status: 'Unsolved',
          category: categoryName,
          tags: tags,
          github_link: columns[5] || '',
          video_link: columns[6] || '',
          is_paid: false,
          level_unlock: 'Beginner',
          pricing_tier: pricingTier
        });
      }

      if (questions.length === 0) {
        toast({
          title: "Error",
          description: "No valid questions found to import",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('coding_questions')
        .insert(questions);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully imported ${questions.length} questions`,
      });

      setCsvData("");
      onSuccess();
    } catch (error) {
      console.error('Error importing questions:', error);
      toast({
        title: "Error",
        description: "Failed to import questions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCsvData("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import Coding Questions</DialogTitle>
          <DialogDescription>
            Import multiple coding questions at once using CSV format. Each line should contain: Title, Description, Explanation, Difficulty, Tags, GitHub Link, Video Link, Pricing Tier (optional)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="defaultPricingTier">Default Pricing Tier</Label>
            <Select value={defaultPricingTier} onValueChange={setDefaultPricingTier}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Explorer">Explorer</SelectItem>
                <SelectItem value="Builder">Builder</SelectItem>
                <SelectItem value="Innovator">Innovator</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              This tier will be used for questions that don't specify a pricing tier
            </p>
          </div>

          <div>
            <Label htmlFor="csvData">CSV Data</Label>
            <Textarea
              id="csvData"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder="Example:&#10;Two Sum, Given an array of integers find two numbers that add up to target, Use hashmap to store complement values for O(1) lookup, Easy, Array;Hash Table, https://github.com/example/two-sum, https://youtube.com/watch?v=example, Explorer&#10;Reverse String, Write a function that reverses a string, Use two pointers approach from both ends, Easy, String;Two Pointers, https://github.com/example/reverse-string, , Builder"
              rows={10}
              required
            />
            <p className="text-sm text-muted-foreground mt-2">
              Format: Title, Description, Explanation, Difficulty, Tags (separated by semicolons), GitHub Link, Video Link, Pricing Tier (optional - one question per line)
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !csvData.trim()}>
              {loading ? "Importing..." : "Import Questions"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CodingBulkImportModal;
