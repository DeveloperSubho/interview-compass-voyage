
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type: "category" | "subcategory";
  categoryId?: string;
}

const AddTopicModal = ({ isOpen, onClose, onSuccess, type, categoryId }: AddTopicModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tier, setTier] = useState("Explorer");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      if (type === "category") {
        const { error } = await supabase
          .from('categories')
          .insert({
            name: name.trim(),
            description: description.trim(),
            tier
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Category added successfully",
        });
      } else {
        if (!categoryId) {
          throw new Error("Category ID is required for subcategory");
        }

        const { error } = await supabase
          .from('subcategories')
          .insert({
            name: name.trim(),
            description: description.trim(),
            tier,
            category_id: categoryId
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Topic added successfully",
        });
      }

      setName("");
      setDescription("");
      setTier("Explorer");
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding topic:', error);
      toast({
        title: "Error",
        description: `Failed to add ${type}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>
            {type === "category" ? "Add New Category" : "Add New Topic"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">
              {type === "category" ? "Category Name" : "Topic Name"}
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Enter ${type} name`}
              className="bg-slate-700 border-slate-600 text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`Enter ${type} description`}
              className="bg-slate-700 border-slate-600 text-white"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="tier">Pricing Tier</Label>
            <Select value={tier} onValueChange={setTier}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Explorer">Explorer</SelectItem>
                <SelectItem value="Voyager">Voyager</SelectItem>
                <SelectItem value="Innovator">Innovator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? "Adding..." : `Add ${type === "category" ? "Category" : "Topic"}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTopicModal;
