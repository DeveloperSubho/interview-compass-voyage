
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Code, Clock, Trophy } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate, useParams } from "react-router-dom";

const QuestionList = () => {
  const navigate = useNavigate();
  const { category } = useParams();

  // Sample questions data - in a real app, this would come from an API
  const sampleQuestions = [
    {
      id: 1,
      title: "What is the difference between == and === in JavaScript?",
      difficulty: "Basic",
      timeToSolve: "5 mins",
      tags: ["JavaScript", "Comparison", "Fundamentals"]
    },
    {
      id: 2,
      title: "Explain the concept of closures in JavaScript",
      difficulty: "Intermediate",
      timeToSolve: "10 mins",
      tags: ["JavaScript", "Closures", "Functions"]
    },
    {
      id: 3,
      title: "How does the event loop work in JavaScript?",
      difficulty: "Advanced",
      timeToSolve: "15 mins",
      tags: ["JavaScript", "Event Loop", "Asynchronous"]
    },
    {
      id: 4,
      title: "What are the different ways to create objects in JavaScript?",
      difficulty: "Intermediate",
      timeToSolve: "8 mins",
      tags: ["JavaScript", "Objects", "OOP"]
    },
    {
      id: 5,
      title: "Explain hoisting in JavaScript with examples",
      difficulty: "Intermediate",
      timeToSolve: "12 mins",
      tags: ["JavaScript", "Hoisting", "Variables"]
    }
  ];

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

  const handleQuestionClick = (questionId: number) => {
    navigate(`/questions/${category}/${questionId}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/questions")}
            className="text-muted-foreground hover:text-foreground hover:bg-accent mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
          
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent capitalize">
              {category?.replace(/-/g, ' ')} Questions
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Practice and master these carefully curated questions to excel in your technical interviews.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {sampleQuestions.map((question, index) => (
            <Card 
              key={question.id} 
              className="bg-card border-border hover:bg-accent/70 transition-all duration-300 cursor-pointer"
              onClick={() => handleQuestionClick(question.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-muted-foreground text-sm">#{question.id}</span>
                      <Badge className={`${getDifficultyColor(question.difficulty)} border`}>
                        {question.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-foreground text-lg hover:text-blue-400 transition-colors">
                      {question.title}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{question.timeToSolve}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {question.tags.map((tag, tagIndex) => (
                    <Badge 
                      key={tagIndex} 
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

        {/* Practice Stats */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="bg-card border-border">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {sampleQuestions.filter(q => q.difficulty === "Basic").length}
                  </div>
                  <div className="text-muted-foreground">Basic Questions</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    {sampleQuestions.filter(q => q.difficulty === "Intermediate").length}
                  </div>
                  <div className="text-muted-foreground">Intermediate Questions</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-400 mb-2">
                    {sampleQuestions.filter(q => q.difficulty === "Advanced").length}
                  </div>
                  <div className="text-muted-foreground">Advanced Questions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default QuestionList;
