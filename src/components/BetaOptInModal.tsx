import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BetaOptInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CheckItem = ({ text }: { text: string }) => (
  <div className="flex items-start gap-2">
    <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
    <span className="text-sm">{text}</span>
  </div>
);

export const BetaOptInModal = ({ open, onOpenChange }: BetaOptInModalProps) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Unlock Your Dynamic Profile
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            You're more than a 4-letter snapshot. Beta members see how their core evolves, 
            where it drifts under flow or stress, and which two tiny habits change the week.
          </p>
          <div className="space-y-2">
            <CheckItem text="Drift Map & KPI trends showing your personality dynamics" />
            <CheckItem text="Function heatmap with do/don't guidance for your type" />
            <CheckItem text="AI Coach micro-plans tied to your current state" />
            <CheckItem text="Group & 1:1 Fit with simple weekly actions" />
          </div>
          <Button 
            onClick={() => {
              onOpenChange(false);
              navigate('/membership');
            }} 
            className="w-full" 
            size="lg"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Join Founding Beta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
