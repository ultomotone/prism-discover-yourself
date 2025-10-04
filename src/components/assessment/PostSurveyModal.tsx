import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { usePostSurvey, PostSurveyQuestion, PostSurveyAnswer } from '@/hooks/usePostSurvey';
import { Loader2, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

interface PostSurveyModalProps {
  sessionId: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const LIKERT_OPTIONS = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
];

export const PostSurveyModal: React.FC<PostSurveyModalProps> = ({ sessionId, isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [questions, setQuestions] = useState<PostSurveyQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, PostSurveyAnswer>>({});
  const [submitted, setSubmitted] = useState(false);
  
  const { fetchQuestions, submitSurvey, loading } = usePostSurvey();
  const { toast } = useToast();

  const totalSteps = 5;

  useEffect(() => {
    if (isOpen && !submitted) {
      loadQuestions();
    }
  }, [isOpen]);

  const loadQuestions = async () => {
    try {
      const data = await fetchQuestions();
      setQuestions(data);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load survey questions',
        variant: 'destructive',
      });
    }
  };

  const getQuestionsForStep = (currentStep: number): PostSurveyQuestion[] => {
    if (currentStep === 1) return questions.filter(q => q.item_code.startsWith('C'));
    if (currentStep === 2) return questions.filter(q => q.item_code.startsWith('E'));
    if (currentStep === 3) return questions.filter(q => q.item_code.startsWith('A'));
    if (currentStep === 4) return questions.filter(q => q.item_code.startsWith('I') || q.item_code.startsWith('T'));
    if (currentStep === 5) return questions.filter(q => ['NPS', 'WTP', 'OPEN1', 'OPEN2', 'CONSENT_RETEST', 'CONSENT_RESEARCH'].includes(q.item_code));
    return [];
  };

  const isStepComplete = (currentStep: number): boolean => {
    const stepQuestions = getQuestionsForStep(currentStep);
    const requiredQuestions = stepQuestions.filter(q => q.required);
    
    return requiredQuestions.every(q => {
      const answer = answers[q.item_code];
      if (q.response_type === 'TEXT') return true; // Text fields are optional
      return answer && (answer.value_numeric !== undefined || answer.value_text !== undefined);
    });
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!isStepComplete(step)) {
      toast({
        title: 'Incomplete',
        description: 'Please answer all required questions.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const answerArray = Object.values(answers);
      await submitSurvey(sessionId, answerArray);
      
      setSubmitted(true);
      
      // Call optional completion callback
      if (onComplete) {
        onComplete();
      }
      
      toast({
        title: 'Thank you!',
        description: 'Your feedback has been submitted successfully.',
      });

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to submit survey. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const updateAnswer = (itemCode: string, value: Partial<PostSurveyAnswer>) => {
    setAnswers(prev => ({
      ...prev,
      [itemCode]: { ...prev[itemCode], item_code: itemCode, ...value },
    }));
  };

  const renderQuestion = (question: PostSurveyQuestion) => {
    const currentAnswer = answers[question.item_code];

    // Likert Scale
    if (question.response_type === 'LIKERT_5') {
      return (
        <div key={question.item_code} className="space-y-3 p-4 rounded-lg bg-muted/30">
          <Label className="text-base font-medium">{question.item_text}</Label>
          <RadioGroup
            value={currentAnswer?.value_numeric?.toString()}
            onValueChange={(value) => updateAnswer(question.item_code, { value_numeric: parseInt(value) })}
          >
            <div className="grid grid-cols-5 gap-2">
              {LIKERT_OPTIONS.map(option => (
                <div key={option.value} className="flex flex-col items-center space-y-2">
                  <RadioGroupItem value={option.value.toString()} id={`${question.item_code}-${option.value}`} />
                  <Label htmlFor={`${question.item_code}-${option.value}`} className="text-xs text-center cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
      );
    }

    // NPS Scale
    if (question.response_type === 'NPS_0_10') {
      return (
        <div key={question.item_code} className="space-y-4 p-4 rounded-lg bg-muted/30">
          <Label className="text-base font-medium">{question.item_text}</Label>
          <div className="space-y-4">
            <Slider
              value={[currentAnswer?.value_numeric || 5]}
              onValueChange={([value]) => updateAnswer(question.item_code, { value_numeric: value })}
              max={10}
              min={0}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Not at all likely (0)</span>
              <span className="font-bold text-lg">{currentAnswer?.value_numeric || 5}</span>
              <span>Extremely likely (10)</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-destructive">Detractor (0-6)</span>
              <span className="text-yellow-600">Passive (7-8)</span>
              <span className="text-green-600">Promoter (9-10)</span>
            </div>
          </div>
        </div>
      );
    }

    // Text Area
    if (question.response_type === 'TEXT') {
      return (
        <div key={question.item_code} className="space-y-3 p-4 rounded-lg bg-muted/30">
          <Label className="text-base font-medium">{question.item_text}</Label>
          <Textarea
            value={currentAnswer?.value_text || ''}
            onChange={(e) => updateAnswer(question.item_code, { value_text: e.target.value })}
            placeholder="Your answer..."
            maxLength={4000}
            rows={4}
            className="resize-none"
          />
          <div className="text-xs text-muted-foreground text-right">
            {currentAnswer?.value_text?.length || 0} / 4000 characters
          </div>
        </div>
      );
    }

    // Boolean (Checkbox)
    if (question.response_type === 'BOOLEAN') {
      return (
        <div key={question.item_code} className="flex items-start space-x-3 p-4 rounded-lg bg-muted/30">
          <Checkbox
            id={question.item_code}
            checked={currentAnswer?.value_numeric === 1}
            onCheckedChange={(checked) => updateAnswer(question.item_code, { value_numeric: checked ? 1 : 0 })}
          />
          <Label htmlFor={question.item_code} className="text-base font-medium cursor-pointer">
            {question.item_text}
          </Label>
        </div>
      );
    }

    return null;
  };

  const getStepTitle = () => {
    if (step === 1) return 'Question Clarity';
    if (step === 2) return 'Engagement';
    if (step === 3) return 'Accuracy';
    if (step === 4) return 'Insight & Trust';
    if (step === 5) return 'Final Questions';
    return '';
  };

  const getStepDescription = () => {
    if (step === 1) return 'How clear were the assessment questions and results?';
    if (step === 2) return 'How engaging was your assessment experience?';
    if (step === 3) return 'How well do the results fit you?';
    if (step === 4) return 'Did you gain valuable insights? Do you trust the assessment?';
    if (step === 5) return 'Help us improve PRISM with your feedback';
    return '';
  };

  if (submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <DialogTitle className="text-2xl">Thank You!</DialogTitle>
            <DialogDescription className="text-center">
              Your feedback has been submitted successfully and will help us improve PRISM.
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            {getStepTitle()}
            <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded">
              Session: {sessionId.slice(0, 8)}...
            </span>
          </DialogTitle>
          <DialogDescription>{getStepDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round((step / totalSteps) * 100)}% Complete</span>
            </div>
            <Progress value={(step / totalSteps) * 100} />
          </div>

          {/* Questions */}
          <div className="space-y-4">
            {getQuestionsForStep(step).map(renderQuestion)}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={step === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {step < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!isStepComplete(step) || loading}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isStepComplete(step) || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Survey'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
