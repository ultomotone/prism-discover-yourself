import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Question } from "@/data/assessmentQuestions";

interface ForcedChoiceBlockProps {
  question: Question;
  value: string | null;
  onChange: (value: string | null) => void;
  questionNumber: number;
}

export function ForcedChoiceBlock({ question, value, onChange, questionNumber }: ForcedChoiceBlockProps) {
  // Clean display labels (remove internal tags like "(Ni)")
  const cleanLabel = (label: string) => {
    return label.replace(/\s*\([^)]+\)\s*$/g, '').trim();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">
          Question {questionNumber}: {question.text}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose the option that best describes you:
        </p>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}