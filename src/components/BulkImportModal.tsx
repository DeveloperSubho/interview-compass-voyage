
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
  subcategoryId: string;
  subcategoryName: string;
}

interface ImportQuestion {
  title: string;
  content: string;
  answer: string;
  type: string;
  level: "Basic" | "Intermediate" | "Advanced";
}

const BulkImportModal = ({ 
  isOpen, 
  onClose, 
  onImportComplete, 
  subcategoryId, 
  subcategoryName 
}: BulkImportModalProps) => {
  const [jsonData, setJsonData] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const exampleFormat = `[
  {
    "title": "What is encapsulation in Java?",
    "content": "Explain the concept of encapsulation in object-oriented programming.",
    "answer": "Encapsulation is one of the fundamental principles of object-oriented programming...",
    "type": "Basic Java",
    "level": "Basic"
  },
  {
    "title": "Explain Java Stream API",
    "content": "What is Stream API and how does it work in Java 8+?",
    "answer": "Stream API provides a functional approach to processing collections...",
    "type": "Advanced Java", 
    "level": "Intermediate"
  }
]`;

  const handleImport = async () => {
    if (!jsonData.trim()) {
      toast({
        title: "Error",
        description: "Please provide JSON data to import",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const questions: ImportQuestion[] = JSON.parse(jsonData);
      
      if (!Array.isArray(questions)) {
        throw new Error("JSON must be an array of questions");
      }

      // Validate each question
      for (const question of questions) {
        if (!question.title || !question.content || !question.answer || !question.type || !question.level) {
          throw new Error("Each question must have title, content, answer, type, and level");
        }
        
        if (!["Basic", "Intermediate", "Advanced"].includes(question.level)) {
          throw new Error("Level must be 'Basic', 'Intermediate', or 'Advanced'");
        }
      }

      // Insert questions into database
      const questionsToInsert = questions.map(q => ({
        subcategory_id: subcategoryId,
        title: q.title,
        content: q.content,
        answer: q.answer,
        type: q.type,
        level: q.level
      }));

      const { error } = await supabase
        .from('questions')
        .insert(questionsToInsert);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully imported ${questions.length} questions`,
      });

      setJsonData("");
      onImportComplete();
      onClose();
    } catch (error) {
      console.error('Error importing questions:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to import questions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-slate-800 border-slate-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center text-white">
            Bulk Import Questions for {subcategoryName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-300">JSON Format Example:</Label>
            <div className="bg-slate-900 p-4 rounded-lg">
              <pre className="text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap">
                {exampleFormat}
              </pre>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jsonData" className="text-slate-300">
              Paste your JSON data here:
            </Label>
            <Textarea
              id="jsonData"
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white font-mono text-sm"
              placeholder="Paste your JSON array of questions here..."
              rows={12}
            />
          </div>

          <div className="bg-slate-900/50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-slate-300 mb-2">Required Fields:</h4>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• <strong>title</strong>: Question title</li>
              <li>• <strong>content</strong>: Question description/details</li>
              <li>• <strong>answer</strong>: Complete answer with explanations</li>
              <li>• <strong>type</strong>: One of: Basic Java, Advanced Java, Collection Framework, etc.</li>
              <li>• <strong>level</strong>: Must be "Basic", "Intermediate", or "Advanced"</li>
            </ul>
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
              onClick={handleImport}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? "Importing..." : "Import Questions"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkImportModal;
