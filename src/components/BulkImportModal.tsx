
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle } from "lucide-react";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
  subcategoryId: string;
  subcategoryName: string;
}

const BulkImportModal = ({ isOpen, onClose, onImportComplete, subcategoryId, subcategoryName }: BulkImportModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [csvData, setCsvData] = useState("");
  const [loading, setLoading] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    errors: string[];
  } | null>(null);

  const handleImport = async () => {
    if (!user || !csvData.trim()) return;

    setLoading(true);
    setImportResults(null);

    try {
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Validate headers
      const requiredHeaders = ['title', 'content', 'answer', 'type', 'level'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
      }

      const questions = [];
      const errors = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        try {
          const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const question: any = {};
          
          headers.forEach((header, index) => {
            question[header] = values[index] || '';
          });

          // Validate required fields
          if (!question.title || !question.content || !question.answer || !question.type || !question.level) {
            errors.push(`Row ${i + 1}: Missing required fields`);
            continue;
          }

          // Add default values
          question.subcategory_id = subcategoryId;
          question.created_by = user.id;
          question.tier = question.tier || 'Explorer';

          questions.push(question);
        } catch (error) {
          errors.push(`Row ${i + 1}: Invalid format - ${error}`);
        }
      }

      if (questions.length === 0) {
        throw new Error('No valid questions found to import');
      }

      // Insert questions in batches
      const batchSize = 50;
      let successCount = 0;

      for (let i = 0; i < questions.length; i += batchSize) {
        const batch = questions.slice(i, i + batchSize);
        const { error } = await supabase
          .from('questions')
          .insert(batch);

        if (error) {
          errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
        } else {
          successCount += batch.length;
        }
      }

      setImportResults({
        success: successCount,
        errors
      });

      if (successCount > 0) {
        toast({
          title: "Import Completed",
          description: `Successfully imported ${successCount} questions`,
        });
        onImportComplete();
      }

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import questions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCsvData("");
    setImportResults(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import Questions - {subcategoryName}</DialogTitle>
          <DialogDescription>
            Import multiple questions using CSV format. Make sure to include all required fields.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label htmlFor="csv-format">CSV Format Example:</Label>
            <div className="mt-2 p-4 bg-muted rounded-md text-sm font-mono">
              title,content,answer,type,level,tier<br/>
              "What is React?","Explain React and its features","React is a JavaScript library...",Technical,Explorer,Explorer<br/>
              "JavaScript Closures","Explain closures in JavaScript","A closure is a function...",Technical,Builder,Builder
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Required fields: title, content, answer, type, level. Optional: tier (defaults to Explorer)
            </p>
          </div>

          <div>
            <Label htmlFor="csv-data">CSV Data:</Label>
            <Textarea
              id="csv-data"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder="Paste your CSV data here..."
              rows={12}
              className="font-mono text-sm"
            />
          </div>

          {importResults && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Import Results</span>
              </div>
              <p className="text-green-600 mb-2">
                Successfully imported: {importResults.success} questions
              </p>
              {importResults.errors.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Errors:</span>
                  </div>
                  <ul className="text-sm text-muted-foreground">
                    {importResults.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={loading || !csvData.trim()}
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
