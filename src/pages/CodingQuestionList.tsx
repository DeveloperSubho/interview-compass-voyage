import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Code, ExternalLink, Github, Play, Search, Filter, Plus, Trash2, Edit } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface CodingQuestion {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  status: string;
  category: string;
  tags: string[];
  github_link: string | null;
  video_link: string | null;
  is_paid: boolean;
  level_unlock: string;
  created_at: string;
}

const CodingQuestionList = () => {
  const navigate = useNavigate();
  const { category } = useParams();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<CodingQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<CodingQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagsFilter, setTagsFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<CodingQuestion | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const questionsPerPage = 10;

  useEffect(() => {
    if (category) {
      fetchQuestions();
    }
  }, [category]);

  useEffect(() => {
    applyFilters();
  }, [questions, searchTerm, difficultyFilter, statusFilter, tagsFilter]);

  const fetchQuestions = async () => {
    try {
      const categoryName = category?.replace(/-/g, ' ') || '';
      const { data, error } = await supabase
        .from('coding_questions')
        .select('*')
        .ilike('category', `%${categoryName}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
      
      // Extract unique tags
      const tags = new Set<string>();
      data?.forEach(question => {
        question.tags.forEach(tag => tags.add(tag));
      });
      setAvailableTags(Array.from(tags).sort());
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Error",
        description: "Failed to load coding questions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = questions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(question =>
        question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Difficulty filter
    if (difficultyFilter !== "all") {
      filtered = filtered.filter(question => question.difficulty === difficultyFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(question => question.status === statusFilter);
    }

    // Tags filter
    if (tagsFilter !== "all") {
      filtered = filtered.filter(question => question.tags.includes(tagsFilter));
    }

    setFilteredQuestions(filtered);
    setCurrentPage(1);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Solved":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "In Progress":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "Unsolved":
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setIsQuestionModalOpen(true);
  };

  const handleEditQuestion = (question: CodingQuestion, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingQuestion(question);
    setIsQuestionModalOpen(true);
  };

  const handleDeleteQuestion = async (questionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const { error } = await supabase
        .from('coding_questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      setQuestions(questions.filter(q => q.id !== questionId));
      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedQuestions.length === 0) {
      toast({
        title: "Error",
        description: "Please select questions to delete",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedQuestions.length} questions?`)) return;

    try {
      const { error } = await supabase
        .from('coding_questions')
        .delete()
        .in('id', selectedQuestions);

      if (error) throw error;

      setQuestions(questions.filter(q => !selectedQuestions.includes(q.id)));
      setSelectedQuestions([]);
      toast({
        title: "Success",
        description: `${selectedQuestions.length} questions deleted successfully`,
      });
    } catch (error) {
      console.error('Error deleting questions:', error);
      toast({
        title: "Error",
        description: "Failed to delete questions",
        variant: "destructive",
      });
    }
  };

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedQuestions.length === currentQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(currentQuestions.map(q => q.id));
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
  const startIndex = (currentPage - 1) * questionsPerPage;
  const endIndex = startIndex + questionsPerPage;
  const currentQuestions = filteredQuestions.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading questions...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/coding")}
            className="text-muted-foreground hover:text-foreground hover:bg-accent mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
          
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent capitalize">
                {category?.replace(/-/g, ' ')} Questions
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Practice coding problems with detailed solutions and explanations.
              </p>
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <Button onClick={handleAddQuestion}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
                <Button onClick={() => setIsBulkImportOpen(true)} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Bulk Import
                </Button>
                {selectedQuestions.length > 0 && (
                  <Button onClick={handleBulkDelete} variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected ({selectedQuestions.length})
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-6xl mx-auto mb-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search questions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Solved">Solved</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Unsolved">Unsolved</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={tagsFilter} onValueChange={setTagsFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tags" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    {availableTags.map(tag => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-6xl mx-auto">
          {filteredQuestions.length === 0 ? (
            <Card className="bg-card border-border text-center py-12">
              <CardContent>
                <Code className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  No Questions Found
                </h3>
                <p className="text-muted-foreground">
                  {questions.length === 0 
                    ? "No questions available in this category yet."
                    : "No questions match your current filters."}
                </p>
                {isAdmin && questions.length === 0 && (
                  <div className="mt-4 space-x-2">
                    <Button onClick={handleAddQuestion}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Question
                    </Button>
                    <Button onClick={() => setIsBulkImportOpen(true)} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Bulk Import
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {isAdmin && (
                <div className="mb-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedQuestions.length === currentQuestions.length && currentQuestions.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                  <span className="text-sm text-muted-foreground">
                    Select all ({currentQuestions.length})
                  </span>
                </div>
              )}
              
              <div className="space-y-4 mb-8">
                {currentQuestions.map((question) => (
                  <Card 
                    key={question.id} 
                    className="bg-card border-border hover:bg-accent/70 transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(`/coding/${category}/${question.slug}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          {isAdmin && (
                            <input
                              type="checkbox"
                              checked={selectedQuestions.includes(question.id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleQuestionSelection(question.id);
                              }}
                              className="mt-1 rounded"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge className={`${getDifficultyColor(question.difficulty)} border`}>
                                {question.difficulty}
                              </Badge>
                              <Badge className={`${getStatusColor(question.status)} border`}>
                                {question.status}
                              </Badge>
                              {question.is_paid && (
                                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                                  Premium
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-foreground text-lg hover:text-blue-400 transition-colors mb-2">
                              {question.title}
                            </CardTitle>
                            <CardDescription className="text-muted-foreground line-clamp-2">
                              {question.description}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {question.github_link && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(question.github_link!, '_blank');
                              }}
                            >
                              <Github className="h-4 w-4" />
                            </Button>
                          )}
                          {question.video_link && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(question.video_link!, '_blank');
                              }}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          {isAdmin && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleEditQuestion(question, e)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={(e) => handleDeleteQuestion(question.id, e)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {question.tags.map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="bg-muted text-muted-foreground text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNumber = i + 1;
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink
                              onClick={() => setCurrentPage(pageNumber)}
                              isActive={currentPage === pageNumber}
                              className="cursor-pointer"
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      {totalPages > 5 && <PaginationEllipsis />}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>

        {/* Statistics */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="bg-card border-border">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {questions.filter(q => q.difficulty === "Easy").length}
                  </div>
                  <div className="text-muted-foreground">Easy Questions</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    {questions.filter(q => q.difficulty === "Medium").length}
                  </div>
                  <div className="text-muted-foreground">Medium Questions</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-400 mb-2">
                    {questions.filter(q => q.difficulty === "Hard").length}
                  </div>
                  <div className="text-muted-foreground">Hard Questions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <CodingQuestionModal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        onSuccess={() => {
          setIsQuestionModalOpen(false);
          fetchQuestions();
        }}
        editingQuestion={editingQuestion}
        categoryName={category?.replace(/-/g, ' ') || ''}
      />

      <CodingBulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onSuccess={() => {
          setIsBulkImportOpen(false);
          fetchQuestions();
        }}
        categoryName={category?.replace(/-/g, ' ') || ''}
      />

      <Footer />
    </div>
  );
};

export default CodingQuestionList;
