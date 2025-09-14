import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

const coreTypes = [
  "ILE", "SEI", "ESE", "LII", "EIE", "LSI", "SLE", "IEI",
  "SEE", "ILI", "LIE", "ESI", "LSE", "EII", "IEE", "SLI"
];

const getFitColor = (typeA: string, typeB: string) => {
  // Simple mock logic - replace with actual fit calculation
  const hash = (typeA + typeB).split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const absHash = Math.abs(hash);
  if (absHash % 3 === 0) return "bg-rf-supportive"; // Green
  if (absHash % 3 === 1) return "bg-rf-stretch"; // Yellow
  return "bg-rf-friction"; // Red
};

const getFitLabel = (typeA: string, typeB: string) => {
  const colorClass = getFitColor(typeA, typeB);
  if (colorClass.includes("supportive")) return "🟩";
  if (colorClass.includes("stretch")) return "🟨";
  return "🟥";
};

export default function CoreTypesMatrix() {
  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Core Types Compatibility Matrix</CardTitle>
        <p className="text-sm text-muted-foreground">
          Quick reference for core type alignment • Click for detailed heatmap
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-xs">
          <Badge className="bg-rf-supportive text-white">🟩 Supportive</Badge>
          <Badge className="bg-rf-stretch text-white">🟨 Stretch</Badge>
          <Badge className="bg-rf-friction text-white">🟥 Friction</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="w-8 h-8"></th>
                {coreTypes.map(type => (
                  <th key={type} className="w-8 h-8 text-center font-medium text-muted-foreground">
                    {type}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coreTypes.map(typeA => (
                <tr key={typeA}>
                  <td className="w-8 h-8 text-center font-medium text-muted-foreground bg-muted/30">
                    {typeA}
                  </td>
                  {coreTypes.map(typeB => (
                    <td key={`${typeA}-${typeB}`} className="w-8 h-8 text-center">
                      <div 
                        className={`w-6 h-6 mx-auto flex items-center justify-center text-xs cursor-pointer hover:scale-110 transition-transform ${
                          typeA === typeB ? "bg-primary text-primary-foreground font-bold" : getFitColor(typeA, typeB)
                        }`}
                        title={`${typeA} × ${typeB}: ${typeA === typeB ? "Self" : getFitLabel(typeA, typeB)}`}
                      >
                        {typeA === typeB ? "●" : getFitLabel(typeA, typeB)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 text-center">
          <Button asChild variant="outline" size="lg">
            <a href="/relational-fit/heatmap" aria-label="View Detailed Heatmap">
              View Detailed Interactive Heatmap
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            Core alignment is just the starting point—regulation and supply↔demand matter more daily
          </p>
        </div>
      </CardContent>
    </Card>
  );
}