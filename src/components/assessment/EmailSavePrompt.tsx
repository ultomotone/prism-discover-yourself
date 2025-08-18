import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail } from "lucide-react";

interface EmailSavePromptProps {
  isOpen: boolean;
  onSave: (email: string) => Promise<void>;
  onSkip: () => void;
  onCancel: () => void;
}

export function EmailSavePrompt({ isOpen, onSave, onSkip, onCancel }: EmailSavePromptProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address to save progress",
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
      await onSave(email.toLowerCase().trim());
      setEmail(''); // Clear form after successful save
    } catch (error) {
      console.error('Error saving with email:', error);
      toast({
        title: "Save failed",
        description: "Unable to save your progress. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    setEmail(''); // Clear form when skipping
    onSkip();
  };

  const handleCancel = () => {
    setEmail(''); // Clear form when canceling
    onCancel();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !isLoading && handleCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-center">Save Your Progress</DialogTitle>
          <DialogDescription className="text-center">
            Enter your email to save your assessment progress and resume later
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSave}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="save-email">Email Address</Label>
              <Input
                id="save-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>
          
          <DialogFooter className="flex-col space-y-2 mt-6">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !email.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save & Exit'
              )}
            </Button>
            
            <div className="flex space-x-2 w-full">
              <Button 
                type="button"
                variant="outline" 
                onClick={handleSkip}
                disabled={isLoading}
                className="flex-1"
              >
                Exit Without Saving
              </Button>
              <Button 
                type="button"
                variant="ghost" 
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}