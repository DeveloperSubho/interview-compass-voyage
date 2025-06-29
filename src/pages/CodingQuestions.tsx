
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, Plus, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CodingCategory {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

const CodingQuestions = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<CodingCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('coding_categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load coding categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading categories...</p>
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
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Coding Questions
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Master coding problems with detailed solutions and explanations. Choose from various categories to practice and improve your programming skills.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {categories.length === 0 ? (
            <Card className="bg-card border-border text-center py-12">
              <CardContent>
                <Code className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  No Categories Available
                </h3>
                <p className="text-muted-foreground">
                  Coding question categories will be added soon.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category) => (
                <Card 
                  key={category.id} 
                  className="bg-card border-border hover:bg-accent/70 transition-all duration-300 cursor-pointer group"
                  onClick={() => navigate(`/coding/${category.name.toLowerCase().replace(/ /g, '-')}`)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Code className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl text-foreground group-hover:text-blue-400 transition-colors">
                      {category.name}
                    </CardTitle>
                    {category.description && (
                      <CardDescription className="text-muted-foreground">
                        {category.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button 
                      variant="outline" 
                      className="w-full border-border text-foreground hover:bg-accent"
                    >
                      Explore Questions
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-[#555879]/20 to-[#98A1BC]/20 border-border max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Ready to Start Coding?
              </h3>
              <p className="text-muted-foreground mb-6">
                Practice with carefully curated coding problems and detailed solutions to ace your technical interviews.
              </p>
              <Button 
                variant="outline" 
                className="bg-[#555879] hover:bg-[#98A1BC] text-white px-8 py-3"
                onClick={() => categories.length > 0 && navigate(`/coding/${categories[0].name.toLowerCase().replace(/ /g, '-')}`)}
              >
                Start Practicing
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CodingQuestions;
