import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Upload, BookOpen, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import AddTopicModal from "./AddTopicModal";
import BulkImportModal from "./BulkImportModal";
import ProtectedContent from "./ProtectedContent";

interface Category {
  id: string;
  name: string;
  description: string | null;
  tier: string | null;
}

interface Subcategory {
  id: string;
  name: string;
  description: string | null;
  tier: string | null;
  category_id: string | null;
}

interface Question {
  id: string;
  title: string;
  tier: string | null;
  level: string;
  type: string;
  subcategory_id: string | null;
}

interface CategorySectionProps {
  onSignInClick: () => void;
}

const CategorySection = ({ onSignInClick }: CategorySectionProps) => {
  const { isAdmin, hasAccess } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('subcategories')
        .select('*')
        .order('created_at', { ascending: false });

      if (subcategoriesError) throw subcategoriesError;
      setSubcategories(subcategoriesData || []);

      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*');

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setIsAddTopicModalOpen(false);
    setIsBulkImportModalOpen(false);
    fetchData();
  };

  const getQuestionCount = (subcategoryId: string) => {
    return questions.filter(q => q.subcategory_id === subcategoryId).length;
  };

  const canAccessContent = (tier: string | null) => {
    if (!tier) return true;
    return hasAccess(tier);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="flex gap-2">
          <Button onClick={() => setIsAddTopicModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
          <Button variant="outline" onClick={() => setIsBulkImportModalOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Bulk Import
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const categorySubcategories = subcategories.filter(sub => sub.category_id === category.id);
          const totalQuestions = categorySubcategories.reduce((sum, sub) => sum + getQuestionCount(sub.id), 0);
          const requiresUpgrade = category.tier && !canAccessContent(category.tier);

          return (
            <Card key={category.id} className={`hover:shadow-lg transition-shadow ${requiresUpgrade ? 'opacity-75' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {category.name}
                      {requiresUpgrade && <Lock className="h-4 w-4 text-muted-foreground" />}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {category.description || "Explore various topics and questions"}
                    </CardDescription>
                  </div>
                  {category.tier && (
                    <Badge variant={requiresUpgrade ? "secondary" : "default"}>
                      {category.tier}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {totalQuestions} questions • {categorySubcategories.length} subcategories
                  </div>
                  
                  <ProtectedContent 
                    requiredTier={category.tier || undefined}
                    onSignInClick={onSignInClick}
                  >
                    <Link 
                      to={`/questions/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="block"
                    >
                      <Button className="w-full">
                        Explore {category.name}
                      </Button>
                    </Link>
                  </ProtectedContent>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AddTopicModal
        isOpen={isAddTopicModalOpen}
        onClose={() => setIsAddTopicModalOpen(false)}
        onSuccess={handleSuccess}
        type="category"
      />

      <BulkImportModal
        isOpen={isBulkImportModalOpen}
        onClose={() => setIsBulkImportModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default CategorySection;
