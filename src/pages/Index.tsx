
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Book, Code, CheckCircle, Star, Users, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Index = () => {
  const [selectedTier, setSelectedTier] = useState("monthly");

  const features = [
    {
      icon: Book,
      title: "Interview Questions",
      description: "Comprehensive collection of technical interview questions across multiple technologies",
      categories: ["Java", "Spring Boot", "System Design", "ReactJS", "Cloud"]
    },
    {
      icon: Code,
      title: "Real-World Projects",
      description: "Hands-on projects that mirror industry scenarios and boost your portfolio",
      categories: ["Full-Stack", "Backend", "Frontend", "Database", "Microservices"]
    },
    {
      icon: Trophy,
      title: "System Design",
      description: "Master system design concepts with detailed explanations and case studies",
      categories: ["Scalability", "Architecture", "Design Patterns", "Best Practices"]
    }
  ];

  const pricingTiers = [
    {
      name: "Explorer",
      price: "Free",
      period: "",
      description: "Perfect for getting started",
      features: [
        "Basic Interview Questions",
        "Basic System Design",
        "Basic Projects",
        "Community Access"
      ],
      buttonText: "Get Started",
      popular: false
    },
    {
      name: "Builder",
      price: selectedTier === "monthly" ? "₹80" : "₹800",
      period: selectedTier === "monthly" ? "/month" : "/year",
      description: "Best for interviews",
      features: [
        "Everything in Explorer",
        "Intermediate Questions",
        "Interactive Tutorials",
        "Intermediate Projects",
        "Progress Tracking"
      ],
      buttonText: "Upgrade Plan",
      popular: true
    },
    {
      name: "Innovator",
      price: selectedTier === "monthly" ? "₹250" : "₹2500",
      period: selectedTier === "monthly" ? "/month" : "/year",
      description: "Best for career growth",
      features: [
        "Everything in Builder",
        "Advanced Questions",
        "Advanced Projects",
        "Scenario-Based Problems",
        "1-on-1 Mentoring",
        "Priority Support"
      ],
      buttonText: "Upgrade Plan",
      popular: false
    }
  ];

  const stats = [
    { label: "Active Users", value: "10K+" },
    { label: "Interview Questions", value: "500+" },
    { label: "Projects", value: "100+" },
    { label: "Success Rate", value: "85%" }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-teal-600/20"></div>
        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-6 bg-blue-600/20 text-blue-300 border-blue-500/30">
            🚀 Your Journey to Tech Excellence Starts Here
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">
            InterviewVoyage
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Master technical interviews with our comprehensive platform featuring coding questions, system design, and real-world projects
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3">
              Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-3">
              View Pricing
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-blue-400">{stat.value}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Comprehensive resources designed to help you ace technical interviews and advance your career
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                  <CardDescription className="text-slate-400">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {feature.categories.map((category, catIndex) => (
                      <Badge key={catIndex} variant="secondary" className="bg-slate-700 text-slate-300">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-slate-800/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-slate-400 text-lg mb-8">
              Select the perfect plan for your interview preparation journey
            </p>
            
            {/* Pricing Toggle */}
            <div className="inline-flex bg-slate-800 rounded-lg p-1 mb-12">
              <button
                onClick={() => setSelectedTier("monthly")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedTier === "monthly"
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedTier("yearly")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedTier === "yearly"
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Annual
                <Badge className="ml-2 bg-green-600 text-white text-xs">Save 50%</Badge>
              </button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <Card key={index} className={`relative bg-slate-800/50 border-slate-700 hover:scale-105 transition-all duration-300 ${
                tier.popular ? "ring-2 ring-blue-500 bg-slate-800/70" : ""
              }`}>
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl text-white">{tier.name}</CardTitle>
                  <CardDescription className="text-slate-400 mb-4">
                    {tier.description}
                  </CardDescription>
                  <div className="text-4xl font-bold text-white">
                    {tier.price}
                    <span className="text-lg text-slate-400 font-normal">{tier.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-slate-300">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full mt-8 ${
                      tier.popular 
                        ? "bg-blue-600 hover:bg-blue-700 text-white" 
                        : "bg-slate-700 hover:bg-slate-600 text-white"
                    }`}
                  >
                    {tier.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-12">
            <h2 className="text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of developers who have successfully landed their dream jobs with InterviewVoyage
            </p>
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3">
              Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
