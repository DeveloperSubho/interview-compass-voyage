import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Edit, Trash2, Play, Github } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProtectedContent from "@/components/ProtectedContent";
import CodingQuestionModal from "@/components/CodingQuestionModal";
import CodingBulkImportModal from "@/components/CodingBulkImportModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface CodingQuestion {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  category: string;
  tags: string[];
  pricing_tier: string;
  video_link?: string;
  github_link?: string;
  solution: string;
  created_at: string;
}

const CodingQuestions = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<CodingQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [tierFilter, setTierFilter] = useState<string>("");
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<CodingQuestion | undefined>();
  const [questionToDelete, setQuestionToDelete] = useState<CodingQuestion | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('coding_questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching coding questions:', error);
      toast({
        title: "Error",
        description: "Failed to load coding questions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "Medium":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "Hard":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getPricingTierColor = (tier: string) => {
    switch (tier) {
      case "Explorer":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "Innovator":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "Builder":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = !difficultyFilter || question.difficulty === difficultyFilter;
    const matchesCategory = !categoryFilter || question.category === categoryFilter;
    const matchesTier = !tierFilter || question.pricing_tier === tierFilter;
    
    return matchesSearch && matchesDifficulty && matchesCategory && matchesTier;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const allCategories = [...new Set(questions.map(q => q.category))];

  const handleQuestionClick = (slug: string) => {
    navigate(`/coding/${slug}`);
  };

  const handleEditClick = (e: React.MouseEvent, question: CodingQuestion) => {
    e.stopPropagation();
    setSelectedQuestion(question);
    setIsQuestionModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, question: CodingQuestion) => {
    e.stopPropagation();
    setQuestionToDelete(question);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!questionToDelete) return;

    setDeleteLoading(true);
    try {
      const { error } = await supabase
        .from('coding_questions')
        .delete()
        .eq('id', questionToDelete.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Coding question deleted successfully",
      });

      fetchQuestions();
      setIsDeleteModalOpen(false);
      setQuestionToDelete(null);
    } catch (error) {
      console.error('Error deleting coding question:', error);
      toast({
        title: "Error",
        description: "Failed to delete coding question",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleQuestionModalSuccess = () => {
    setIsQuestionModalOpen(false);
    setSelectedQuestion(undefined);
    fetchQuestions();
  };

  const handleAddQuestion = () => {
    setSelectedQuestion(undefined);
    setIsQuestionModalOpen(true);
  };
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Coding Questions
            </h1>
            <p className="text-muted-foreground text-lg max-w-3xl">
              Practice coding problems to sharpen your algorithmic thinking and problem-solving skills.
            </p>
          </div>
          
          {isAdmin && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsBulkImportModalOpen(true)}>
                Bulk Import
              </Button>
              <Button onClick={handleAddQuestion}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Difficulties</SelectItem>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {allCategories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Tiers</SelectItem>
              <SelectItem value="Explorer">Explorer</SelectItem>
              <SelectItem value="Innovator">Innovator</SelectItem>
              <SelectItem value="Builder">Builder</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Questions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuestions.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No coding questions available
              </h3>
              <p className="text-muted-foreground">
                Questions will be added soon.
              </p>
            </div>
          ) : (
            filteredQuestions.map((question) => (
              <Card key={question.id} className="bg-card border-border hover:bg-accent/70 transition-all duration-300 relative cursor-pointer" onClick={() => handleQuestionClick(question.slug)}>
                {isAdmin && (
                  <div className="absolute top-2 right-2 z-10 flex gap-1">
                    <Button variant="outline" size="sm" className="hover:bg-blue-700" onClick={(e) => handleEditClick(e, question)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="hover:bg-red-700" onClick={(e) => handleDeleteClick(e, question)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-2 flex-wrap">
                      <Badge className={`${getDifficultyColor(question.difficulty)} border`}>
                        {question.difficulty}
                      </Badge>
                      <Badge className={`${getPricingTierColor(question.pricing_tier)} border`}>
                        {question.pricing_tier}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-foreground">{question.title}</CardTitle>
                  <CardDescription className="text-muted-foreground line-clamp-3">
                    {question.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {question.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {question.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{question.tags.length - 3} more
                        </Badge>
                      )}
                    </div>

                    {/* Links */}
                    <div className="flex gap-2">
                      {question.video_link && (
                        <Button variant="outline" size="sm" className="flex-1">
                          <Play className="h-4 w-4 mr-1" />
                          Video
                        </Button>
                      )}
                      {question.github_link && (
                        <Button variant="outline" size="sm" className="flex-1">
                          <Github className="h-4 w-4 mr-1" />
                          Code
                        </Button>
                      )}
                    </div>

                    <ProtectedContent 
                      requiredTier={isAdmin ? undefined : question.pricing_tier}
                      showUpgradeMessage={true}
                    >
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                        View Solution
                      </Button>
                    </ProtectedContent>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <CodingQuestionModal
        isOpen={isQuestionModalOpen}
        onClose={() => {
          setIsQuestionModalOpen(false);
          setSelectedQuestion(undefined);
        }}
        onSuccess={handleQuestionModalSuccess}
        question={selectedQuestion}
      />

      <CodingBulkImportModal
        isOpen={isBulkImportModalOpen}
        onClose={() => setIsBulkImportModalOpen(false)}
        onSuccess={fetchQuestions}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setQuestionToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Coding Question"
        description="Are you sure you want to delete this coding question? This action cannot be undone."
        itemName={questionToDelete?.title || ""}
        loading={deleteLoading}
      />

      <Footer />
    </div>
  );
};

export default CodingQuestions;
