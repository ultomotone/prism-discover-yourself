import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { X, Mail, Sparkles, TrendingUp, Lightbulb, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NewsletterSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewsletterSignupModal = ({ isOpen, onClose }: NewsletterSignupModalProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('newsletter-signup', {
        body: { email }
      });

      if (error) throw error;

      toast({
        title: "Welcome to PRISM Insights!",
        description: "You've been subscribed to our newsletter. Check your email for confirmation.",
      });

      // Close modal and redirect to assessment
      onClose();
      window.location.href = "/assessment?start=true";
    } catch (error: any) {
      console.error('Newsletter signup error:', error);
      toast({
        title: "Signup failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    {
      icon: <TrendingUp className="h-5 w-5 text-primary" />,
      title: "Latest Updates",
      description: "Be the first to know about new PRISM features and improvements"
    },
    {
      icon: <Sparkles className="h-5 w-5 text-primary" />,
      title: "Model Advancements",
      description: "Exclusive insights into personality science breakthroughs"
    },
    {
      icon: <Lightbulb className="h-5 w-5 text-primary" />,
      title: "Expert Tips",
      description: "Practical advice from personality psychology experts"
    },
    {
      icon: <Users className="h-5 w-5 text-primary" />,
      title: "Community Insights",
      description: "Learn from others' personality development journeys"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div 
        role="dialog" 
        aria-labelledby="newsletter-modal-title" 
        aria-modal="true"
        className="relative w-full max-w-lg animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-background to-muted/20">
          <CardContent className="p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 
                    id="newsletter-modal-title" 
                    className="text-xl font-bold text-foreground"
                  >
                    Stay Connected with PRISM
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Join thousands discovering their personality insights
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted/50"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  {benefit.icon}
                  <div>
                    <h4 className="font-medium text-sm text-foreground">
                      {benefit.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2" />
                    Subscribing...
                  </>
                ) : (
                  <>
                    Subscribe & Take Assessment
                    <Sparkles className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground text-center">
                Free insights delivered weekly. Unsubscribe anytime.
                <br />
                By subscribing, you agree to receive emails from PRISM Insights.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewsletterSignupModal;