import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, RotateCcw } from "lucide-react";

interface SessionConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflictType: 'resume' | 'recent_completion' | null;
  email: string;
  daysSinceCompletion?: number;
  onResumeSession: () => void;
  onStartNew: () => void;
  onRetakeLater: () => void;
}

export const SessionConflictModal: React.FC<SessionConflictModalProps> = ({
  isOpen,
  onClose,
  conflictType,
  email,
  daysSinceCompletion,
  onResumeSession,
  onStartNew,
  onRetakeLater,
}) => {
  if (!conflictType) return null;

  const renderResumeContent = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          Assessment in Progress
        </DialogTitle>
        <DialogDescription className="space-y-3">
          <p>
            You have an assessment in progress for <strong>{email}</strong>.
          </p>
          <p>
            You can resume where you left off, or start over with a fresh assessment.
          </p>
        </DialogDescription>
      </DialogHeader>
      
      <div className="flex gap-3 pt-4">
        <Button onClick={onResumeSession} className="flex-1">
          Resume Assessment
        </Button>
        <Button 
          variant="outline" 
          onClick={onStartNew}
          className="flex-1"
        >
          Start Over
        </Button>
      </div>
    </>
  );

  const renderRecentCompletionContent = () => {
    const isVeryRecent = (daysSinceCompletion || 0) < 30;
    
    return (
      <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Recent Assessment Found
          </DialogTitle>
          <DialogDescription className="space-y-3">
            <p>
              You completed the PRISM assessment {Math.round(daysSinceCompletion || 0)} days ago.
            </p>
            {isVeryRecent ? (
              <>
                <p className="text-amber-600">
                  <strong>Taking it again so soon will be marked as a "Redo"</strong> and won't count toward your stats or show meaningful changes.
                </p>
                <p>
                  For best results, we recommend waiting at least 30 days between assessments to capture genuine personality changes.
                </p>
              </>
            ) : (
              <p className="text-green-600">
                Your retake will be marked as a "Retest" and we'll show you what changed from your previous results.
              </p>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-3 pt-4">
          {isVeryRecent ? (
            <>
              <Button 
                variant="outline" 
                onClick={onRetakeLater}
                className="flex-1"
              >
                I'll Wait
              </Button>
              <Button 
                onClick={onStartNew}
                className="flex-1"
                variant="secondary"
              >
                Take Redo Anyway
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={onStartNew}
                className="flex-1"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Take Retest
              </Button>
              <Button 
                variant="outline" 
                onClick={onRetakeLater}
                className="flex-1"
              >
                Maybe Later
              </Button>
            </>
          )}
        </div>
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        {conflictType === 'resume' && renderResumeContent()}
        {conflictType === 'recent_completion' && renderRecentCompletionContent()}
      </DialogContent>
    </Dialog>
  );
};