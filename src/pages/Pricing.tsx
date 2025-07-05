
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserSubscription {
  id: string;
  user_id: string;
  tier: string;
  status: string;
  expires_at: string | null;
  created_at: string;
}

const Pricing = () => {
  const [selectedTier, setSelectedTier] = useState("monthly");
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCurrentSubscription();
    }
  }, [user]);

  const fetchCurrentSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setCurrentSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

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
      buttonText: "Current Plan",
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

  const handleUpgrade = async (tierName: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upgrade your plan.",
        variant: "destructive",
      });
      return;
    }

    if (currentSubscription?.tier === tierName) {
      toast({
        title: "Already Subscribed",
        description: `You are already on the ${tierName} plan.`,
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Calculate expiry date (30 days for monthly, 365 days for yearly)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + (selectedTier === "monthly" ? 30 : 365));

      if (currentSubscription) {
        // Update existing subscription
        const { error } = await supabase
          .from('user_subscriptions')
          .update({
            tier: tierName,
            expires_at: tierName === "Explorer" ? null : expiryDate.toISOString(),
            status: 'active'
          })
          .eq('id', currentSubscription.id);

        if (error) throw error;
      } else {
        // Create new subscription
        const { error } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: user.id,
            tier: tierName,
            expires_at: tierName === "Explorer" ? null : expiryDate.toISOString(),
            status: 'active'
          });

        if (error) throw error;
      }

      toast({
        title: "Success!",
        description: `Successfully upgraded to ${tierName} plan! Payment simulation completed.`,
      });

      fetchCurrentSubscription();
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      toast({
        title: "Error",
        description: "Failed to upgrade subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription || currentSubscription.tier === "Explorer") {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          tier: "Explorer",
          expires_at: null,
          status: 'active'
        })
        .eq('id', currentSubscription.id);

      if (error) throw error;

      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled. You've been moved to the Explorer plan.",
      });

      fetchCurrentSubscription();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = (tier: any) => {
    if (!user) return tier.buttonText;
    if (currentSubscription?.tier === tier.name) {
      return tier.name === "Explorer" ? "Current Plan" : "Current Plan";
    }
    return tier.buttonText;
  };

  const isCurrentPlan = (tierName: string) => {
    return currentSubscription?.tier === tierName;
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
          
          {currentSubscription && (
            <div className="mb-6">
              <Badge className="bg-green-600 text-white text-sm px-4 py-2">
                Current Plan: {currentSubscription.tier}
                {currentSubscription.expires_at && (
                  <span className="ml-2">
                    (Expires: {new Date(currentSubscription.expires_at).toLocaleDateString()})
                  </span>
                )}
              </Badge>
            </div>
          )}
          
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
            } ${isCurrentPlan(tier.name) ? "ring-2 ring-green-500" : ""}`}>
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-[#555879] text-white px-4 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              {isCurrentPlan(tier.name) && (
                <div className="absolute -top-4 right-4">
                  <Badge className="bg-green-600 text-white px-4 py-1">
                    Current Plan
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
                <div className="space-y-2">
                  <Button 
                    className={`w-full ${
                      tier.popular 
                        ? "bg-[#555879] hover:bg-[#98A1BC] text-white" 
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    } ${isCurrentPlan(tier.name) ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => handleUpgrade(tier.name)}
                    disabled={loading || isCurrentPlan(tier.name)}
                  >
                    {loading ? "Processing..." : getButtonText(tier)}
                  </Button>
                  
                  {isCurrentPlan(tier.name) && tier.name !== "Explorer" && (
                    <Button 
                      variant="outline"
                      className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={handleCancelSubscription}
                      disabled={loading}
                    >
                      {loading ? "Processing..." : "Cancel Subscription"}
                    </Button>
                  )}
                </div>
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
                disabled={loading}
              >
                {loading ? "Processing..." : "Get Started for Free"}
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
