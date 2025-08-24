import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Question } from "@/data/assessmentQuestions";
import { cn } from "@/lib/utils";

interface ForcedChoiceBlockProps {
  question: Question;
  value: string | number | string[] | number[];
  onChange: (value: string) => void;
  isRequired?: boolean;
  hasError?: boolean;
}

export function ForcedChoiceBlock({ question, value, onChange, isRequired = false, hasError = false }: ForcedChoiceBlockProps) {
  const selectedValue = typeof value === 'string' ? value : '';

  return (
    <div className={cn(
      "p-4 border rounded-lg transition-colors",
      hasError ? "border-destructive bg-destructive/5" : "border-border",
      "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
    )}>
      {/* Block Header */}
      <div className="mb-4">
        <h3 className="font-medium text-base mb-2">
          {question.text}
          {isRequired && <span className="text-destructive ml-1" aria-label="required">*</span>}
        </h3>
        {/* Instructions could be added here when supported */}
      </div>

      {/* Radio Group */}
      <RadioGroup 
        value={selectedValue} 
        onValueChange={onChange}
        className="space-y-3"
        aria-required={isRequired}
        aria-invalid={hasError}
        aria-describedby={hasError ? `error-${question.id}` : undefined}
      >
        {question.options?.map((option, index) => (
          <div key={index} className="flex items-start space-x-3">
            <RadioGroupItem 
              value={option} 
              id={`fc-${question.id}-option-${index}`}
              className="mt-1"
            />
            <Label 
              htmlFor={`fc-${question.id}-option-${index}`}
              className="flex-1 cursor-pointer text-sm leading-relaxed"
            >
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>

      {/* Error Message */}
      {hasError && (
        <div 
          id={`error-${question.id}`} 
          className="mt-3 text-sm text-destructive"
          role="alert"
        >
          Please select one option to continue.
        </div>
      )}

      {/* Progress Indicator */}
      {question.tag?.startsWith('FC_') && (
        <div className="mt-3 pt-3 border-t border-muted text-xs text-muted-foreground">
          Type: {question.type?.replace('forced-choice-', '')} options
        </div>
      )}
    </div>
  );
}