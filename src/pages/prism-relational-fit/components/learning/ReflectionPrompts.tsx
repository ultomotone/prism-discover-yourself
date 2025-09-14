import React from "react";
import { Textarea } from "@/components/ui/textarea";

const prompts = [
  "Where do I over-supply and feel resentful?",
  "Which lane do I under-ask for?",
  "What does 'green' look like for us this week?"
];

export default function ReflectionPrompts() {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Reflection Prompts</h3>
      <div className="space-y-4">
        {prompts.map((prompt, index) => (
          <div key={index}>
            <label className="block text-sm font-medium mb-2">
              {prompt}
            </label>
            <Textarea 
              placeholder="Your thoughts..."
              className="resize-none"
              rows={3}
            />
          </div>
        ))}
      </div>
    </div>
  );
}