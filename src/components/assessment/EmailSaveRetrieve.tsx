import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, ArrowRight } from "lucide-react";
import { safeString } from "@/lib/typeGuards";

interface EmailSaveRetrieveProps {
  onResumeFound: (sessionId: string, email: string) => void;
  onStartNew: () => void;
}

export function EmailSaveRetrieve({ onResumeFound, onStartNew }: EmailSaveRetrieveProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleRetrieve = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Searching for saved assessments via secure endpoint');
      
      const { data, error } = await supabase.functions.invoke('find-session-by-email', {
        body: { email: email.toLowerCase().trim() }
      });

      console.log('Email search result:', { data, error });

      if (error) {
        console.error('Error searching for sessions:', error);
        
        // Handle rate limiting
        if (error.message?.includes('Too many requests')) {
          toast({
            title: "Too many attempts",
            description: "Please wait a few minutes before trying again.",
            variant: "destructive"
          });
          return;
        }
        
        toast({
          title: "Search failed", 
          description: "Unable to search for saved assessments. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (data?.found && data?.session) {
        const session = data.session;
        console.log('Found saved session:', session);
        toast({
          title: "Assessment found!",
          description: `Resuming your assessment (${session.completed_questions}/${session.total_questions} questions completed)`,
        });
        onResumeFound(safeString(session.id), email);
      } else {
        console.log('No saved sessions found');
        toast({
          title: "No saved assessment found",
          description: "No incomplete assessment found for this email address. Starting a new assessment.",
        });
        // Start new assessment with this email for saving later
        onStartNew();
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Mail className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Continue Your Assessment</CardTitle>
          <CardDescription>
            Enter your email to resume a saved assessment or start a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRetrieve} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !email.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  Continue Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Don't want to save your progress?
            </p>
            <Button 
              variant="outline" 
              onClick={onStartNew}
              disabled={isLoading}
              className="w-full"
            >
              Start Without Saving
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}