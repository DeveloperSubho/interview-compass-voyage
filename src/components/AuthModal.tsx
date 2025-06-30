
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Phone, Eye, EyeOff } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const { toast } = useToast();
  const { signInWithProvider } = useAuth();
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'otp'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailFormData, setEmailFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    username: "",
  });
  const [phoneFormData, setPhoneFormData] = useState({
    phone: "",
    otp: "",
  });

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMode === 'signup') {
        if (emailFormData.password !== emailFormData.confirmPassword) {
          toast({
            title: "Error",
            description: "Passwords do not match",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email: emailFormData.email,
          password: emailFormData.password,
          options: {
            data: {
              first_name: emailFormData.firstName,
              last_name: emailFormData.lastName,
              username: emailFormData.username,
            }
          }
        });

        if (error) throw error;

        toast({
          title: "Account created!",
          description: "You have successfully signed up and are now logged in.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailFormData.email,
          password: emailFormData.password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      }

      handleClose();
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: "Error",
        description: error.message || "Authentication failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMode === 'otp' && phoneFormData.otp) {
        // Verify OTP
        const { error } = await supabase.auth.verifyOtp({
          phone: phoneFormData.phone,
          token: phoneFormData.otp,
          type: 'sms'
        });

        if (error) throw error;

        toast({
          title: "Success!",
          description: "You have successfully signed in with OTP.",
        });

        handleClose();
      } else {
        // Send OTP
        const { error } = await supabase.auth.signInWithOtp({
          phone: phoneFormData.phone,
        });

        if (error) throw error;

        setAuthMode('otp');
        toast({
          title: "OTP Sent",
          description: "Please check your phone for the verification code.",
        });
      }
    } catch (error: any) {
      console.error('Phone auth error:', error);
      toast({
        title: "Error",
        description: error.message || "Phone authentication failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'github' | 'linkedin_oidc') => {
    try {
      setLoading(true);
      const { error } = await signInWithProvider(provider);
      
      if (error) throw error;
      
      handleClose();
    } catch (error: any) {
      console.error('Social auth error:', error);
      toast({
        title: "Error",
        description: error.message || "Social authentication failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmailFormData({
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      username: "",
    });
    setPhoneFormData({
      phone: "",
      otp: "",
    });
    setAuthMode('signin');
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {authMode === 'otp' ? 'Enter OTP' : authMode === 'signup' ? 'Create Account' : 'Sign In'}
          </DialogTitle>
          <DialogDescription>
            {authMode === 'otp' ? 'Enter the verification code sent to your phone' : 
             authMode === 'signup' ? 'Create your account to get started' : 
             'Sign in to your account'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Social Login Options */}
          {authMode !== 'otp' && (
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => handleSocialAuth('google')}
                disabled={loading}
                className="w-full"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialAuth('github')}
                disabled={loading}
                className="w-full"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Continue with GitHub
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialAuth('linkedin_oidc')}
                disabled={loading}
                className="w-full"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Continue with LinkedIn
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
            </div>
          )}

          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email">
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {authMode === 'signup' && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={emailFormData.firstName}
                          onChange={(e) => setEmailFormData({ ...emailFormData, firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={emailFormData.lastName}
                          onChange={(e) => setEmailFormData({ ...emailFormData, lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={emailFormData.username}
                        onChange={(e) => setEmailFormData({ ...emailFormData, username: e.target.value })}
                        required
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={emailFormData.email}
                    onChange={(e) => setEmailFormData({ ...emailFormData, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={emailFormData.password}
                      onChange={(e) => setEmailFormData({ ...emailFormData, password: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {authMode === 'signup' && (
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={emailFormData.confirmPassword}
                        onChange={(e) => setEmailFormData({ ...emailFormData, confirmPassword: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (authMode === 'signup' ? "Creating Account..." : "Signing In...") : 
                            (authMode === 'signup' ? "Create Account" : "Sign In")}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setAuthMode(authMode === 'signup' ? 'signin' : 'signup')}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {authMode === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                  </button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="phone">
              <form onSubmit={handlePhoneAuth} className="space-y-4">
                {authMode === 'otp' ? (
                  <>
                    <div>
                      <Label>Phone Number</Label>
                      <Input value={phoneFormData.phone} disabled />
                    </div>
                    <div>
                      <Label htmlFor="otp">Verification Code</Label>
                      <Input
                        id="otp"
                        type="text"
                        value={phoneFormData.otp}
                        onChange={(e) => setPhoneFormData({ ...phoneFormData, otp: e.target.value })}
                        placeholder="Enter 6-digit code"
                        required
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setAuthMode('signin')}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button type="submit" disabled={loading} className="flex-1">
                        {loading ? "Verifying..." : "Verify"}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phoneFormData.phone}
                        onChange={(e) => setPhoneFormData({ ...phoneFormData, phone: e.target.value })}
                        placeholder="+1234567890"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Include country code (e.g., +1 for US)
                      </p>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? "Sending OTP..." : "Send OTP"}
                    </Button>
                  </>
                )}
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
