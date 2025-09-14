import React from "react";
import { Badge } from "@/components/ui/badge";

const myths = [
  {
    myth: "If we're duals, it should always be easy.",
    fact: "Drift and stress still change coverage."
  },
  {
    myth: "High Neuroticism means I'm broken.",
    fact: "It means your capacity swings more; recovery comes first."
  },
  {
    myth: "Label = destiny.",
    fact: "Rituals outperform labels in daily life."
  }
];

export default function MythFactRows() {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Myth vs. Fact</h3>
      <div className="space-y-4">
        {myths.map((item, index) => (
          <div key={index} className="flex flex-col sm:flex-row gap-3 p-4 border rounded-lg">
            <div className="flex-1">
              <Badge variant="destructive" className="mb-2">Myth</Badge>
              <p className="text-sm">{item.myth}</p>
            </div>
            <div className="flex-1">
              <Badge className="mb-2 bg-green-600">Fact</Badge>
              <p className="text-sm">{item.fact}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}