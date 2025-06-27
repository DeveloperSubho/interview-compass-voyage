import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, BookOpen, Users, Trophy, Star, ArrowRight, CheckCircle, Zap, Target, Award } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleGetStarted = () => {
    if (user) {
      navigate("/questions");
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleStartLearning = () => {
    if (user) {
      navigate("/questions");
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleViewPricing = () => {
    navigate("/pricing");
    // Scroll to top after navigation
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const stats = [
    { number: "5000+", label: "Interview Questions" },
    { number: "50+", label: "Real-World Projects" },
    { number: "10000+", label: "Successful Candidates" },
    { number: "95%", label: "Success Rate" }
  ];

  const features = [
    {
      icon: BookOpen,
      title: "Comprehensive Question Bank",
      description: "Access thousands of real interview questions from top tech companies, organized by difficulty and topic.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Code,
      title: "Hands-on Projects",
      description: "Build impressive portfolio projects that demonstrate your skills to potential employers.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Users,
      title: "Expert Guidance",
      description: "Learn from industry professionals with detailed explanations and best practices.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Trophy,
      title: "Track Progress",
      description: "Monitor your improvement with detailed analytics and personalized learning paths.",
      color: "from-orange-500 to-red-500"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer at Google",
      content: "InterviewVoyage helped me crack my dream job at Google. The questions were spot-on and the projects gave me confidence.",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      role: "Full-Stack Developer at Meta",
      content: "The comprehensive preparation materials and real-world projects made all the difference in my interviews.",
      rating: 5
    },
    {
      name: "Priya Patel",
      role: "Senior Developer at Amazon",
      content: "I landed my role at Amazon thanks to the structured approach and high-quality content on InterviewVoyage.",
      rating: 5
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 lg:py-32">
        <svg className="absolute inset-0" width="60" height="60" viewBox="0 0 60 60" fill="none" opacity="50"></svg>
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent" style={{ lineHeight: '1.2' }}>
              InterviewVoyage
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
              Prepare for your dream job with our comprehensive collection of interview questions and real-world projects from top tech companies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-[#9294b2] hover:bg-[#7a7c98] text-white px-8 py-3 text-lg font-semibold transition-all duration-300 transform hover:scale-105"
                onClick={handleGetStarted}
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                className="bg-[#9294b2] hover:bg-[#7a7c98] text-white px-8 py-3 text-lg font-semibold transition-all duration-300 transform hover:scale-105"
                onClick={handleViewPricing}
              >
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools and resources you need to ace your technical interviews.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105 group">
                <CardHeader className="text-center">
                  <div className={`h-16 w-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-400 text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-slate-800/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Success Stories
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Join thousands of developers who landed their dream jobs with InterviewVoyage.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="text-white font-semibold">{testimonial.name}</p>
                    <p className="text-slate-400 text-sm">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-[#9294b2] border-none max-w-4xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
            <CardContent className="p-12 text-center relative">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Master Technical Interviews?
              </h3>
              <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                Get unlimited access to all question categories with our premium plans.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  variant="outline" 
                  className="bg-[#555879] hover:bg-[#98A1BC] text-white px-8 py-3"
                  onClick={handleViewPricing}
                >
                  View Pricing
                </Button>
                <Button 
                  size="lg"
                  variant="outline" 
                  className="bg-[#555879] hover:bg-[#98A1BC] text-white px-8 py-3"
                  onClick={handleStartLearning}
                >
                  {!user ? "Sign Up Free" : "Start Learning"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default Index;
