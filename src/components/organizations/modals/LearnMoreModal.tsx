import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle } from "lucide-react";

interface LearnMoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: string;
}

const modalContent = {
  "owner-discovery": {
    title: "Owner/Leader Discovery",
    duration: "20m • 49 credits",
    outcome: "Clarity on leadership signals and immediate growth levers",
    deliverables: ["Mini-report with key insights", "2 operating recommendations", "Growth opportunity assessment"],
    nextStep: "Optional Leadership Debrief or Team Compass Workshop",
    description: "A focused session designed to quickly identify your leadership patterns and the most impactful areas for immediate improvement."
  },
  "leadership-debrief": {
    title: "Leadership Debrief",
    duration: "60m",
    outcome: "Align leadership style with GTM motion",
    deliverables: ["Comprehensive debrief session", "Personal behavior map", "Team operating rules framework"],
    nextStep: "Leader Coaching & Training program",
    description: "Deep dive into your leadership approach with practical frameworks for translating your style into effective team operations."
  },
  "team-compass": {
    title: "Team Compass Workshop",
    duration: "90m",
    outcome: "Shared language for communication & decisions",
    deliverables: ["Team Group Report", "Facilitated workshop session", "Communication action plan"],
    nextStep: "Team Performance Sprint",
    description: "Interactive workshop that builds mutual understanding and establishes clear communication patterns for your team."
  },
  "team-sprint": {
    title: "Team Performance Sprint",
    duration: "2 months",
    outcome: "Measurable gains in collaboration & execution",
    deliverables: ["Weekly sprint sessions", "Performance KPIs tracking", "Retrospective playbook"],
    nextStep: "Transition to Operationalize phase",
    description: "Intensive program to rapidly improve team effectiveness with measurable outcomes and sustainable practices."
  }
};

export function LearnMoreModal({ isOpen, onClose, type }: LearnMoreModalProps) {
  const content = modalContent[type as keyof typeof modalContent];
  
  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{content.title}</DialogTitle>
          <Badge variant="outline" className="w-fit">{content.duration}</Badge>
          <DialogDescription className="text-base mt-4">
            {content.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-6">
          <div>
            <h4 className="font-semibold mb-2 flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Outcome
            </h4>
            <p className="text-muted-foreground">{content.outcome}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">What's Included</h4>
            <ul className="space-y-2">
              {content.deliverables.map((item, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Recommended Next Step</h4>
            <p className="text-sm text-muted-foreground">{content.nextStep}</p>
          </div>

          <div className="bg-primary/5 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-primary">How this supports RevOps outcomes</h4>
            <p className="text-sm">
              This service directly feeds into our organizational rollout methodology, providing the leadership clarity and team alignment necessary for successful PRISM implementation across your revenue operations.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={onClose} className="flex-1">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={onClose}>
              Back to Programs
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}