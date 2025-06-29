
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Pricing = () => {
  const [selectedTier, setSelectedTier] = useState("monthly");
  const { user } = useAuth();
  const { toast } = useToast();

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

  const handleUpgrade = (tierName: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upgrade your plan.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Coming Soon",
      description: `${tierName} plan upgrade will be available soon!`,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Select the perfect plan for your interview preparation journey
          </p>
          
          {/* Pricing Toggle */}
          <div className="inline-flex bg-card rounded-lg p-1 mb-12 border border-border">
            <button
              onClick={() => setSelectedTier("monthly")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                selectedTier === "monthly"
                  ? "bg-[#555879] text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedTier("yearly")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                selectedTier === "yearly"
                  ? "bg-[#555879] text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Annual
              <Badge className="ml-2 bg-green-600 text-white text-xs">Save 50%</Badge>
            </button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <Card key={index} className={`relative bg-card border-border hover:scale-105 transition-all duration-300 ${
              tier.popular ? "ring-2 ring-[#555879] bg-card/70" : ""
            }`}>
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-[#555879] text-white px-4 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl text-foreground">{tier.name}</CardTitle>
                <CardDescription className="text-muted-foreground mb-4">
                  {tier.description}
                </CardDescription>
                <div className="text-4xl font-bold text-foreground">
                  {tier.price}
                  <span className="text-lg text-muted-foreground font-normal">{tier.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-foreground">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full mt-8 ${
                    tier.popular 
                      ? "bg-[#555879] hover:bg-[#98A1BC] text-white" 
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                  onClick={() => handleUpgrade(tier.name)}
                >
                  {tier.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-[#555879]/20 to-[#98A1BC]/20 border-border max-w-2xl mx-auto bg-[#9294b2]">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to Start Your Journey?
              </h3>
              <p className="text-slate-300 mb-6">
                Join thousands of developers who have successfully landed their dream jobs with InterviewVoyage
              </p>
              <Button 
                variant="outline" 
                className="bg-[#555879] hover:bg-[#98A1BC] text-white px-8 py-3"
                onClick={() => handleUpgrade("Builder")}
              >
                Get Started for Free
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Pricing;
