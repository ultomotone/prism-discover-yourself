import React from 'react';
import { Question } from "@/data/assessmentQuestions";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface QuestionComponentProps {
  question: Question;
  value: string | number | string[] | number[];
  onChange: (value: string | number | string[] | number[]) => void;
}

export function QuestionComponent({ question, value, onChange }: QuestionComponentProps) {
  const handleLikertClick = (optionValue: number) => {
    onChange(optionValue);
  };

  const handleMultipleChoiceChange = (selectedValue: string) => {
    onChange(selectedValue);
  };

  switch (question.type) {
    case 'email':
      return (
        <input
          type="email"
          value={value?.toString() || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="your@email.com"
        />
      );

    case 'text':
      return (
        <input
          type="text"
          value={value?.toString() || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        />
      );

    case 'likert-1-5':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className="text-center">
                <Button
                  variant={value === num ? "default" : "outline"}
                  className={cn(
                    "w-full mb-2 h-12",
                    value === num && "prism-gradient-primary text-white"
                  )}
                  onClick={() => handleLikertClick(num)}
                >
                  {num}
                </Button>
                <p className="text-xs text-muted-foreground leading-tight">
                  {question.options?.[num - 1]?.replace(`${num}=`, '') || ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'likert-1-7':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
              <div key={num} className="text-center">
                <Button
                  variant={value === num ? "default" : "outline"}
                  className={cn(
                    "w-full mb-2 h-12 text-sm",
                    value === num && "prism-gradient-primary text-white"
                  )}
                  onClick={() => handleLikertClick(num)}
                >
                  {num}
                </Button>
                <p className="text-xs text-muted-foreground leading-tight">
                  {question.options?.[num - 1]?.replace(`${num}=`, '') || ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'state-1-7':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-1">
            {question.options?.map((option, index) => (
              <div key={index} className="text-center">
                <Button
                  variant={value === option ? "default" : "outline"}
                  className={cn(
                    "w-full mb-2 h-12 text-sm",
                    value === option && "prism-gradient-primary text-white"
                  )}
                  onClick={() => onChange(option)}
                >
                  {index + 1}
                </Button>
                <p className="text-xs text-muted-foreground leading-tight">
                  {option.replace(/^\d+=/, '')}
                </p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'matrix':
      return (
        <div className="space-y-6">
          {question.parts?.map((part, partIndex) => (
            <div key={partIndex} className="space-y-2">
              <h4 className="font-medium text-sm">{part.label}</h4>
              <RadioGroup 
                value={(Array.isArray(value) ? value[partIndex] : '') as string} 
                onValueChange={(selectedValue) => {
                  const newValue = Array.isArray(value) ? [...value as string[]] : [];
                  newValue[partIndex] = selectedValue;
                  onChange(newValue);
                }}
              >
                <div className="space-y-2">
                  {part.options?.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`part-${partIndex}-option-${optionIndex}`} />
                      <Label 
                        htmlFor={`part-${partIndex}-option-${optionIndex}`}
                        className="flex-1 cursor-pointer text-sm"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          ))}
        </div>
      );

    case 'select-all':
      return (
        <div className="space-y-3">
          {question.options?.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`checkbox-${index}`}
                checked={Array.isArray(value) && (value as string[]).includes(option)}
                onChange={(e) => {
                  const currentValue = Array.isArray(value) ? [...value as string[]] : [];
                  if (e.target.checked) {
                    onChange([...currentValue, option]);
                  } else {
                    onChange(currentValue.filter(v => v !== option));
                  }
                }}
                className="rounded border-border"
              />
              <Label 
                htmlFor={`checkbox-${index}`}
                className="flex-1 cursor-pointer text-sm"
              >
                {option}
              </Label>
            </div>
          ))}
        </div>
      );

    case 'ranking':
      return (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Rank your top 3 preferences (1 = most preferred)</p>
          {question.options?.map((option, index) => (
            <div key={index} className="flex items-center space-x-3">
              <select
                value={(Array.isArray(value) && value[index]) || ''}
                onChange={(e) => {
                  const newValue = Array.isArray(value) ? [...value as string[]] : [];
                  newValue[index] = e.target.value;
                  onChange(newValue);
                }}
                className="w-16 px-2 py-1 border border-border rounded text-sm"
              >
                <option value="">-</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
              <Label className="flex-1 text-sm">{option}</Label>
            </div>
          ))}
        </div>
      );

    case 'yes-no':
    case 'multiple-choice':
    case 'forced-choice-2':
    case 'forced-choice-4':
    case 'forced-choice-5':
    case 'categorical-5':
    case 'frequency':
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

    default:
      return <div>Unsupported question type: {question.type}</div>;
  }
}