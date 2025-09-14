import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const lanes = [
  { name: "Structure", status: "green" },
  { name: "Care", status: "yellow" },
  { name: "Energy", status: "green" },
  { name: "Timing", status: "red" },
  { name: "Meaning", status: "green" }
];

export default function PairReportMini() {
  return (
    <Card aria-label="Mini pair report" role="img">
      <CardHeader>
        <CardTitle className="text-lg">Pair Report Mini</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex flex-wrap gap-2">
          {lanes.map((lane) => (
            <Badge
              key={lane.name}
              className={`rounded-full px-2 py-1 ${
                lane.status === "green"
                  ? "bg-rf-supportive text-white"
                  : lane.status === "yellow"
                  ? "bg-rf-stretch text-white"
                  : "bg-rf-friction text-white"
              }`}
            >
              {lane.name}
            </Badge>
          ))}
        </div>
        <p className="text-muted-foreground">State effect: calmer evenings raise timing coverage.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>15‑min weekly pacing sync</li>
          <li>Use a “pause word” for values friction</li>
        </ul>
      </CardContent>
    </Card>
  );
}

