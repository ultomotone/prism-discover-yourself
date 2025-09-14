import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

interface PairSummaryProps {
  context: "Flow" | "Performative" | "Stress";
}

const contextData = {
  Flow: {
    band: "Supportive",
    bandColor: "bg-green-500",
    scores: { supply: 85, core: 75, drift: 65 },
    stateMix: [
      { name: "Calm", value: 65, fill: "#4ade80" },
      { name: "Neutral", value: 25, fill: "#facc15" },
      { name: "Stressed", value: 10, fill: "#ef4444" }
    ],
    habits: [
      "Weekly 15-minute 'pace + priorities' sync (protects Structure & Timing lanes)",
      "Agree a pause word for values friction; reschedule decisions when Stressed×Stressed appears"
    ]
  },
  Performative: {
    band: "Stretch",
    bandColor: "bg-yellow-500",
    scores: { supply: 50, core: 61, drift: 20 },
    stateMix: [
      { name: "Calm", value: 35, fill: "#4ade80" },
      { name: "Neutral", value: 40, fill: "#facc15" },
      { name: "Stressed", value: 25, fill: "#ef4444" }
    ],
    habits: [
      "Time-box emotional labor; end-of-day handoff ritual",
      "Create buffer zones around high-stakes interactions"
    ]
  },
  Stress: {
    band: "Friction",
    bandColor: "bg-red-500",
    scores: { supply: 30, core: 45, drift: 15 },
    stateMix: [
      { name: "Calm", value: 15, fill: "#4ade80" },
      { name: "Neutral", value: 30, fill: "#facc15" },
      { name: "Stressed", value: 55, fill: "#ef4444" }
    ],
    habits: [
      "Recover capacity first before making big decisions",
      "Use 'minimum viable connection' during overwhelm periods"
    ]
  }
};

export default function PairSummaryCard({ context }: PairSummaryProps) {
  const data = contextData[context];

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Pair Summary</CardTitle>
          <Badge className={`${data.bandColor} text-white px-3 py-1`}>
            {data.band}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Progress Scores */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Supply↔Demand Coverage</span>
                <span className="font-semibold">{data.scores.supply}%</span>
              </div>
              <Progress value={data.scores.supply} className="h-3" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Core × Regulation</span>
                <span className="font-semibold">{data.scores.core}%</span>
              </div>
              <Progress value={data.scores.core} className="h-3" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Drift Overlap</span>
                <span className="font-semibold">{data.scores.drift}%</span>
              </div>
              <Progress value={data.scores.drift} className="h-3" />
            </div>
          </div>

          {/* State Mix Chart */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">State Mix (capacity driver)</h4>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={data.stateMix} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <XAxis dataKey="name" fontSize={10} />
                <YAxis domain={[0, 100]} fontSize={10} />
                <Tooltip formatter={(value) => [`${value}%`, ""]} />
                <Bar dataKey="value" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground">
              More Calm/Neutral overlap increases usable supply; Stressed overlap inflates demand.
            </p>
          </div>

          {/* Two Tiny Habits */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Two Tiny Habits (auto-generated pattern)</h4>
            <ul className="space-y-2 text-sm">
              {data.habits.map((habit, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span>{habit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Explanation */}
        <div className="bg-muted/30 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Why even duals can miss:</strong> if both drift away from overlapping orientations—or share Stressed overlap—lane 
            coverage collapses and the trade balance goes negative.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}