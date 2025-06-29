
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderOpen, Code, Database, Layers, Coffee, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProjectCategory {
  name: string;
  icon: React.ReactNode;
  description: string;
  count: number;
  color: string;
}

const Projects = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projectCounts, setProjectCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectCounts();
  }, []);

  const fetchProjectCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('type');

      if (error) throw error;

      const counts: Record<string, number> = {};
      data?.forEach(project => {
        counts[project.type] = (counts[project.type] || 0) + 1;
      });

      setProjectCounts(counts);
    } catch (error) {
      console.error('Error fetching project counts:', error);
      toast({
        title: "Error",
        description: "Failed to load project statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const projectCategories: ProjectCategory[] = [
    {
      name: "Java",
      icon: <Coffee className="h-8 w-8" />,
      description: "Core Java projects focusing on fundamentals and advanced concepts",
      count: projectCounts["Java"] || 0,
      color: "from-orange-500 to-red-500"
    },
    {
      name: "Spring Boot",
      icon: <Zap className="h-8 w-8" />,
      description: "Enterprise-level Spring Boot applications and microservices",
      count: projectCounts["Spring Boot"] || 0,
      color: "from-green-500 to-emerald-500"
    },
    {
      name: "ReactJS",
      icon: <Code className="h-8 w-8" />,
      description: "Modern React applications with hooks, context, and state management",
      count: projectCounts["ReactJS"] || 0,
      color: "from-blue-500 to-cyan-500"
    },
    {
      name: "Full-Stack",
      icon: <Layers className="h-8 w-8" />,
      description: "Complete full-stack applications combining frontend and backend",
      count: projectCounts["Full-Stack"] || 0,
      color: "from-purple-500 to-pink-500"
    },
    {
      name: "Database",
      icon: <Database className="h-8 w-8" />,
      description: "Database design, optimization, and data management projects",
      count: projectCounts["Database"] || 0,
      color: "from-indigo-500 to-blue-500"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading projects...</p>
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
            Practice Projects
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Build real-world projects to enhance your skills and create an impressive portfolio. 
            Choose from various categories and difficulty levels.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {projectCategories.filter(category => category.count > 0).length === 0 ? (
            <Card className="bg-card border-border text-center py-12">
              <CardContent>
                <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  No Projects Available
                </h3>
                <p className="text-muted-foreground">
                  Projects will be added soon. Check back later for exciting practice opportunities!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projectCategories.map((category) => (
                <Card 
                  key={category.name} 
                  className="bg-card border-border hover:bg-accent/70 transition-all duration-300 cursor-pointer group"
                  onClick={() => navigate(`/projects/${category.name}`)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <div className="text-white">
                        {category.icon}
                      </div>
                    </div>
                    <CardTitle className="text-xl text-foreground group-hover:text-blue-400 transition-colors">
                      {category.name}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">
                        {category.count} {category.count === 1 ? 'Project' : 'Projects'}
                      </Badge>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full border-border text-foreground hover:bg-accent"
                      disabled={category.count === 0}
                    >
                      {category.count === 0 ? 'Coming Soon' : 'Explore Projects'}
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
                Ready to Build Something Amazing?
              </h3>
              <p className="text-muted-foreground mb-6">
                Start with projects that match your skill level and gradually work your way up to more complex challenges.
              </p>
              <Button 
                variant="outline" 
                className="bg-[#555879] hover:bg-[#98A1BC] text-white px-8 py-3"
                onClick={() => {
                  const availableCategory = projectCategories.find(cat => cat.count > 0);
                  if (availableCategory) {
                    navigate(`/projects/${availableCategory.name}`);
                  }
                }}
                disabled={projectCategories.every(cat => cat.count === 0)}
              >
                Start Building
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Projects;
