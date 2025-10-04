import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, Mail, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
}

const featureNames: Record<string, string> = {
  'trends-kpis': 'Trends & KPIs',
  'cohorts': 'Cohorts',
  'one-on-ones': '1:1 Sessions',
  'ai-coach': 'AI Coach'
};

const featureBenefits: Record<string, string[]> = {
  'trends-kpis': [
    'Track your personality development over time',
    'Visualize changes in your behavioral patterns',
    'Get personalized growth insights'
  ],
  'cohorts': [
    'Connect with people who share your personality type',
    'Join guided group discussions',
    'Learn from shared experiences'
  ],
  'one-on-ones': [
    'Get personalized coaching sessions',
    'Work through specific challenges',
    'Receive tailored development plans'
  ],
  'ai-coach': [
    'Get 24/7 personalized guidance',
    'Ask questions about your results anytime',
    'Receive contextual advice for real situations'
  ]
};

export const WaitlistModal = ({ isOpen, onClose, feature }: WaitlistModalProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const featureName = featureNames[feature] || 'This Feature';
  const benefits = featureBenefits[feature] || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.functions.invoke('newsletter-signup', {
        body: { 
          email,
          signup_source: `waitlist_${feature}`,
          interests: [feature]
        }
      });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: 'You\'re on the list!',
        description: `We'll notify you when ${featureName} launches.`
      });

      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setEmail('');
      }, 2000);
    } catch (error: any) {
      toast({
        title: 'Something went wrong',
        description: error.message || 'Please try again later',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Bell className="h-5 w-5" />
            Join the {featureName} Waitlist
          </DialogTitle>
        </DialogHeader>

        {!isSuccess ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Be among the first to access {featureName} when it launches. We'll send you an email as soon as it's ready.
            </p>

            {benefits.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold">What you'll get:</p>
                <ul className="space-y-1.5">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                <Mail className="mr-2 h-4 w-4" />
                {isLoading ? 'Joining...' : 'Join Waitlist'}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-semibold">You're on the list!</h3>
              <p className="text-sm text-muted-foreground">
                We'll notify you when {featureName} launches.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
