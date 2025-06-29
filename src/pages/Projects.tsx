
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, Database, Globe, Layers, Server, Lock, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Project {
  id: string;
  title: string;
  description: string;
  github_url?: string;
  type: string;
  level: string;
  technologies: string[];
  duration?: string;
  key_features: string[];
  section?: string;
}

const Projects = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Get user's subscription tier
  const userTier = profile?.tier || 'Explorer';

  const getTierAccess = (userTier: string) => {
    switch (userTier) {
      case 'Explorer':
        return ['Explorer'];
      case 'Builder':
        return ['Explorer', 'Builder'];
      case 'Innovator':
        return ['Explorer', 'Builder', 'Innovator'];
      default:
        return ['Explorer'];
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    {
      icon: Code,
      title: "Java",
      description: "Console applications, algorithms, data structures",
      difficulty: ["Explorer", "Builder"],
      tier: "Explorer",
      section: "java"
    },
    {
      icon: Layers,
      title: "Spring Boot",
      description: "REST APIs, microservices, enterprise applications",
      difficulty: ["Builder", "Innovator"],
      tier: "Builder",
      section: "spring"
    },
    {
      icon: Globe,
      title: "ReactJS",
      description: "Interactive web applications, component libraries",
      difficulty: ["Explorer", "Builder"],
      tier: "Explorer",
      section: "react"
    },
    {
      icon: Server,
      title: "Full-Stack",
      description: "Complete web applications with frontend and backend",
      difficulty: ["Innovator"],
      tier: "Innovator",
      section: "fullstack"
    },
    {
      icon: Database,
      title: "Database",
      description: "Database design, optimization, data modeling",
      difficulty: ["Builder", "Innovator"],
      tier: "Builder",
      section: "database"
    }
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Explorer":
        return "bg-green-600";
      case "Builder":
        return "bg-[#555879]";
      case "Innovator":
        return "bg-purple-600";
      default:
        return "bg-gray-600";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Explorer":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "Builder":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "Innovator":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const canAccessProject = (projectLevel: string) => {
    const accessibleTiers = getTierAccess(userTier);
    return profile?.is_admin || accessibleTiers.includes(projectLevel);
  };

  const handleProjectClick = (project: Project) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (canAccessProject(project.level)) {
      if (project.github_url) {
        window.open(project.github_url, '_blank');
      } else {
        toast({
          title: "Project Available",
          description: `${project.title} is accessible to you.`,
        });
      }
    } else {
      toast({
        title: "Upgrade Required",
        description: `Upgrade to ${project.level} tier to access this project.`,
        variant: "destructive",
      });
      navigate("/pricing");
    }
  };

  const handleCategoryClick = (category: any) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    // Admin can access project management page with section filter
    if (profile?.is_admin) {
      navigate(`/admin/projects?section=${category.section}`);
      return;
    }

    if (canAccessProject(category.tier)) {
      toast({
        title: "Coming Soon",
        description: `${category.title} projects will be available soon!`,
      });
    } else {
      toast({
        title: "Upgrade Required",
        description: `Upgrade to ${category.tier} tier to access these projects.`,
        variant: "destructive",
      });
      navigate("/pricing");
    }
  };

  const handleCtaClick = () => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      navigate("/pricing");
    }
  };

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
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Real-World Projects
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Build impressive projects that showcase your skills and boost your portfolio with industry-relevant technologies.
          </p>
        </div>

        {/* Project Categories with their respective projects */}
        <div className="space-y-12">
          {categories.map((category, index) => {
            const categoryProjects = projects.filter(p => p.section === category.section);
            
            return (
              <div key={index}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-gradient-to-r from-[#555879] to-[#98A1BC] rounded-lg flex items-center justify-center mr-4">
                      <category.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{category.title}</h2>
                      <p className="text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getTierColor(category.tier)} text-white`}>
                      {category.tier}
                    </Badge>
                    {profile?.is_admin && (
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleCategoryClick(category)}
                        className="border-border text-foreground hover:bg-accent"
                      >
                        Manage Projects
                      </Button>
                    )}
                  </div>
                </div>

                {categoryProjects.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryProjects.map((project) => (
                      <Card key={project.id} className={`bg-card border-border transition-all duration-300 ${
                        canAccessProject(project.level) ? 'hover:bg-accent/50 cursor-pointer' : 'opacity-75 cursor-not-allowed'
                      }`}>
                        <CardHeader>
                          <div className="flex flex-col gap-4">
                            <div className="flex-1">
                              <CardTitle className="text-foreground text-xl mb-2">{project.title}</CardTitle>
                              <CardDescription className="text-muted-foreground">
                                {project.description}
                              </CardDescription>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Badge className={`${getTierColor(project.level)} text-white`}>
                                {project.level}
                              </Badge>
                              <Badge className={`${getDifficultyColor(project.level)} border`}>
                                {project.type}
                              </Badge>
                              {!canAccessProject(project.level) && !profile?.is_admin && (
                                <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                                  Upgrade Required
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            {project.technologies.map((tech, techIndex) => (
                              <Badge key={techIndex} variant="secondary" className="bg-muted text-muted-foreground">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                          
                          {project.duration && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Duration: </span>
                              <span className="text-foreground">{project.duration}</span>
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <span className="text-muted-foreground text-sm">Key Features:</span>
                            <div className="flex flex-wrap gap-2">
                              {project.key_features.slice(0, 3).map((feature, featureIndex) => (
                                <Badge key={featureIndex} className="bg-[#555879]/20 text-[#98A1BC] border-[#555879]/30 border text-xs">
                                  {feature}
                                </Badge>
                              ))}
                              {project.key_features.length > 3 && (
                                <Badge className="bg-[#555879]/20 text-[#98A1BC] border-[#555879]/30 border text-xs">
                                  +{project.key_features.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <Button 
                            className={`w-full ${
                              canAccessProject(project.level) 
                                ? "bg-[#555879] hover:bg-[#98A1BC] text-white" 
                                : "bg-muted hover:bg-muted/80 text-muted-foreground cursor-not-allowed"
                            }`}
                            onClick={() => handleProjectClick(project)}
                            disabled={!canAccessProject(project.level) && !profile?.is_admin}
                          >
                            {project.github_url && canAccessProject(project.level) ? (
                              <>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View on GitHub
                              </>
                            ) : canAccessProject(project.level) ? (
                              "Start Project"
                            ) : (
                              <>
                                <Lock className="h-4 w-4 mr-2" />
                                Upgrade Required
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-card border-border">
                    <CardContent className="text-center py-16">
                      <div className="text-6xl mb-4">🚀</div>
                      <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                        No {category.title} Projects Available
                      </h3>
                      <p className="text-muted-foreground mb-4">Projects will appear here once they are added.</p>
                      {profile?.is_admin && (
                        <Button 
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleCategoryClick(category)}
                        >
                          Add Projects
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="bg-[#9294b2] border-none max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to Build Impressive Projects?
              </h3>
              <p className="text-white/90 mb-6">
                Get access to all project categories and build a portfolio that stands out to employers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="outline" 
                  className="bg-white text-[#555879] hover:bg-white/10 hover:border-white"
                  onClick={() => navigate("/pricing")}
                >
                  View Pricing
                </Button>
                <Button 
                  variant="outline" 
                  className="border-white/30 text-[#555879] hover:bg-white/10 hover:border-white"
                  onClick={handleCtaClick}
                >
                  {!user ? "Sign Up Free" : "Start Free Trial"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default Projects;
