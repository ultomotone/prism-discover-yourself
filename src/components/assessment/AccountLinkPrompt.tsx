import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Mail, Lock, User, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AccountLinkPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountCreated: (email: string, password: string) => void;
  onSkip: () => void;
  currentEmail?: string;
}

export function AccountLinkPrompt({ 
  isOpen, 
  onClose, 
  onAccountCreated, 
  onSkip, 
  currentEmail 
}: AccountLinkPromptProps) {
  const [email, setEmail] = useState(currentEmail || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please provide both email and password.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
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
      const redirectUrl = `${window.location.origin}/assessment`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        console.error('Signup error:', error);
        toast({
          title: "Account Creation Failed",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (data.user) {
        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account. Your progress will be saved.",
        });
        onAccountCreated(email, password);
      } else {
        toast({
          title: "Please Check Your Email",
          description: "A verification link has been sent to your email address.",
        });
        onAccountCreated(email, password);
      }
    } catch (error) {
      console.error('Unexpected error during signup:', error);
      toast({
        title: "Unexpected Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Save Your Progress
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Create a free account to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Save your assessment progress</li>
              <li>Access detailed results anytime</li>
              <li>Get personalized insights</li>
              <li>Share results securely</li>
            </ul>
          </div>

          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a password (6+ characters)"
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <User className="mr-2 h-4 w-4" />
                Create Account & Save Progress
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={onSkip}
                disabled={isLoading}
                className="w-full"
              >
                Continue Without Account
              </Button>
            </div>
          </form>

          <div className="text-xs text-muted-foreground text-center">
            By creating an account, you agree to receive a verification email.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}