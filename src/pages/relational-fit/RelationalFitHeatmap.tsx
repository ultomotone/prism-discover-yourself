import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import { typeOrder, T, fitScore, band, relationKey, relationLabels, defaultState, defaultTraits, defaultLanes } from "@/data/relationalFit";

const RelationalFitHeatmap = () => {
  const [hoveredCell, setHoveredCell] = useState<{A: string, B: string} | null>(null);

  const getCellColor = (scoreValue: number) => {
    if (scoreValue >= 70) return "bg-rf-supportive";
    if (scoreValue >= 45) return "bg-rf-stretch";
    return "bg-rf-friction";
  };

  const getCellScore = (A: string, B: string) => {
    return fitScore({
      A,
      B,
      state: { A: defaultState, B: defaultState },
      traits: { A: defaultTraits, B: defaultTraits },
      lanes: defaultLanes
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/relational-fit">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          
          <h1 className="text-4xl font-bold mb-4">Type Compatibility Heatmap</h1>
          <p className="text-muted-foreground mb-6">
            Interactive 16×16 grid showing relationship compatibility scores. Click any cell to view detailed analysis.
          </p>
          
          {/* Legend */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-rf-supportive rounded" />
                  <span className="text-sm">Supportive (70–100)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-rf-stretch rounded" />
                  <span className="text-sm">Stretch (45–69)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-rf-friction rounded" />
                  <span className="text-sm">Friction (0–44)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Heatmap */}
        <TooltipProvider>
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Column Headers */}
              <div className="flex">
                <div className="w-16 h-12 flex-shrink-0" /> {/* Empty corner */}
                {typeOrder.map(typeB => (
                  <div key={typeB} className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                    <span className="text-xs font-medium writing-vertical-rl rotate-180">
                      {typeB}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Rows */}
              {typeOrder.map(typeA => (
                <div key={typeA} className="flex">
                  {/* Row Header */}
                  <div className="w-16 h-12 flex-shrink-0 flex items-center justify-center bg-muted">
                    <span className="text-xs font-medium">{typeA}</span>
                  </div>
                  
                  {/* Cells */}
                  {typeOrder.map(typeB => {
                    const score = getCellScore(typeA, typeB);
                    const bandType = band(score);
                    const relation = relationKey(typeA, typeB);
                    const relationLabel = relationLabels[relation];
                    
                    return (
                      <Tooltip key={typeB}>
                        <TooltipTrigger asChild>
                          <Link to={`/relational-fit/pair/${typeA}-${typeB}`}>
                            <div
                              className={`w-12 h-12 flex-shrink-0 border border-border/50 cursor-pointer hover:border-foreground/30 transition-all flex items-center justify-center ${getCellColor(score)}`}
                              onMouseEnter={() => setHoveredCell({A: typeA, B: typeB})}
                              onMouseLeave={() => setHoveredCell(null)}
                            >
                              <span className="text-xs font-medium text-white">
                                {score}
                              </span>
                            </div>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <div className="text-center">
                            <div className="font-semibold">{T[typeA].title} × {T[typeB].title}</div>
                            <div className="text-sm opacity-90">{score} • {bandType} — {relationLabel.display}</div>
                            <div className="text-xs opacity-75 mt-1">Click for details</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </TooltipProvider>

        {/* Hover Details */}
        {hoveredCell && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">
                {T[hoveredCell.A].title} × {T[hoveredCell.B].title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">{T[hoveredCell.A].title} ({hoveredCell.A})</h4>
                  <p className="text-sm text-muted-foreground">{T[hoveredCell.A].one}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">{T[hoveredCell.B].title} ({hoveredCell.B})</h4>
                  <p className="text-sm text-muted-foreground">{T[hoveredCell.B].one}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RelationalFitHeatmap;