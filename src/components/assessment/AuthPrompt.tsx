import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, LogIn, Shield, Star } from "lucide-react";

interface AuthPromptProps {
  onAuthSuccess?: () => void;
  onSkip?: () => void;
  showSkipOption?: boolean;
  title?: string;
  description?: string;
}

export function AuthPrompt({ 
  onAuthSuccess, 
  onSkip, 
  showSkipOption = true,
  title = "Get Your Full PRISM Results",
  description = "Create an account or sign in to access detailed scoring, save your results, and track your progress over time."
}: AuthPromptProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signup');
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/assessment`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: "Account Already Exists",
            description: "Please try signing in instead.",
            variant: "destructive",
          });
          setActiveTab('signin');
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Account Created Successfully",
          description: "Please check your email to verify your account.",
        });
        // Fire-and-forget admin notification
        try {
          supabase.functions.invoke('notify_admin', {
            body: { type: 'signup', email }
          });
        } catch (e) {
          console.error({ area: 'auth', message: 'notify_admin signup failed', cause: e });
        }

        // Fire-and-forget Resend ingestion
        try {
          supabase.functions.invoke('add_to_resend', {
            headers: import.meta.env.VITE_RESEND_INGEST_TOKEN
              ? { authorization: `Bearer ${import.meta.env.VITE_RESEND_INGEST_TOKEN}` }
              : undefined,
            body: { email, source: 'signup' }
          });
        } catch (e) {
          console.error({ area: 'auth', message: 'add_to_resend signup failed', cause: e });
        }
        onAuthSuccess?.();
      }
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Signed In Successfully",
        description: "Welcome back!",
      });
      onAuthSuccess?.();
    } catch (error: any) {
      toast({
        title: "Sign In Failed",
        description: error.message || "Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <p className="text-muted-foreground">{description}</p>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>Detailed Results</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Secure Storage</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signup" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Sign Up
              </TabsTrigger>
              <TabsTrigger value="signin" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          {showSkipOption && (
            <div className="mt-6 pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center mb-3">
                You can continue without an account, but you won't be able to save or access detailed results.
              </p>
              <Button 
                variant="ghost" 
                onClick={onSkip} 
                className="w-full"
                disabled={isLoading}
              >
                Continue Without Account
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}