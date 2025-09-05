import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { trackLead } from "@/lib/analytics";

interface YourPersonalityBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const YourPersonalityBlueprintModal = ({ isOpen, onClose }: YourPersonalityBlueprintModalProps) => {
  const firstButtonRef = useRef<HTMLAnchorElement>(null);

  // Focus management
  useEffect(() => {
    if (isOpen && firstButtonRef.current) {
      // Small delay to ensure dialog is fully rendered
      const timer = setTimeout(() => {
        firstButtonRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trackAPLClick = () => {
    if (typeof window !== 'undefined' && (window as any).rdtTrack) {
      (window as any).rdtTrack('Custom', {
        custom_event_name: 'AppliedPersonalityLabClick'
      });
    }
    if (typeof window !== 'undefined' && (window as any).fbTrack) {
      (window as any).fbTrack('Custom', {
        custom_event_name: 'AppliedPersonalityLabClick'
      });
    }
    trackLead(undefined, { source: 'applied_personality_lab' });
  };

  const handleCTAClick = () => {
    trackAPLClick();
    onClose();
    window.open(
      'https://www.skool.com/your-personality-blueprint/about?ref=931e57f033d34f3eb64db45f22b1389e',
      '_blank'
    );
  };

  const handleSecondaryClick = () => {
    trackAPLClick();
    onClose();
    // Navigate to tour section or video - using placeholder for now
    window.open('/your-personality-blueprint#tour', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-sm animate-fade-in">
      <div 
        role="dialog" 
        aria-labelledby="ypb-modal-title" 
        aria-modal="true"
        className="relative w-full max-w-[420px] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="shadow-xl border-0">
          <CardContent className="p-6 space-y-4">
            {/* Header with logo */}
            <div className="flex items-start justify-between">
              <div className="flex flex-col items-center gap-3 flex-1">
                <img
                  src="/lovable-uploads/081186e2-0794-41ec-835c-adaef32901e3.png"
                  alt="Applied Personality Lab"
                  className="h-24 w-24 object-contain"
                />
                <h3 
                  id="ypb-modal-title" 
                  className="text-lg font-bold text-foreground leading-tight text-center"
                >
                  Ship one win this week with Applied Personality Lab
                </h3>
              </div>
              <button 
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body text */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Turn self-awareness into real change. Join the community, take the PRISM Starter (15–20 min), 
                post your <strong className="text-foreground">#FirstGoal</strong>, and get live help in Typing Lab.
              </p>
              
              <p className="text-sm">
                <strong className="text-foreground">Guarantee:</strong> Ship one measurable win in 7 days or your first month is free.
              </p>
              
              <p className="text-xs text-muted-foreground">
                129 assessments • 25 members and growing
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3 pt-2">
              <a
                ref={firstButtonRef}
                href="https://www.skool.com/your-personality-blueprint/about?ref=931e57f033d34f3eb64db45f22b1389e"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleCTAClick}
                className="w-full inline-flex items-center justify-center px-4 py-3 bg-primary text-primary-foreground font-medium text-sm rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Start your 7-day free trial
              </a>
              
              <button
                onClick={handleSecondaryClick}
                className="w-full px-4 py-2.5 border border-border text-sm text-foreground rounded-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                See how it works (60-sec tour)
              </button>
            </div>

            {/* Dismiss link */}
            <div className="text-center pt-1">
              <button 
                onClick={onClose}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-1 py-1"
              >
                No thanks
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default YourPersonalityBlueprintModal;
