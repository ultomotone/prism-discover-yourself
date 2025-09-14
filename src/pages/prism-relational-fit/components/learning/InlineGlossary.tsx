import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const terms = [
  { term: "Supply", definition: "What you can offer on repeat without resentment." },
  { term: "Demand", definition: "What you reliably value and request." },
  { term: "Lanes", definition: "Structure, Care, Energy, Timing, Meaning." },
  { term: "Reg+", definition: "Calm state with expanded capacity." },
  { term: "Reg0", definition: "Neutral baseline state." },
  { term: "Reg−", definition: "Stressed state with reduced capacity." },
  { term: "Drift", definition: "Temporary orientation resembling another type in specific contexts." },
  { term: "Fit Band", definition: "Supportive / Stretch / Friction categories." }
];

export default function InlineGlossary() {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Quick Glossary</h3>
      <Card>
        <CardContent className="pt-4">
          <dl className="grid gap-3 sm:grid-cols-2">
            {terms.map((item, index) => (
              <div key={index} className="flex flex-col">
                <dt className="font-semibold text-sm">{item.term}:</dt>
                <dd className="text-sm text-muted-foreground">{item.definition}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}