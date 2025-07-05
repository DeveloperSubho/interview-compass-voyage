
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useState } from "react";
import Index from "./pages/Index";
import Questions from "./pages/Questions";
import QuestionList from "./pages/QuestionList";
import QuestionDetail from "./pages/QuestionDetail";
import CategorySection from "./components/CategorySection";
import SubCategory from "./components/SubCategory";
import Projects from "./pages/Projects";
import ProjectCategory from "./pages/ProjectCategory";
import ProjectDetail from "./pages/ProjectDetail";
import CodingQuestions from "./pages/CodingQuestions";
import CodingQuestionDetail from "./pages/CodingQuestionDetail";
import SystemDesign from "./pages/SystemDesign";
import SystemDesignDetail from "./pages/SystemDesignDetail";
import Profile from "./pages/Profile";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import AuthModal from "./components/AuthModal";

const queryClient = new QueryClient();

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleSignInClick = () => {
    setIsAuthModalOpen(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/questions" element={<Questions />} />
                <Route path="/questions/:category" element={<CategorySection />} />
                <Route path="/questions/:category/:subcategoryName" element={<SubCategory />} />
                <Route path="/questions/:category/:subcategoryName/:questionId" element={<QuestionDetail />} />
                <Route path="/coding" element={<CodingQuestions />} />
                <Route path="/coding/:slug" element={<CodingQuestionDetail />} />
                <Route path="/system-design" element={<SystemDesign />} />
                <Route path="/system-design/:slug" element={<SystemDesignDetail />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:type" element={<ProjectCategory />} />
                <Route path="/projects/:type/:id" element={<ProjectDetail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <AuthModal 
              isOpen={isAuthModalOpen}
              onClose={() => setIsAuthModalOpen(false)}
            />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
