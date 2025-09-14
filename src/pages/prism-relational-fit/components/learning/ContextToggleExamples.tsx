import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ContextToggleExamples() {
  const [context, setContext] = useState<"work" | "relationship">("work");

  const examples = {
    work: [
      "Asking for clarity without micro-managing",
      "Protecting deep-work windows", 
      "Pacing across teams",
      "Boundary-setting with demanding stakeholders",
      "Handoff rituals between high/low energy colleagues"
    ],
    relationship: [
      "Weekend planning ritual",
      "When values collide",
      "Repair after a fast decision",
      "Managing different social batteries",
      "Splitting emotional labor fairly"
    ]
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Work vs. Relationship Learning Paths</h3>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Choose Your Context</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant={context === "work" ? "default" : "outline"}
              size="sm"
              onClick={() => setContext("work")}
            >
              Work
            </Button>
            <Button 
              variant={context === "relationship" ? "default" : "outline"}
              size="sm"
              onClick={() => setContext("relationship")}
            >
              Relationship
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {examples[context].map((example, index) => (
              <li key={index} className="text-sm flex items-start">
                <span className="text-primary mr-2">•</span>
                {example}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}