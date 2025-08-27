import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from 'lucide-react';
import { RealFCBlock } from './RealFCBlock';
import { 
  loadFCBlocks, 
  checkFCCompletion, 
  scoreFCSession, 
  getFCCoverageBucket,
  type FCBlock 
} from '@/services/fcBlockService';
import { useToast } from '@/hooks/use-toast';

interface FCBlockManagerProps {
  sessionId: string;
  onComplete: (fcData: {
    completedBlocks: number;
    totalBlocks: number;
    coverageBucket: string;
    scoringData?: any;
  }) => void;
  onSkip?: () => void;
}

export function FCBlockManager({ sessionId, onComplete, onSkip }: FCBlockManagerProps) {
  const [fcBlocks, setFCBlocks] = useState<FCBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    initializeFCBlocks();
  }, [sessionId]);

  const initializeFCBlocks = async () => {
    try {
      console.log('Initializing FC blocks for session:', sessionId);
      
      // Load FC blocks and check existing completion
      const [{ blocks }, completion] = await Promise.all([
        loadFCBlocks(),
        checkFCCompletion(sessionId)
      ]);

      setFCBlocks(blocks);

      if (completion.completed) {
        console.log('FC blocks already completed');
        setCompleted(true);
        handleFCCompletion();
      } else {
        console.log(`FC blocks loaded: ${blocks.length} total, ${completion.completedBlocks} completed`);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error initializing FC blocks:', err);
      setError('Failed to load Forced Choice blocks. You can skip this section.');
      setLoading(false);
    }
  };

  const handleFCAnswer = (blockId: string, optionId: string) => {
    console.log(`FC answer received: block=${blockId}, option=${optionId}`);
  };

  const handleFCCompletion = async () => {
    if (completed || scoring) return;

    try {
      setScoring(true);
      console.log('Handling FC completion...');

      // Check completion status
      const completion = await checkFCCompletion(sessionId);
      console.log('Final FC completion check:', completion);

      // Score the FC session
      let scoringData = null;
      try {
        scoringData = await scoreFCSession(sessionId);
        console.log('FC scoring successful:', scoringData);
      } catch (scoringError) {
        console.error('FC scoring failed, but continuing:', scoringError);
        // Don't fail the whole process if scoring fails
      }

      // Calculate coverage bucket
      const coverageBucket = getFCCoverageBucket(
        completion.completedBlocks, 
        completion.totalBlocks
      );

      setCompleted(true);

      toast({
        title: "Forced Choice Complete",
        description: `Completed ${completion.completedBlocks}/${completion.totalBlocks} blocks. Coverage: ${coverageBucket}`,
      });

      // Notify parent component
      onComplete({
        completedBlocks: completion.completedBlocks,
        totalBlocks: completion.totalBlocks,
        coverageBucket,
        scoringData
      });

    } catch (err) {
      console.error('Error in FC completion:', err);
      toast({
        title: "FC Processing Error",
        description: "There was an issue processing your responses, but you can continue.",
        variant: "destructive",
      });

      // Still mark as complete to avoid blocking the user
      const completion = await checkFCCompletion(sessionId);
      const coverageBucket = getFCCoverageBucket(
        completion.completedBlocks, 
        completion.totalBlocks
      );

      onComplete({
        completedBlocks: completion.completedBlocks,
        totalBlocks: completion.totalBlocks,
        coverageBucket
      });
    } finally {
      setScoring(false);
    }
  };

  const handleSkip = () => {
    console.log('User chose to skip FC blocks');
    toast({
      title: "Section Skipped",
      description: "You can still get results, but Forced Choice data will improve accuracy.",
    });

    onComplete({
      completedBlocks: 0,
      totalBlocks: fcBlocks.length || 4,
      coverageBucket: 'None'
    });

    if (onSkip) onSkip();
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading Forced Choice blocks...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="space-x-4">
            <Button onClick={initializeFCBlocks} variant="outline">
              Try Again
            </Button>
            <Button onClick={handleSkip}>
              Skip This Section
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (completed) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-8">
          <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
          <span>Forced Choice blocks completed!</span>
          {scoring && (
            <>
              <Loader2 className="h-4 w-4 animate-spin ml-4 mr-2" />
              <span className="text-sm text-muted-foreground">Processing scores...</span>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  if (fcBlocks.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground mb-4">
            No Forced Choice blocks are currently available.
          </p>
          <Button onClick={handleSkip}>
            Continue Assessment
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <RealFCBlock
        sessionId={sessionId}
        onComplete={handleFCCompletion}
        onAnswer={handleFCAnswer}
      />
      
      <div className="flex justify-center">
        <Button 
          onClick={handleSkip} 
          variant="ghost" 
          size="sm"
          className="text-muted-foreground"
        >
          Skip Forced Choice Section
        </Button>
      </div>
    </div>
  );
}