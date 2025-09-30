import React, { useState } from 'react';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QuestionFlagButtonProps {
  sessionId: string;
  questionId: number;
}

export function QuestionFlagButton({ sessionId, questionId }: QuestionFlagButtonProps) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [isFlagged, setIsFlagged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleFlag = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('assessment_item_flags')
        .insert({
          session_id: sessionId,
          question_id: questionId,
          flag_type: 'unclear',
          note: note.trim() || null,
        });

      if (error) throw error;

      setIsFlagged(true);
      setOpen(false);
      toast({
        title: 'Question flagged',
        description: 'Thank you for helping us improve!',
      });
    } catch (error) {
      console.error('Error flagging question:', error);
      toast({
        title: 'Failed to flag',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={isFlagged ? 'text-orange-500' : 'text-muted-foreground'}
          title="Flag as unclear or confusing"
        >
          <Flag className="h-4 w-4 mr-1" />
          {isFlagged ? 'Flagged' : 'Flag'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-sm mb-1">Flag this question</h4>
            <p className="text-xs text-muted-foreground">
              Let us know if this question is unclear or confusing
            </p>
          </div>
          <Textarea
            placeholder="What's unclear? (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[80px] text-sm"
            disabled={isSubmitting}
          />
          <div className="flex gap-2">
            <Button
              onClick={handleFlag}
              disabled={isSubmitting}
              size="sm"
              className="flex-1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Flag'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
