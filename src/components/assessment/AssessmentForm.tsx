import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { assessmentQuestions, Question } from "@/data/assessmentQuestions";
import { QuestionComponent } from "./QuestionComponent";
import { useToast } from "@/hooks/use-toast";

export interface AssessmentResponse {
  questionId: number;
  answer: string | number;
}

interface AssessmentFormProps {
  onComplete: (responses: AssessmentResponse[]) => void;
  onBack?: () => void;
}

export function AssessmentForm({ onComplete, onBack }: AssessmentFormProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<string | number>('');
  const { toast } = useToast();

  const currentQuestion = assessmentQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / assessmentQuestions.length) * 100;
  const isLastQuestion = currentQuestionIndex === assessmentQuestions.length - 1;
  
  // Get current section questions for progress within section
  const currentSection = currentQuestion?.section;
  const sectionQuestions = assessmentQuestions.filter(q => q.section === currentSection);
  const sectionProgress = sectionQuestions.findIndex(q => q.id === currentQuestion?.id) + 1;

  useEffect(() => {
    // Load existing response if it exists
    const existingResponse = responses.find(r => r.questionId === currentQuestion?.id);
    if (existingResponse) {
      setCurrentAnswer(existingResponse.answer);
    } else {
      setCurrentAnswer('');
    }
  }, [currentQuestionIndex, responses, currentQuestion?.id]);

  const handleAnswerChange = (answer: string | number) => {
    setCurrentAnswer(answer);
  };

  const handleNext = () => {
    if (!currentAnswer && currentQuestion.required) {
      toast({
        title: "Answer Required",
        description: "Please provide an answer before continuing.",
        variant: "destructive",
      });
      return;
    }

    // Save current response
    const newResponse: AssessmentResponse = {
      questionId: currentQuestion.id,
      answer: currentAnswer
    };

    setResponses(prev => {
      const filtered = prev.filter(r => r.questionId !== currentQuestion.id);
      return [...filtered, newResponse];
    });

    if (isLastQuestion) {
      // Complete assessment
      const finalResponses = responses.filter(r => r.questionId !== currentQuestion.id);
      finalResponses.push(newResponse);
      onComplete(finalResponses);
    } else {
      // Move to next question
      setCurrentQuestionIndex(prev => prev + 1);
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
    <div className="min-h-screen bg-background py-8">
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
              className="flex items-center gap-2"
              variant={isLastQuestion ? 'hero' : 'default'}
            >
              {isLastQuestion ? 'Complete Assessment' : 'Next'}
              {!isLastQuestion && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}