import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PersonProfileProps {
  person: "A" | "B";
  context: "Flow" | "Performative" | "Stress";
}

const profileData = {
  A: {
    coreType: "LIE",
    coreGroup: "Core Group α",
    contexts: {
      Flow: {
        drift: [
          { type: "ILI", percentage: 45, color: "bg-blue-500" },
          { type: "LSI", percentage: 25, color: "bg-green-500" }
        ],
        supplyLanes: [
          { name: "Structure", status: "covered" },
          { name: "Care", status: "partial" },
          { name: "Energy", status: "covered" },
          { name: "Timing", status: "partial" },
          { name: "Meaning", status: "covered" }
        ],
        regulation: { calm: 65, neutral: 25, stressed: 10 }
      },
      Performative: {
        drift: [
          { type: "LSI", percentage: 40, color: "bg-green-500" },
          { type: "ILE", percentage: 20, color: "bg-purple-500" }
        ],
        supplyLanes: [
          { name: "Structure", status: "partial" },
          { name: "Care", status: "partial" },
          { name: "Energy", status: "covered" },
          { name: "Timing", status: "unmet" },
          { name: "Meaning", status: "partial" }
        ],
        regulation: { calm: 35, neutral: 40, stressed: 25 }
      },
      Stress: {
        drift: [
          { type: "ESI", percentage: 35, color: "bg-red-500" },
          { type: "ILI", percentage: 30, color: "bg-blue-500" }
        ],
        supplyLanes: [
          { name: "Structure", status: "unmet" },
          { name: "Care", status: "unmet" },
          { name: "Energy", status: "partial" },
          { name: "Timing", status: "unmet" },
          { name: "Meaning", status: "partial" }
        ],
        regulation: { calm: 15, neutral: 30, stressed: 55 }
      }
    }
  },
  B: {
    coreType: "ESI",
    coreGroup: "Core Group β",
    contexts: {
      Flow: {
        drift: [
          { type: "SEI", percentage: 40, color: "bg-teal-500" },
          { type: "LSI", percentage: 30, color: "bg-green-500" }
        ],
        supplyLanes: [
          { name: "Structure", status: "partial" },
          { name: "Care", status: "covered" },
          { name: "Energy", status: "covered" },
          { name: "Timing", status: "covered" },
          { name: "Meaning", status: "partial" }
        ],
        regulation: { calm: 70, neutral: 20, stressed: 10 }
      },
      Performative: {
        drift: [
          { type: "SEI", percentage: 30, color: "bg-teal-500" },
          { type: "LSI", percentage: 20, color: "bg-green-500" }
        ],
        supplyLanes: [
          { name: "Structure", status: "partial" },
          { name: "Care", status: "covered" },
          { name: "Energy", status: "covered" },
          { name: "Timing", status: "partial" },
          { name: "Meaning", status: "partial" }
        ],
        regulation: { calm: 40, neutral: 35, stressed: 25 }
      },
      Stress: {
        drift: [
          { type: "LSI", percentage: 45, color: "bg-green-500" }
        ],
        supplyLanes: [
          { name: "Structure", status: "unmet" },
          { name: "Care", status: "partial" },
          { name: "Energy", status: "partial" },
          { name: "Timing", status: "unmet" },
          { name: "Meaning", status: "unmet" }
        ],
        regulation: { calm: 20, neutral: 25, stressed: 55 }
      }
    }
  }
};

export default function PersonProfileCard({ person, context }: PersonProfileProps) {
  const data = profileData[person];
  const contextData = data.contexts[context];

  const getLaneColor = (status: string) => {
    switch (status) {
      case "covered": return "bg-green-500 text-white";
      case "partial": return "bg-yellow-500 text-white";
      case "unmet": return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
            {person}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono text-xs">
              {data.coreType}
            </Badge>
            <span className="text-sm text-muted-foreground">{data.coreGroup}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drift Section */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Drift (this context)</h4>
          <div className="space-y-2">
            {contextData.drift.map((drift, i) => (
              <div key={i} className="flex items-center gap-3">
                <Badge className={`${drift.color} text-white px-2 py-1 text-xs font-mono`}>
                  {drift.type}
                </Badge>
                <span className="text-sm font-medium">{drift.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Supply Lanes */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Your Supply lanes (this context)</h4>
          <div className="flex flex-wrap gap-2">
            {contextData.supplyLanes.map((lane, i) => (
              <Badge key={i} className={`${getLaneColor(lane.status)} px-2 py-1 text-xs`}>
                {lane.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Regulation */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Regulation Mix</h4>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <div className="font-medium">Calm</div>
              <div className="text-green-600 font-semibold">{contextData.regulation.calm}%</div>
            </div>
            <div>
              <div className="font-medium">Neutral</div>
              <div className="text-yellow-600 font-semibold">{contextData.regulation.neutral}%</div>
            </div>
            <div>
              <div className="font-medium">Stressed</div>
              <div className="text-red-600 font-semibold">{contextData.regulation.stressed}%</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}