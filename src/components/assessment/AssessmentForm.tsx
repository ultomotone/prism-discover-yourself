import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { assessmentQuestions, Question } from "@/data/assessmentQuestions";
import { QuestionComponent } from "./QuestionComponent";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface AssessmentResponse {
  questionId: number;
  answer: string | number;
}

interface AssessmentFormProps {
  onComplete: (responses: AssessmentResponse[], sessionId: string) => void;
  onBack?: () => void;
}

export function AssessmentForm({ onComplete, onBack }: AssessmentFormProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<string | number>('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const currentQuestion = assessmentQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / assessmentQuestions.length) * 100;
  const isLastQuestion = currentQuestionIndex === assessmentQuestions.length - 1;
  
  // Get current section questions for progress within section
  const currentSection = currentQuestion?.section;
  const sectionQuestions = assessmentQuestions.filter(q => q.section === currentSection);
  const sectionProgress = sectionQuestions.findIndex(q => q.id === currentQuestion?.id) + 1;

  // Initialize assessment session on component mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        console.log('Initializing assessment session...');
        
        // Get current user (null if anonymous)
        const { data: { user } } = await supabase.auth.getUser();
        
        const { data, error } = await supabase
          .from('assessment_sessions')
          .insert({
            user_id: user?.id || null,
            session_type: 'prism',
            total_questions: assessmentQuestions.length,
            metadata: {
              browser: navigator.userAgent,
              timestamp: new Date().toISOString(),
              anonymous: !user?.id
            }
          })
          .select('id')
          .single();

        if (error) {
          console.error('Error creating session:', error);
          console.error('Error details:', error.message, error.code, error.details);
          toast({
            title: "Failed to Initialize",
            description: "Could not start assessment session. Please refresh the page and try again.",
            variant: "destructive",
          });
          return;
        }

        console.log('Session initialized successfully:', data.id);
        setSessionId(data.id);
        setQuestionStartTime(Date.now());
      } catch (error) {
        console.error('Error initializing session:', error);
        toast({
          title: "Failed to Initialize", 
          description: "An unexpected error occurred. Please refresh the page and try again.",
          variant: "destructive",
        });
      }
    };

    initializeSession();
  }, [toast]);

  useEffect(() => {
    // Reset question start time when moving to a new question
    setQuestionStartTime(Date.now());
    
    // Load existing response if it exists
    const existingResponse = responses.find(r => r.questionId === currentQuestion?.id);
    if (existingResponse) {
      setCurrentAnswer(existingResponse.answer);
    } else {
      setCurrentAnswer('');
    }
  }, [currentQuestionIndex, responses, currentQuestion?.id]);

  const saveResponseToSupabase = async (response: AssessmentResponse, responseTime: number) => {
    if (!sessionId) return;

    try {
      const { error } = await supabase
        .from('assessment_responses')
        .insert({
          session_id: sessionId,
          question_id: response.questionId,
          question_text: currentQuestion.text,
          question_type: currentQuestion.type,
          question_section: currentQuestion.section,
          answer_value: String(response.answer),
          answer_numeric: typeof response.answer === 'number' ? response.answer : null,
          response_time_ms: responseTime
        });

      if (error) {
        console.error('Error saving response:', error);
        // Don't show error to user for individual responses to avoid interrupting flow
      }
    } catch (error) {
      console.error('Error saving response to Supabase:', error);
    }
  };

  const updateSessionProgress = async () => {
    if (!sessionId) return;

    try {
      await supabase
        .from('assessment_sessions')
        .update({
          completed_questions: currentQuestionIndex + 1
        })
        .eq('id', sessionId);
    } catch (error) {
      console.error('Error updating session progress:', error);
    }
  };

  const handleAnswerChange = (answer: string | number) => {
    setCurrentAnswer(answer);
  };

  const handleNext = async () => {
    if (!currentAnswer && currentQuestion.required) {
      toast({
        title: "Answer Required",
        description: "Please provide an answer before continuing.",
        variant: "destructive",
      });
      return;
    }

    if (!sessionId) {
      toast({
        title: "Session Error", 
        description: "Assessment session not initialized. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const responseTime = Date.now() - questionStartTime;

      // Save current response
      const newResponse: AssessmentResponse = {
        questionId: currentQuestion.id,
        answer: currentAnswer
      };

      // Save to Supabase
      await saveResponseToSupabase(newResponse, responseTime);

      // Update local state
      setResponses(prev => {
        const filtered = prev.filter(r => r.questionId !== currentQuestion.id);
        return [...filtered, newResponse];
      });

      // Update session progress
      await updateSessionProgress();

      if (isLastQuestion) {
        // Mark session as complete
        await supabase
          .from('assessment_sessions')
          .update({
            completed_at: new Date().toISOString(),
            completed_questions: assessmentQuestions.length
          })
          .eq('id', sessionId);

        // Complete assessment
        const finalResponses = responses.filter(r => r.questionId !== currentQuestion.id);
        finalResponses.push(newResponse);
        onComplete(finalResponses, sessionId);
      } else {
        // Move to next question
        setCurrentQuestionIndex(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error saving response:', error);
      toast({
        title: "Error",
        description: "Failed to save response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (onBack) {
      onBack();
    }
  };

  if (!currentQuestion) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8">
          <p className="text-center text-muted-foreground">Loading assessment...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-8">
      <div className="prism-container">
        <div className="max-w-3xl mx-auto">
          {/* Header with Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-primary">PRISM Assessment</h1>
              <span className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {assessmentQuestions.length}
              </span>
            </div>
            
            <Progress value={progress} className="mb-2" />
            
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{currentSection}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            
            {sectionQuestions.length > 1 && (
              <div className="mt-2">
                <span className="text-xs text-muted-foreground">
                  Section Progress: {sectionProgress} of {sectionQuestions.length}
                </span>
              </div>
            )}
          </div>

          {/* Question Card */}
          <Card className="mb-8 prism-shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">
                {currentQuestion.text}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QuestionComponent
                question={currentQuestion}
                value={currentAnswer}
                onChange={handleAnswerChange}
              />
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              {currentQuestionIndex === 0 ? 'Back to Intro' : 'Previous'}
            </Button>

            <Button
              onClick={handleNext}
              disabled={isLoading}
              className="flex items-center gap-2"
              variant={isLastQuestion ? 'hero' : 'default'}
            >
              {isLoading ? 'Saving...' : isLastQuestion ? 'Complete Assessment' : 'Next'}
              {!isLastQuestion && !isLoading && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}