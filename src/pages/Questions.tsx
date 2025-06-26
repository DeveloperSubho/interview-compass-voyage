
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Book, Code, Database, Cloud, MessageSquare, Layers, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Questions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const categories = [
    {
      icon: Code,
      title: "Java",
      description: "Core Java concepts, OOP, collections, multithreading",
      questionCount: 120,
      difficulty: ["Basic", "Intermediate", "Advanced"],
      tier: "Explorer"
    },
    {
      icon: Layers,
      title: "Spring & Spring Boot",
      description: "Framework concepts, dependency injection, REST APIs",
      questionCount: 95,
      difficulty: ["Intermediate", "Advanced"],
      tier: "Builder"
    },
    {
      icon: Database,
      title: "System Design",
      description: "Scalability, architecture patterns, distributed systems",
      questionCount: 60,
      difficulty: ["Intermediate", "Advanced"],
      tier: "Builder"
    },
    {
      icon: Book,
      title: "Design Patterns",
      description: "Common patterns, implementation strategies",
      questionCount: 45,
      difficulty: ["Advanced"],
      tier: "Innovator"
    },
    {
      icon: Code,
      title: "ReactJS",
      description: "Component lifecycle, hooks, state management",
      questionCount: 80,
      difficulty: ["Basic", "Intermediate"],
      tier: "Explorer"
    },
    {
      icon: MessageSquare,
      title: "Message Queues",
      description: "Apache Kafka, RabbitMQ, event-driven architecture",
      questionCount: 35,
      difficulty: ["Advanced"],
      tier: "Innovator"
    },
    {
      icon: Cloud,
      title: "Cloud",
      description: "AWS, Azure, microservices, containerization",
      questionCount: 70,
      difficulty: ["Intermediate", "Advanced"],
      tier: "Builder"
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

  const handleCategoryClick = (category: any) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access questions.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (category.tier === "Explorer") {
      toast({
        title: "Coming Soon",
        description: `${category.title} questions will be available soon!`,
      });
    } else {
      toast({
        title: "Upgrade Required",
        description: `Upgrade to ${category.tier} tier to access ${category.title} questions.`,
        variant: "destructive",
      });
      navigate("/pricing");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Interview Questions
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Master technical interviews with our comprehensive collection of questions across multiple technologies and difficulty levels.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <span className="text-slate-300 text-sm">Questions</span>
                  <span className="text-blue-400 font-semibold">{category.questionCount}</span>
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
                
                <Button 
                  className={`w-full ${
                    category.tier === "Explorer" 
                      ? "bg-green-600 hover:bg-green-700" 
                      : "bg-slate-700 hover:bg-slate-600"
                  }`}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category.tier === "Explorer" ? "Start Learning" : (
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

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-[#555879]/20 to-[#98A1BC]/20 border-slate-700 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to Master Technical Interviews?
              </h3>
              <p className="text-slate-300 mb-6">
                Get unlimited access to all question categories with our premium plans.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-[#555879] hover:bg-[#98A1BC]"
                  onClick={() => navigate("/pricing")}
                >
                  View Pricing
                </Button>
                <Button 
                  variant="outline" 
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
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

export default Questions;
