import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight } from "lucide-react";

const dailyPrompts = [
  "Name today's primary lane.",
  "Protect one calm window for decisions.",
  "Ask for one specific support.",
  "Give one specific support.", 
  "Notice one drift moment (Flow/Performative/Stress).",
  "Do one 5-min repair if needed.",
  "Celebrate one green lane."
];

export default function MiniCourseChecklist() {
  const [checked, setChecked] = useState<boolean[]>(new Array(dailyPrompts.length).fill(false));

  const handleCheck = (index: number, value: boolean) => {
    const newChecked = [...checked];
    newChecked[index] = value;
    setChecked(newChecked);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">The 7-Day Mini-Course</h3>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daily Practice Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dailyPrompts.map((prompt, index) => (
            <div key={index} className="flex items-start space-x-3">
              <Checkbox
                id={`day-${index + 1}`}
                checked={checked[index]}
                onCheckedChange={(value) => handleCheck(index, !!value)}
                className="mt-1"
              />
              <label 
                htmlFor={`day-${index + 1}`} 
                className="text-sm leading-relaxed cursor-pointer"
              >
                <span className="font-medium">Day {index + 1}:</span> {prompt}
              </label>
            </div>
          ))}
          
          <div className="mt-6 p-4 bg-primary/10 rounded-lg text-center">
            <p className="text-sm mb-3">
              Want tailored guidance? Book a <strong>Compatibility Debrief</strong> and we'll personalize your lanes, states, and habits.
            </p>
            <Button asChild size="lg">
              <a href="/book/compatibility-debrief" aria-label="Book Compatibility Debrief">
                Book Compatibility Debrief
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}