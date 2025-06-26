
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Code, LogIn, User } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Interview Questions", href: "/questions" },
    { label: "Projects", href: "/projects" },
    { label: "Pricing", href: "/pricing" },
    { label: "Contact", href: "/contact" }
  ];

  return (
    <nav className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Code className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">InterviewVoyage</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="text-slate-300 hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" className="text-slate-300 hover:text-white">
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Sign Up
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-slate-300">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-slate-900 border-slate-800">
              <div className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className="text-slate-300 hover:text-white transition-colors py-2"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="border-t border-slate-800 pt-4 space-y-2">
                  <Button variant="ghost" className="w-full justify-start text-slate-300">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Sign Up
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
