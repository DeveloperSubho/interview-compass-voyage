
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Github, Play, Image as ImageIcon, Plus, Edit, Trash2, Upload } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProtectedContent from "@/components/ProtectedContent";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import SystemDesignModal from "@/components/SystemDesignModal";
import SystemDesignBulkImportModal from "@/components/SystemDesignBulkImportModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

interface SystemDesignProblem {
  id: string;
  title: string;
  slug: string;
  description: string;
  requirement_discussion: string | null;
  solution: string | null;
  design_image: string | null;
  video_link: string | null;
  github_link: string | null;
  tags: string[];
  difficulty: string;
  pricing_tier: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const SystemDesign = () => {
  const { user, isAdmin, hasAccess } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [problems, setProblems] = useState<SystemDesignProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("");
  const [tierFilter, setTierFilter] = useState<string>("");
  const [tagFilter, setTagFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<SystemDesignProblem | undefined>();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [problemToDelete, setProblemToDelete] = useState<SystemDesignProblem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const { data, error } = await supabase
        .from('system_design_problems')
        .select('*')
        .eq('status', 'Published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProblems(data || []);
    } catch (error) {
      console.error('Error fetching system design problems:', error);
      toast({
        title: "Error",
        description: "Failed to load system design problems",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!problemToDelete) return;
    
    setDeleteLoading(true);
    try {
      const { error } = await supabase
        .from('system_design_problems')
        .delete()
        .eq('id', problemToDelete.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "System design problem deleted successfully",
      });

      fetchProblems();
      setDeleteModalOpen(false);
      setProblemToDelete(null);
    } catch (error) {
      console.error('Error deleting system design problem:', error);
      toast({
        title: "Error",
        description: "Failed to delete system design problem",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
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
      case "Builder":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      case "Innovator":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = !difficultyFilter || difficultyFilter === "All" || problem.difficulty === difficultyFilter;
    const matchesTier = !tierFilter || tierFilter === "All" || problem.pricing_tier === tierFilter;
    const matchesTag = !tagFilter || tagFilter === "All" || problem.tags.some(tag =>
      tag.toLowerCase().includes(tagFilter.toLowerCase())
    );
    
    return matchesSearch && matchesDifficulty && matchesTier && matchesTag;
  }).sort((a, b) => {
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const allTags = [...new Set(problems.flatMap(p => p.tags))];

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading system design problems...</p>
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              System Design Problems
            </h1>
            <p className="text-muted-foreground text-lg max-w-3xl">
              Learn system design through real-world case studies and problems. Master scalable architecture patterns and design principles.
            </p>
          </div>
          
          {isAdmin && (
            <div className="flex gap-2">
              <Button onClick={() => setIsBulkImportOpen(true)} variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Bulk Import
              </Button>
              <Button onClick={() => {
                setEditingProblem(undefined);
                setIsModalOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Problem
              </Button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search problems..."
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
              <SelectItem value="All">All Difficulties</SelectItem>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>

          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Tiers</SelectItem>
              <SelectItem value="Explorer">Explorer</SelectItem>
              <SelectItem value="Builder">Builder</SelectItem>
              <SelectItem value="Innovator">Innovator</SelectItem>
            </SelectContent>
          </Select>

          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Tags</SelectItem>
              {allTags.map(tag => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Date Created</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Problems Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProblems.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No system design problems available
              </h3>
              <p className="text-muted-foreground">
                Problems will be added soon.
              </p>
            </div>
          ) : (
            filteredProblems.map((problem) => (
              <Card 
                key={problem.id} 
                className="bg-card border-border hover:bg-accent/70 transition-all duration-300 relative cursor-pointer"
                onClick={() => navigate(`/system-design/${problem.slug}`)}
              >
                {isAdmin && (
                  <div className="absolute top-2 right-2 z-10 flex gap-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="hover:bg-blue-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProblem(problem);
                        setIsModalOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="hover:bg-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProblemToDelete(problem);
                        setDeleteModalOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-2 flex-wrap">
                      <Badge className={`${getDifficultyColor(problem.difficulty)} border`}>
                        {problem.difficulty}
                      </Badge>
                      <Badge className={`${getPricingTierColor(problem.pricing_tier)} border`}>
                        {problem.pricing_tier}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-foreground">{problem.title}</CardTitle>
                  <CardDescription className="text-muted-foreground line-clamp-3">
                    {problem.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {problem.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {problem.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{problem.tags.length - 3} more
                        </Badge>
                      )}
                    </div>

                    {/* Design Image Preview */}
                    {problem.design_image && (
                      <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}

                    {/* Links */}
                    <div className="flex gap-2">
                      {problem.video_link && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(problem.video_link!, '_blank');
                          }}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Video
                        </Button>
                      )}
                      {problem.github_link && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(problem.github_link!, '_blank');
                          }}
                        >
                          <Github className="h-4 w-4 mr-1" />
                          Code
                        </Button>
                      )}
                    </div>

                    <ProtectedContent 
                      requiredTier={isAdmin ? undefined : problem.pricing_tier}
                      showUpgradeMessage={true}
                    >
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/system-design/${problem.slug}`);
                        }}
                      >
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

      <SystemDesignModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProblem(undefined);
        }}
        onSuccess={() => {
          setIsModalOpen(false);
          setEditingProblem(undefined);
          fetchProblems();
        }}
        problem={editingProblem}
      />

      <SystemDesignBulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onSuccess={() => {
          setIsBulkImportOpen(false);
          fetchProblems();
        }}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setProblemToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete System Design Problem"
        description="Are you sure you want to delete this system design problem? This action cannot be undone."
        itemName={problemToDelete?.title || ""}
        loading={deleteLoading}
      />

      <Footer />
    </div>
  );
};

export default SystemDesign;
