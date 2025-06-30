
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Crown } from "lucide-react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { ModeToggle } from "@/components/ModeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import AuthModal from "@/components/AuthModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';

interface Props {
  className?: string;
}

const Navbar = ({ className }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const getLinkClass = (path: string) => {
    return cn(
      "text-foreground hover:text-blue-400 transition-colors font-medium",
      isActivePath(path) && "text-blue-400"
    );
  };

  return (
    <div className={cn("bg-background border-b sticky top-0 z-50", className)}>
      <div className="container flex items-center justify-between py-4">
        <Link to="/" className="flex items-center font-semibold">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {siteConfig.name}
            </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className={getLinkClass("/")}>
            Home
          </Link>
          <Link to="/questions" className={getLinkClass("/questions")}>
            Questions
          </Link>
          <Link to="/coding" className={getLinkClass("/coding")}>
            Coding
          </Link>
          <Link to="/projects" className={getLinkClass("/projects")}>
            Projects
          </Link>
          <Link to="/pricing" className={getLinkClass("/pricing")}>
            Pricing
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <ModeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 rounded-full relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name} />
                    <AvatarFallback>{user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {isAdmin && (
                    <Crown className="h-3 w-3 text-yellow-400 absolute -top-1 -right-1" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="flex items-center gap-2">
                  My Account
                  {isAdmin && <Crown className="h-4 w-4 text-yellow-400" />}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" onClick={() => setIsAuthModalOpen(true)}>
              Sign In
            </Button>
          )}
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col space-y-4 mt-4">
              <Link
                to="/"
                className={getLinkClass("/")}
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/questions"
                className={getLinkClass("/questions")}
                onClick={() => setIsOpen(false)}
              >
                Questions
              </Link>
              <Link
                to="/coding"
                className={getLinkClass("/coding")}
                onClick={() => setIsOpen(false)}
              >
                Coding
              </Link>
              <Link
                to="/projects"
                className={getLinkClass("/projects")}
                onClick={() => setIsOpen(false)}
              >
                Projects
              </Link>
              <Link
                to="/pricing"
                className={getLinkClass("/pricing")}
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </Link>

              {!user && (
                <Button variant="outline" onClick={() => setIsAuthModalOpen(true)}>
                  Sign In
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>

        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    </div>
  );
};

export default Navbar;
