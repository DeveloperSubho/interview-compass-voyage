import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";

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
  const { user, signOut } = useAuth();
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

  return (
    <div className={cn("bg-background border-b sticky top-0 z-50", className)}>
      <div className="container flex items-center justify-between py-4">
        <Link to="/" className="flex items-center font-semibold">
          {siteConfig.name}
        </Link>

      <nav className="hidden md:flex items-center space-x-8">
        <Link
          to="/"
          className="text-foreground hover:text-blue-400 transition-colors font-medium"
        >
          Home
        </Link>
        <Link
          to="/questions"
          className="text-foreground hover:text-blue-400 transition-colors font-medium"
        >
          Questions
        </Link>
        <Link
          to="/coding"
          className="text-foreground hover:text-blue-400 transition-colors font-medium"
        >
          Coding
        </Link>
        <Link
          to="/projects"
          className="text-foreground hover:text-blue-400 transition-colors font-medium"
        >
          Projects
        </Link>
        <Link
          to="/pricing"
          className="text-foreground hover:text-blue-400 transition-colors font-medium"
        >
          Pricing
        </Link>
      </nav>

        <div className="flex items-center space-x-4">
          <ModeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name} />
                    <AvatarFallback>{user?.user_metadata?.full_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
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
                className="text-foreground hover:text-blue-400 transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/questions"
                className="text-foreground hover:text-blue-400 transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                Questions
              </Link>
              <Link
                to="/coding"
                className="text-foreground hover:text-blue-400 transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                Coding
              </Link>
              <Link
                to="/projects"
                className="text-foreground hover:text-blue-400 transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                Projects
              </Link>
              <Link
                to="/pricing"
                className="text-foreground hover:text-blue-400 transition-colors font-medium"
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
