import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const questions = [
  "We both know what the other counts as good support this week.",
  "We schedule decisions for calmer times.",
  "We have one green lane we actively lean on.",
  "We have one yellow/red lane we're upgrading with a tiny ritual.",
  "We can name our common drift contexts (Flow/Performative/Stress)."
];

export default function QuickSelfCheck() {
  const [checked, setChecked] = useState<boolean[]>(new Array(questions.length).fill(false));

  const handleCheck = (index: number, value: boolean) => {
    const newChecked = [...checked];
    newChecked[index] = value;
    setChecked(newChecked);
  };

  const checkedCount = checked.filter(Boolean).length;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Quick Self-Check</h3>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">5 Questions to Find Your Leverage Points</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((question, index) => (
            <div key={index} className="flex items-start space-x-3">
              <Checkbox
                id={`question-${index}`}
                checked={checked[index]}
                onCheckedChange={(value) => handleCheck(index, !!value)}
                className="mt-1"
              />
              <label 
                htmlFor={`question-${index}`} 
                className="text-sm leading-relaxed cursor-pointer"
              >
                {question}
              </label>
            </div>
          ))}
          
          {checkedCount >= 3 && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <Badge className="mb-2 bg-primary">Strong Foundation</Badge>
              <p className="text-sm">
                Nice—focus on <strong>Supply↔Demand</strong> this week: make one lane green and protect a calm window.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}