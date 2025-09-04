import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlus, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

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

    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
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
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account, then you can sign in.",
        });
        if (typeof window !== 'undefined') {
          const w = window as any;
          if (w.rdtSetUser) w.rdtSetUser({ email });
          if (w.fbSetUser) w.fbSetUser({ email });
          if (w.rdtTrack) w.rdtTrack('SignUp', { email });
          if (w.fbTrack) w.fbTrack('CompleteRegistration', { email });
          w.dispatchEvent(new Event('app:user:signup'));
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
          console.error({ area: 'signup', message: 'add_to_resend signup failed', cause: e });
        }

        navigate('/login');
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16 min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 prism-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Create Your PRISM Account</CardTitle>
            <p className="text-muted-foreground">Join thousands discovering their personality profile</p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password (min. 6 characters)"
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
            
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in here
                </Link>
              </p>
              <Link 
                to="/"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}