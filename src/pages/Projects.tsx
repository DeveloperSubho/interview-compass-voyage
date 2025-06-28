
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, Database, Globe, Layers, Server, Lock, Star, ExternalLink } from "lucide-react";
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
}

const Projects = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Get user's subscription tier - for now defaulting to Explorer
  const userTier = 'Explorer'; // This should come from user subscription data

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
      projectCount: projects.filter(p => p.type.toLowerCase().includes('java')).length,
      difficulty: ["Explorer", "Builder"],
      tier: "Explorer",
      projects: ["Calculator App", "Banking System", "Library Management"]
    },
    {
      icon: Layers,
      title: "Spring Boot",
      description: "REST APIs, microservices, enterprise applications",
      projectCount: projects.filter(p => p.type.toLowerCase().includes('spring')).length,
      difficulty: ["Builder", "Innovator"],
      tier: "Builder",
      projects: ["E-commerce API", "Task Management", "Chat Application"]
    },
    {
      icon: Globe,
      title: "ReactJS",
      description: "Interactive web applications, component libraries",
      projectCount: projects.filter(p => p.type.toLowerCase().includes('react')).length,
      difficulty: ["Explorer", "Builder"],
      tier: "Explorer",
      projects: ["Portfolio Website", "Todo App", "Weather Dashboard"]
    },
    {
      icon: Server,
      title: "Full-Stack",
      description: "Complete web applications with frontend and backend",
      projectCount: projects.filter(p => p.type.toLowerCase().includes('full')).length,
      difficulty: ["Innovator"],
      tier: "Innovator",
      projects: ["Social Media Platform", "E-learning Portal", "Project Management Tool"]
    },
    {
      icon: Database,
      title: "Database",
      description: "Database design, optimization, data modeling",
      projectCount: projects.filter(p => p.type.toLowerCase().includes('database')).length,
      difficulty: ["Builder", "Innovator"],
      tier: "Builder",
      projects: ["Inventory System", "Analytics Dashboard", "Data Pipeline"]
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

    // Admin can access project management page
    if (profile?.is_admin) {
      navigate("/admin/projects");
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

  const accessibleProjects = projects.filter(project => 
    profile?.is_admin || canAccessProject(project.level)
  );

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

        {/* Featured Projects */}
        {accessibleProjects.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center">
              <Star className="h-6 w-6 mr-2 text-yellow-500" />
              Featured Projects
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
              {accessibleProjects.slice(0, 4).map((project) => (
                <Card key={project.id} className="bg-card border-border hover:bg-accent/50 transition-all duration-300">
                  <CardHeader>
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-foreground text-xl mb-2">{project.title}</CardTitle>
                        <CardDescription className="text-muted-foreground">
                          {project.description}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className={`${getTierColor(project.level)} text-white`}>
                          {project.level}
                        </Badge>
                        <Badge className={`${getDifficultyColor(project.level)} border`}>
                          {project.type}
                        </Badge>
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
                      className="w-full bg-[#555879] hover:bg-[#98A1BC] text-white"
                      onClick={() => handleProjectClick(project)}
                    >
                      {project.github_url ? (
                        <>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View on GitHub
                        </>
                      ) : (
                        "Start Project"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Project Categories */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-8">Project Categories</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {categories.map((category, index) => (
              <Card key={index} className="bg-card border-border hover:bg-accent/50 transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 bg-gradient-to-r from-[#555879] to-[#98A1BC] rounded-lg flex items-center justify-center">
                      <category.icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge className={`${getTierColor(category.tier)} text-white`}>
                      {category.tier}
                    </Badge>
                  </div>
                  <CardTitle className="text-foreground">{category.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground text-sm">Projects</span>
                    <span className="text-blue-400 font-semibold">{category.projectCount}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {category.difficulty.map((level, levelIndex) => (
                      <Badge 
                        key={levelIndex} 
                        className={`${getDifficultyColor(level)} border`}
                      >
                        {level}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-muted-foreground text-sm">Example Projects:</span>
                    <ul className="text-xs text-foreground space-y-1">
                      {category.projects.map((project, projectIndex) => (
                        <li key={projectIndex} className="flex items-center">
                          <div className="h-1 w-1 bg-blue-400 rounded-full mr-2"></div>
                          {project}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button 
                    className={`w-full ${
                      canAccessProject(category.tier) || profile?.is_admin
                        ? "bg-[#555879] hover:bg-[#98A1BC] text-white" 
                        : "bg-muted hover:bg-muted/80 text-muted-foreground"
                    }`}
                    onClick={() => handleCategoryClick(category)}
                  >
                    {canAccessProject(category.tier) || profile?.is_admin ? (
                      profile?.is_admin ? "Manage Projects" : "Explore Projects"
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Upgrade to Access
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
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
