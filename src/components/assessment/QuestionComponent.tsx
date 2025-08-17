import React from 'react';
import { Question } from "@/data/assessmentQuestions";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface QuestionComponentProps {
  question: Question;
  value: string | number;
  onChange: (value: string | number) => void;
}

export function QuestionComponent({ question, value, onChange }: QuestionComponentProps) {
  const handleLikertClick = (optionIndex: number) => {
    onChange(optionIndex + 1); // Store as 1-5 instead of 0-4
  };

  const handleMultipleChoiceChange = (selectedValue: string) => {
    onChange(selectedValue);
  };

  switch (question.type) {
    case 'likert':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-2">
            {question.options?.map((option, index) => (
              <div key={index} className="text-center">
                <Button
                  variant={value === index + 1 ? "default" : "outline"}
                  className={cn(
                    "w-full mb-2 h-12",
                    value === index + 1 && "prism-gradient-primary text-white"
                  )}
                  onClick={() => handleLikertClick(index)}
                >
                  {index + 1}
                </Button>
                <p className="text-xs text-muted-foreground leading-tight">
                  {option}
                </p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'multiple-choice':
    case 'attention-check':
      return (
        <RadioGroup value={value as string} onValueChange={handleMultipleChoiceChange}>
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label 
                  htmlFor={`option-${index}`} 
                  className="flex-1 cursor-pointer text-sm"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      );

    case 'scale':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-2">
            {question.options?.map((option, index) => (
              <Button
                key={index}
                variant={value === option ? "default" : "outline"}
                className={cn(
                  "text-center p-4 h-auto min-h-[60px]",
                  value === option && "prism-gradient-primary text-white"
                )}
                onClick={() => onChange(option)}
              >
                <span className="text-sm leading-tight">{option}</span>
              </Button>
            ))}
          </div>
        </div>
      );

    case 'demographic':
      return (
        <RadioGroup value={value as string} onValueChange={handleMultipleChoiceChange}>
          <div className="grid grid-cols-2 gap-3">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`demo-${index}`} />
                <Label 
                  htmlFor={`demo-${index}`} 
                  className="flex-1 cursor-pointer text-sm"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      );

    default:
      return <div>Unsupported question type</div>;
  }
}