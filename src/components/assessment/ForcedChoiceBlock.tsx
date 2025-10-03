import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Question } from "@/data/assessmentQuestions";

interface ForcedChoiceBlockProps {
  question: Question;
  value: string | null;
  onChange: (value: string | null) => void;
  questionNumber: number;
}

export function ForcedChoiceBlock({ question, value, onChange }: ForcedChoiceBlockProps) {
  // Clean display labels (remove internal tags like "(Ni)")
  const cleanLabel = (label: string) => {
    return label.replace(/\s*\([^)]+\)\s*$/g, '').trim();
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Choose the option that best describes you:
      </p>
      <RadioGroup 
        value={value ?? ''} 
        onValueChange={(newValue) => onChange(newValue || null)}
        className="space-y-3"
      >
        {question.options?.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <RadioGroupItem 
              value={option} 
              id={`${question.id}-${index}`}
            />
            <Label 
              htmlFor={`${question.id}-${index}`}
              className="flex-1 cursor-pointer leading-relaxed"
            >
              {cleanLabel(option)}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}