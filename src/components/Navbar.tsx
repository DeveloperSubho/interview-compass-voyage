
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "./AuthModal";
import ThemeToggle from "./ThemeToggle";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const isActive = (path: string) => {
    if (path === '/' || path === '/questions') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-slate-800/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div 
              className="text-xl font-bold text-white cursor-pointer"
              onClick={() => navigate("/")}
            >
              InterviewAce
            </div>
            
            <div className="hidden md:flex space-x-6">
              <Button 
                variant="ghost" 
                className={`text-slate-300 hover:text-white hover:bg-slate-700 ${
                  isActive('/') ? 'text-white bg-slate-700' : ''
                }`}
                onClick={() => navigate("/")}
              >
                Home
              </Button>
              <Button 
                variant="ghost" 
                className={`text-slate-300 hover:text-white hover:bg-slate-700 ${
                  isActive('/questions') ? 'text-white bg-slate-700' : ''
                }`}
                onClick={() => navigate("/questions")}
              >
                Questions
              </Button>
              <Button 
                variant="ghost" 
                className={`text-slate-300 hover:text-white hover:bg-slate-700 ${
                  isActive('/projects') ? 'text-white bg-slate-700' : ''
                }`}
                onClick={() => navigate("/projects")}
              >
                Projects
              </Button>
              <Button 
                variant="ghost" 
                className={`text-slate-300 hover:text-white hover:bg-slate-700 ${
                  isActive('/pricing') ? 'text-white bg-slate-700' : ''
                }`}
                onClick={() => navigate("/pricing")}
              >
                Pricing
              </Button>
              <Button 
                variant="ghost" 
                className={`text-slate-300 hover:text-white hover:bg-slate-700 ${
                  isActive('/contact') ? 'text-white bg-slate-700' : ''
                }`}
                onClick={() => navigate("/contact")}
              >
                Contact
              </Button>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-700">
                    <User className="h-4 w-4 mr-2" />
                    {profile?.first_name || profile?.username || "User"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-800 border-slate-700">
                  <DropdownMenuItem 
                    className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                    onClick={() => navigate("/profile")}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  {profile?.is_admin && (
                    <DropdownMenuItem 
                      className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                      onClick={() => navigate("/admin/projects")}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Projects
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setIsAuthModalOpen(true)}
              >
                Sign In
              </Button>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-300 hover:text-white hover:bg-slate-700"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              <Button 
                variant="ghost" 
                className={`text-slate-300 hover:text-white hover:bg-slate-700 justify-start ${
                  isActive('/') ? 'text-white bg-slate-700' : ''
                }`}
                onClick={() => {
                  navigate("/");
                  setIsOpen(false);
                }}
              >
                Home
              </Button>
              <Button 
                variant="ghost" 
                className={`text-slate-300 hover:text-white hover:bg-slate-700 justify-start ${
                  isActive('/questions') ? 'text-white bg-slate-700' : ''
                }`}
                onClick={() => {
                  navigate("/questions");
                  setIsOpen(false);
                }}
              >
                Questions
              </Button>
              <Button 
                variant="ghost" 
                className={`text-slate-300 hover:text-white hover:bg-slate-700 justify-start ${
                  isActive('/projects') ? 'text-white bg-slate-700' : ''
                }`}
                onClick={() => {
                  navigate("/projects");
                  setIsOpen(false);
                }}
              >
                Projects
              </Button>
              <Button 
                variant="ghost" 
                className={`text-slate-300 hover:text-white hover:bg-slate-700 justify-start ${
                  isActive('/pricing') ? 'text-white bg-slate-700' : ''
                }`}
                onClick={() => {
                  navigate("/pricing");
                  setIsOpen(false);
                }}
              >
                Pricing
              </Button>
              <Button 
                variant="ghost" 
                className={`text-slate-300 hover:text-white hover:bg-slate-700 justify-start ${
                  isActive('/contact') ? 'text-white bg-slate-700' : ''
                }`}
                onClick={() => {
                  navigate("/contact");
                  setIsOpen(false);
                }}
              >
                Contact
              </Button>
              
              {user ? (
                <>
                  <Button 
                    variant="ghost" 
                    className="text-slate-300 hover:text-white hover:bg-slate-700 justify-start"
                    onClick={() => {
                      navigate("/profile");
                      setIsOpen(false);
                    }}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                  {profile?.is_admin && (
                    <Button 
                      variant="ghost" 
                      className="text-slate-300 hover:text-white hover:bg-slate-700 justify-start"
                      onClick={() => {
                        navigate("/admin/projects");
                        setIsOpen(false);
                      }}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Projects
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    className="text-slate-300 hover:text-white hover:bg-slate-700 justify-start"
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white justify-start"
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setIsOpen(false);
                  }}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
      
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </nav>
  );
};

export default Navbar;
