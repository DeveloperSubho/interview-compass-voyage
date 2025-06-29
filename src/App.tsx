
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Questions from "./pages/Questions";
import QuestionList from "./pages/QuestionList";
import QuestionDetail from "./pages/QuestionDetail";
import JavaSubcategories from "./pages/JavaSubcategories";
import JavaQuestionList from "./pages/JavaQuestionList";
import JavaQuestionDetail from "./pages/JavaQuestionDetail";
import CategorySection from "./components/CategorySection";
import CategoryQuestionList from "./components/CategoryQuestionList";
import Projects from "./pages/Projects";
import ProjectCategory from "./pages/ProjectCategory";
import ProjectDetail from "./pages/ProjectDetail";
import CodingQuestions from "./pages/CodingQuestions";
import CodingQuestionList from "./pages/CodingQuestionList";
import CodingQuestionDetail from "./pages/CodingQuestionDetail";
import Profile from "./pages/Profile";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
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
                <Route path="/questions/java" element={<JavaSubcategories />} />
                <Route path="/questions/java/:subcategoryId" element={<JavaQuestionList />} />
                <Route path="/questions/java/:subcategoryId/:questionId" element={<JavaQuestionDetail />} />
                <Route path="/questions/:category" element={<CategorySection />} />
                <Route path="/questions/:category/:subcategoryId" element={<CategoryQuestionList />} />
                <Route path="/questions/:category/:subcategoryId/:questionId" element={<QuestionDetail />} />
                <Route path="/coding" element={<CodingQuestions />} />
                <Route path="/coding/:category" element={<CodingQuestionList />} />
                <Route path="/coding/:category/:slug" element={<CodingQuestionDetail />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:type" element={<ProjectCategory />} />
                <Route path="/projects/:type/:id" element={<ProjectDetail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
