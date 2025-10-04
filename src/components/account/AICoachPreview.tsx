import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Lock, Check, Sparkles } from 'lucide-react';

interface AICoachPreviewProps {
  isMember: boolean;
  onJoinBeta: () => void;
}

const bootMessages = [
  { text: "🔐 Please provide token…", completed: true },
  { text: "📊 Accessing profile…", completed: true },
  { text: "🔍 Change detected since last retest…", completed: true },
  { text: "📋 Opening today's plan…", completed: false },
];

export const AICoachPreview = ({ onJoinBeta }: AICoachPreviewProps) => {
  const [visibleMessages, setVisibleMessages] = useState(0);

  useEffect(() => {
    if (visibleMessages < bootMessages.length) {
      const timer = setTimeout(() => {
        setVisibleMessages(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [visibleMessages]);

  return (
    <div className="space-y-6">
      {/* Ghosted Chat Interface */}
      <Card className="border-2 border-dashed border-muted-foreground/20 bg-muted/50">
        <CardContent className="py-6 space-y-3">
          {bootMessages.slice(0, visibleMessages).map((msg, idx) => (
            <div 
              key={idx}
              className="flex items-center gap-2 font-mono text-xs text-muted-foreground animate-fade-in"
            >
              <span>{msg.text}</span>
              {msg.completed && <Check className="h-3 w-3 text-green-600" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Teaser Message */}
      <Card className="border border-primary/20 relative overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">PRISM Coach AI</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="relative">
            <p className="text-sm text-muted-foreground leading-relaxed">
              I noticed your Confidence ticked up while Stress drift nudged toward LSI under deadlines. 
              Want a 7-day micro-plan that pairs Se reps with Ni guardrails? We can start with one 
              10-minute block tomorrow morning to anchor your dominant Te before the team sync, then 
              layer in a Fi boundary prompt for afternoon context-switching...
            </p>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
            <div className="bg-muted rounded-full p-2 border-2 border-background shadow-lg">
              <Lock className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What Beta Unlocks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What Beta Unlocks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-sm">
              Daily micro-plans tied to your 1D–4D profile (e.g., "Deploy Te (3D) for weekly KPI, protect Fi with a boundary prompt")
            </span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-sm">
              State-aware nudges (Flow vs Stress playbooks)
            </span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-sm">
              Real-time coaching tied to your current drift & dimensions
            </span>
          </div>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="py-8 text-center space-y-4">
          <Button onClick={onJoinBeta} size="lg" className="w-full sm:w-auto">
            <Sparkles className="h-4 w-4 mr-2" />
            Get Your 7-Day Micro-Plan
          </Button>
          <p className="text-xs text-muted-foreground">
            Beta unlocks live coaching in 20 seconds
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
