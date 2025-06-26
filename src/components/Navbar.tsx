
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, Code, LogIn, User, LogOut, Crown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import AuthModal from "./AuthModal";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Interview Questions", href: "/questions" },
    { label: "Projects", href: "/projects" },
    { label: "Pricing", href: "/pricing" },
    { label: "Contact", href: "/contact" }
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
    setIsOpen(false);
  };

  return (
    <>
      <nav className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-r from-[#555879] to-[#98A1BC] rounded-lg flex items-center justify-center">
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

            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  {profile?.is_admin && (
                    <Badge className="bg-yellow-600 text-white flex items-center gap-1 hover:bg-yellow-600">
                      <Crown className="h-3 w-3" />
                      Admin
                    </Badge>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-[#555879]">
                        <User className="h-4 w-4 mr-2" />
                        {profile?.first_name || user.email}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-slate-800 border-slate-700">
                      <DropdownMenuItem onClick={handleSignOut} className="text-slate-300 hover:text-white hover:bg-[#555879]">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    className="text-slate-300 hover:text-white hover:bg-[#555879]"
                    onClick={openAuthModal}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                  <Button 
                    className="bg-[#555879] hover:bg-[#98A1BC] text-white"
                    onClick={openAuthModal}
                  >
                    Sign Up
                  </Button>
                </>
              )}
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
                    {user ? (
                      <div className="space-y-2">
                        {profile?.is_admin && (
                          <Badge className="bg-yellow-600 text-white flex items-center gap-1 w-fit hover:bg-yellow-600">
                            <Crown className="h-3 w-3" />
                            Admin
                          </Badge>
                        )}
                        <div className="text-slate-300 py-2">
                          {profile?.first_name || user.email}
                        </div>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-slate-300 hover:bg-[#555879] hover:text-white"
                          onClick={handleSignOut}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-slate-300 hover:bg-[#555879] hover:text-white"
                          onClick={openAuthModal}
                        >
                          <LogIn className="h-4 w-4 mr-2" />
                          Login
                        </Button>
                        <Button 
                          className="w-full bg-[#555879] hover:bg-[#98A1BC] text-white"
                          onClick={openAuthModal}
                        >
                          Sign Up
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

export default Navbar;
