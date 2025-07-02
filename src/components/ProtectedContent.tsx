
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface ProtectedContentProps {
  children: React.ReactNode;
  requiredTier?: string;
  onSignInClick: () => void;
  showUpgradeMessage?: boolean;
}

const ProtectedContent = ({ 
  children, 
  requiredTier, 
  onSignInClick, 
  showUpgradeMessage = false 
}: ProtectedContentProps) => {
  const { user, hasAccess, subscription, isAdmin } = useAuth();

  // Admin can access everything
  if (isAdmin) {
    return <>{children}</>;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Lock className="h-12 w-12 text-muted-foreground" />
        <div className="text-center">
          <h3 className="text-lg font-medium">Sign in required</h3>
          <p className="text-muted-foreground mt-1">
            Please sign in to access this content
          </p>
        </div>
        <Button onClick={onSignInClick}>
          Sign In
        </Button>
      </div>
    );
  }

  if (requiredTier && !hasAccess(requiredTier)) {
    if (showUpgradeMessage) {
      return (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Lock className="h-12 w-12 text-muted-foreground" />
          <div className="text-center">
            <h3 className="text-lg font-medium">Upgrade Required</h3>
            <p className="text-muted-foreground mt-1">
              This content requires a {requiredTier} subscription or higher.
              {subscription && (
                <span className="block mt-1">
                  Your current plan: {subscription.tier}
                </span>
              )}
            </p>
          </div>
          <div className="bg-red-600/20 text-red-300 px-4 py-2 rounded-lg border border-red-600/30">
            Upgrade to {requiredTier} tier to access this content
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Lock className="h-12 w-12 text-muted-foreground" />
        <div className="text-center">
          <h3 className="text-lg font-medium">Upgrade required</h3>
          <p className="text-muted-foreground mt-1">
            This content requires a {requiredTier} subscription or higher.
            {subscription && (
              <span className="block mt-1">
                Your current plan: {subscription.tier}
              </span>
            )}
          </p>
        </div>
        <Button variant="outline">
          Upgrade to {requiredTier}
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedContent;
