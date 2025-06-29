
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subcategoryId: string;
}

const BulkImportModal = ({ isOpen, onClose, onSuccess, subcategoryId }: BulkImportModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [csvData, setCsvData] = useState("");

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
        
        if (columns.length < 5) {
          toast({
            title: "Error",
            description: `Invalid format at line ${i + 1}. Expected: Title, Content, Answer, Type, Level`,
            variant: "destructive",
          });
          return;
        }

        questions.push({
          title: columns[0],
          content: columns[1],
          answer: columns[2],
          type: columns[3],
          level: columns[4],
          subcategory_id: subcategoryId,
          created_by: user.id,
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
        .from('questions')
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
          <DialogTitle>Bulk Import Questions</DialogTitle>
          <DialogDescription>
            Import multiple questions at once using CSV format. Each line should contain: Title, Content, Answer, Type, Level
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="csvData">CSV Data</Label>
            <Textarea
              id="csvData"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder="Example:&#10;What is Java?, Java is a programming language, Java is an object-oriented programming language..., Technical, Basic&#10;Explain OOP, Object-oriented programming concepts, OOP includes encapsulation inheritance..., Conceptual, Intermediate"
              rows={10}
              required
            />
            <p className="text-sm text-muted-foreground mt-2">
              Format: Title, Content, Answer, Type, Level (one question per line)
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

export default BulkImportModal;
