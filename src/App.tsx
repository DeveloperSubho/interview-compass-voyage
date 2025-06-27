
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Contact from "./pages/Contact";
import Questions from "./pages/Questions";
import JavaSubcategories from "./pages/JavaSubcategories";
import JavaQuestionList from "./pages/JavaQuestionList";
import JavaQuestionDetail from "./pages/JavaQuestionDetail";
import QuestionList from "./pages/QuestionList";
import QuestionDetail from "./pages/QuestionDetail";
import Projects from "./pages/Projects";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/questions" element={<Questions />} />
            <Route path="/questions/java" element={<JavaSubcategories />} />
            <Route path="/questions/java/:subcategoryId" element={<JavaQuestionList />} />
            <Route path="/questions/java/:subcategoryId/:questionId" element={<JavaQuestionDetail />} />
            <Route path="/questions/:category" element={<QuestionList />} />
            <Route path="/questions/:category/:questionId" element={<QuestionDetail />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/pricing" element={<Pricing />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
