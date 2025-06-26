
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Code, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate, useParams } from "react-router-dom";

const QuestionDetail = () => {
  const navigate = useNavigate();
  const { category, questionId } = useParams();

  // Sample question data - in a real app, this would come from an API
  const sampleQuestion = {
    id: questionId,
    title: "What is the difference between == and === in JavaScript?",
    difficulty: "Basic",
    timeToSolve: "5 mins",
    tags: ["JavaScript", "Comparison", "Fundamentals"],
    description: "This question tests your understanding of JavaScript's comparison operators and type coercion.",
    content: `
## Question

Explain the difference between == (loose equality) and === (strict equality) operators in JavaScript. Provide examples to illustrate your explanation.

## Key Points to Cover

1. **Type Coercion**: Explain how == performs type coercion
2. **Strict Comparison**: Explain how === performs strict comparison
3. **Performance**: Discuss the performance implications
4. **Best Practices**: When to use each operator

## Sample Answer

The main difference between == and === in JavaScript is:

### == (Loose Equality)
- Performs type coercion before comparison
- Converts operands to the same type if they're different
- Can lead to unexpected results

\`\`\`javascript
console.log(5 == "5");     // true (string "5" is converted to number 5)
console.log(true == 1);    // true (true is converted to 1)
console.log(null == undefined); // true (special case)
\`\`\`

### === (Strict Equality)
- No type coercion
- Compares both value and type
- More predictable and safer

\`\`\`javascript
console.log(5 === "5");    // false (different types)
console.log(true === 1);   // false (different types)
console.log(null === undefined); // false (different types)
\`\`\`

### Best Practice
Always use === unless you specifically need type coercion. It makes your code more predictable and easier to debug.

## Related Topics
- Type coercion in JavaScript
- Truthy and falsy values
- Object comparison
- Array comparison
    `,
    hints: [
      "Think about what happens when JavaScript tries to compare different data types",
      "Consider the concept of type coercion and when it occurs",
      "Remember that === checks both value and type"
    ]
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

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/questions/${category}`)}
            className="text-slate-300 hover:text-white hover:bg-slate-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Questions
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Question Header */}
          <Card className="bg-slate-800/50 border-slate-700 mb-8">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-slate-400 text-sm">#{sampleQuestion.id}</span>
                    <Badge className={`${getDifficultyColor(sampleQuestion.difficulty)} border`}>
                      {sampleQuestion.difficulty}
                    </Badge>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{sampleQuestion.timeToSolve}</span>
                    </div>
                  </div>
                  <CardTitle className="text-white text-2xl mb-2">
                    {sampleQuestion.title}
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    {sampleQuestion.description}
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {sampleQuestion.tags.map((tag, tagIndex) => (
                  <Badge 
                    key={tagIndex} 
                    variant="secondary" 
                    className="bg-slate-700 text-slate-300"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>
          </Card>

          {/* Question Content */}
          <Card className="bg-slate-800/50 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Code className="h-5 w-5" />
                Question Details & Answer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-slate-300 leading-relaxed">
                  {sampleQuestion.content}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hints Section */}
          <Card className="bg-slate-800/50 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                💡 Hints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sampleQuestion.hints.map((hint, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-slate-300">{hint}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
              onClick={() => navigate(`/questions/${category}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Complete
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default QuestionDetail;
