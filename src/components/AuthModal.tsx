
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'otp'>('signin');
  const [emailFormData, setEmailFormData] = useState({
    email: "",
    password: "",
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

  const handleClose = () => {
    setEmailFormData({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      username: "",
    });
    setPhoneFormData({
      phone: "",
      otp: "",
    });
    setAuthMode('signin');
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
            {authMode === 'otp' ? (
              <form onSubmit={handlePhoneAuth} className="space-y-4">
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
              </form>
            ) : (
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
                  <Input
                    id="password"
                    type="password"
                    value={emailFormData.password}
                    onChange={(e) => setEmailFormData({ ...emailFormData, password: e.target.value })}
                    required
                  />
                </div>

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
            )}
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
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
