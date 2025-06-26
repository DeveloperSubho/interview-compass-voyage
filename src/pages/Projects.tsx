import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, Database, Globe, Layers, Server, Lock, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Projects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const categories = [
    {
      icon: Code,
      title: "Java",
      description: "Console applications, algorithms, data structures",
      projectCount: 25,
      difficulty: ["Basic", "Intermediate"],
      tier: "Explorer",
      projects: ["Calculator App", "Banking System", "Library Management"]
    },
    {
      icon: Layers,
      title: "Spring Boot",
      description: "REST APIs, microservices, enterprise applications",
      projectCount: 18,
      difficulty: ["Intermediate", "Advanced"],
      tier: "Builder",
      projects: ["E-commerce API", "Task Management", "Chat Application"]
    },
    {
      icon: Globe,
      title: "ReactJS",
      description: "Interactive web applications, component libraries",
      projectCount: 22,
      difficulty: ["Basic", "Intermediate"],
      tier: "Explorer",
      projects: ["Portfolio Website", "Todo App", "Weather Dashboard"]
    },
    {
      icon: Server,
      title: "Full-Stack",
      description: "Complete web applications with frontend and backend",
      projectCount: 15,
      difficulty: ["Advanced"],
      tier: "Innovator",
      projects: ["Social Media Platform", "E-learning Portal", "Project Management Tool"]
    },
    {
      icon: Database,
      title: "Database",
      description: "Database design, optimization, data modeling",
      projectCount: 12,
      difficulty: ["Intermediate", "Advanced"],
      tier: "Builder",
      projects: ["Inventory System", "Analytics Dashboard", "Data Pipeline"]
    }
  ];

  const featuredProjects = [
    {
      title: "Full-Stack E-commerce Platform",
      description: "Complete online shopping platform with React, Spring Boot, and PostgreSQL",
      technologies: ["React", "Spring Boot", "PostgreSQL", "Docker"],
      difficulty: "Advanced",
      tier: "Innovator",
      duration: "4-6 weeks",
      features: ["User Authentication", "Payment Integration", "Admin Dashboard", "Real-time Chat"]
    },
    {
      title: "Microservices Architecture",
      description: "Scalable microservices system with API Gateway and service discovery",
      technologies: ["Spring Boot", "Docker", "Kubernetes", "Redis"],
      difficulty: "Advanced",
      tier: "Innovator",
      duration: "6-8 weeks",
      features: ["Service Mesh", "Load Balancing", "Circuit Breaker", "Monitoring"]
    },
    {
      title: "Real-time Chat Application",
      description: "Modern chat app with WebSocket, message encryption, and file sharing",
      technologies: ["React", "Node.js", "Socket.io", "MongoDB"],
      difficulty: "Intermediate",
      tier: "Builder",
      duration: "3-4 weeks",
      features: ["Real-time Messaging", "File Upload", "Group Chat", "Message History"]
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
      case "Basic":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "Intermediate":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "Advanced":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const handleProjectClick = (project: any) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access projects.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (project.tier === "Explorer") {
      toast({
        title: "Coming Soon",
        description: `${project.title || project.title} projects will be available soon!`,
      });
    } else {
      toast({
        title: "Upgrade Required",
        description: `Upgrade to ${project.tier} tier to access these projects.`,
        variant: "destructive",
      });
      navigate("/pricing");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Real-World Projects
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Build impressive projects that showcase your skills and boost your portfolio with industry-relevant technologies.
          </p>
        </div>

        {/* Featured Projects */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
            <Star className="h-6 w-6 mr-2 text-yellow-500" />
            Featured Projects
          </h2>
          <div className="space-y-6 max-w-5xl mx-auto">
            {featuredProjects.map((project, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300">
                <CardHeader>
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-white text-xl mb-2">{project.title}</CardTitle>
                      <CardDescription className="text-slate-400">
                        {project.description}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 lg:flex-row lg:gap-3">
                      <Badge className={`${getTierColor(project.tier)} text-white`}>
                        {project.tier}
                      </Badge>
                      <Badge className={`${getDifficultyColor(project.difficulty)} border`}>
                        {project.difficulty}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, techIndex) => (
                      <Badge key={techIndex} variant="secondary" className="bg-slate-700 text-slate-300">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Duration: </span>
                      <span className="text-slate-300">{project.duration}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Features: </span>
                      <span className="text-slate-300">{project.features.length}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-slate-400 text-sm">Key Features:</span>
                    <div className="flex flex-wrap gap-2">
                      {project.features.map((feature, featureIndex) => (
                        <Badge key={featureIndex} className="bg-[#555879]/20 text-[#98A1BC] border-[#555879]/30 border text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    className={`w-full ${
                      project.tier === "Explorer" 
                        ? "bg-[#555879] hover:bg-[#98A1BC] text-white" 
                        : "bg-slate-700 hover:bg-slate-600 text-white"
                    }`}
                    onClick={() => handleProjectClick(project)}
                  >
                    {project.tier === "Explorer" ? "Start Project" : (
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

        {/* Project Categories */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-8">Project Categories</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {categories.map((category, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 bg-gradient-to-r from-[#555879] to-[#98A1BC] rounded-lg flex items-center justify-center">
                      <category.icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge className={`${getTierColor(category.tier)} text-white`}>
                      {category.tier}
                    </Badge>
                  </div>
                  <CardTitle className="text-white">{category.title}</CardTitle>
                  <CardDescription className="text-slate-400">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Projects</span>
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
                    <span className="text-slate-400 text-sm">Example Projects:</span>
                    <ul className="text-xs text-slate-300 space-y-1">
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
                      category.tier === "Explorer" 
                        ? "bg-[#555879] hover:bg-[#98A1BC] text-white" 
                        : "bg-slate-700 hover:bg-slate-600 text-white"
                    }`}
                    onClick={() => handleProjectClick(category)}
                  >
                    {category.tier === "Explorer" ? "Explore Projects" : (
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
          <Card className="bg-gradient-to-br from-[#555879] via-[#6B6B9E] to-[#98A1BC] border-none max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to Build Impressive Projects?
              </h3>
              <p className="text-white/90 mb-6">
                Get access to all project categories and build a portfolio that stands out to employers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-white text-[#555879] hover:bg-white/90"
                  onClick={() => navigate("/pricing")}
                >
                  View Pricing
                </Button>
                <Button 
                  variant="outline" 
                  className="border-white/30 text-white hover:bg-white/10 hover:border-white"
                  onClick={() => !user ? navigate("/auth") : navigate("/pricing")}
                >
                  {!user ? "Sign Up Free" : "Start Free Trial"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Projects;
