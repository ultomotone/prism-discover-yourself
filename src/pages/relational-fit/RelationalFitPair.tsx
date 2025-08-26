import React from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import Header from "@/components/Header";
import { 
  T, 
  fitScore, 
  band, 
  relationKey, 
  relationLabels, 
  coreScore,
  defaultState, 
  defaultTraits, 
  defaultLanes 
} from "@/data/relationalFit";

const RelationalFitPair = () => {
  const { pairId } = useParams<{ pairId: string }>();
  
  if (!pairId) {
    return <div>Invalid pair ID</div>;
  }

  const [typeA, typeB] = pairId.split('-');
  
  if (!T[typeA] || !T[typeB]) {
    return <div>Invalid type codes</div>;
  }

  const score = fitScore({
    A: typeA,
    B: typeB,
    state: { A: defaultState, B: defaultState },
    traits: { A: defaultTraits, B: defaultTraits },
    lanes: defaultLanes
  });

  const bandType = band(score);
  const relation = relationKey(typeA, typeB);
  const relationLabel = relationLabels[relation];
  const core = coreScore(typeA, typeB);

  const getBandColor = () => {
    switch (bandType) {
      case "Supportive": return "text-rf-supportive";
      case "Stretch": return "text-rf-stretch";
      case "Friction": return "text-rf-friction";
      default: return "text-muted-foreground";
    }
  };

  const getBandIcon = () => {
    switch (bandType) {
      case "Supportive": return <CheckCircle className="w-5 h-5 text-rf-supportive" />;
      case "Stretch": return <AlertTriangle className="w-5 h-5 text-rf-stretch" />;
      case "Friction": return <XCircle className="w-5 h-5 text-rf-friction" />;
      default: return null;
    }
  };

  // Mock data for lanes (in a real app, this would be calculated based on type dynamics)
  const mockLanes = {
    structure: typeA === "LIE" && typeB === "ESI" ? 2 : Math.floor(Math.random() * 5) - 2,
    care: typeA === "LIE" && typeB === "ESI" ? 1 : Math.floor(Math.random() * 5) - 2,
    energy: typeA === "LIE" && typeB === "ESI" ? 1 : Math.floor(Math.random() * 5) - 2,
    sensing: typeA === "LIE" && typeB === "ESI" ? -1 : Math.floor(Math.random() * 5) - 2,
    insight: typeA === "LIE" && typeB === "ESI" ? 2 : Math.floor(Math.random() * 5) - 2
  };

  const getLaneStatus = (value: number) => {
    if (value >= 1) return { label: "Strong", color: "text-rf-supportive", bg: "bg-rf-supportive/10" };
    if (value === 0) return { label: "Neutral", color: "text-muted-foreground", bg: "bg-muted" };
    return { label: "Weak", color: "text-rf-friction", bg: "bg-rf-friction/10" };
  };

  const getHabits = () => {
    if (typeA === "LIE" && typeB === "ESI") {
      return [
        "15-min weekly \"pace + priorities\" sync.",
        "Agree on a \"pause word\" to re-center values vs speed.",
        "LIE summarizes feelings before proposing plans (one-line)."
      ];
    }
    
    // Default habits based on band
    switch (bandType) {
      case "Supportive":
        return [
          "Weekly appreciation check-in (5 minutes).",
          "Celebrate strengths with specific examples.",
          "Plan one shared adventure monthly."
        ];
      case "Stretch":
        return [
          "Daily 2-minute temperature check.",
          "Practice active listening for understanding.",
          "Set clear expectations for decision-making."
        ];
      case "Friction":
        return [
          "20-minute weekly conflict resolution session.",
          "Use \"I\" statements when tensions arise.",
          "Establish neutral zones for cooling down."
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/relational-fit/heatmap">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Heatmap
            </Link>
          </Button>
          
          {/* Main Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              {T[typeA].title} × {T[typeB].title}
            </h1>
            <div className="flex items-center justify-center gap-3 mb-4">
              {getBandIcon()}
              <span className={`text-2xl font-bold ${getBandColor()}`}>
                {bandType} {score}
              </span>
            </div>
            <p className="text-muted-foreground">
              {T[typeA].code} — {T[typeA].functions} × {T[typeB].code} — {T[typeB].functions}
            </p>
          </div>
        </div>

        {/* Score Breakdown */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Core Alignment ({relationLabel.display})</span>
                  <span className="text-sm text-muted-foreground">{core}/50</span>
                </div>
                <Progress value={(core/50) * 100} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">State Overlay (Neutral)</span>
                  <span className="text-sm text-muted-foreground">10/20</span>
                </div>
                <Progress value={50} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Trait Modifiers (Average)</span>
                  <span className="text-sm text-muted-foreground">0/15</span>
                </div>
                <Progress value={50} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Supply-Demand Balance</span>
                  <span className="text-sm text-muted-foreground">{Math.max(0, Object.values(mockLanes).reduce((a, b) => a + b, 0))}/15</span>
                </div>
                <Progress value={Math.max(0, (Object.values(mockLanes).reduce((a, b) => a + b, 0) / 15) * 100)} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Analysis */}
          <div className="space-y-6">
            {/* Why Section */}
            <Card>
              <CardHeader>
                <CardTitle>Why {bandType}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">
                      Core relationship: <strong>{relationLabel.display}</strong> with {core > 25 ? "strong" : core > 15 ? "moderate" : "weak"} baseline compatibility.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">
                      {Object.values(mockLanes).filter(v => v >= 1).length > 2 
                        ? "Multiple strong lanes provide solid foundation."
                        : "Mixed lane coverage requires attention to weak areas."
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Supply-Demand Lanes */}
            <Card>
              <CardHeader>
                <CardTitle>Supply-Demand Lanes</CardTitle>
                <CardDescription>How well your strengths meet each other's needs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Structure/Clarity", value: mockLanes.structure },
                    { name: "Care/Boundaries", value: mockLanes.care },
                    { name: "Energy/Initiation", value: mockLanes.energy },
                    { name: "Sensing/Timing", value: mockLanes.sensing },
                    { name: "Insight/Meaning", value: mockLanes.insight }
                  ].map(lane => {
                    const status = getLaneStatus(lane.value);
                    return (
                      <div key={lane.name} className={`p-3 rounded-lg ${status.bg}`}>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{lane.name}</span>
                          <Badge variant="outline" className={status.color}>
                            {status.label}
                          </Badge>
                        </div>
                        {lane.value < 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Both may seek this without providing it to each other
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Guidance */}
          <div className="space-y-6">
            {/* Strengths & Watch-outs */}
            <Card>
              <CardHeader>
                <CardTitle>Strengths & Watch-outs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-rf-supportive mb-2">What you do best together</h4>
                  <p className="text-sm">
                    {typeA === "LIE" && typeB === "ESI" 
                      ? "Turning ideas into action with steady care and boundaries."
                      : "Leveraging complementary strengths and shared values for mutual growth."
                    }
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-rf-stretch mb-2">Watch-outs</h4>
                  <ul className="space-y-1">
                    {Object.entries(mockLanes)
                      .filter(([_, value]) => value < 0)
                      .map(([lane, _]) => (
                        <li key={lane} className="text-sm flex items-start gap-2">
                          <div className="w-1 h-1 bg-rf-friction rounded-full mt-2 flex-shrink-0" />
                          <span>
                            {lane.charAt(0).toUpperCase() + lane.slice(1)} gap may cause friction without attention.
                          </span>
                        </li>
                      ))
                    }
                    {typeA === "LIE" && typeB === "ESI" && (
                      <li className="text-sm flex items-start gap-2">
                        <div className="w-1 h-1 bg-rf-friction rounded-full mt-2 flex-shrink-0" />
                        <span>Pace vs. values friction when tempo rises.</span>
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Habits */}
            <Card>
              <CardHeader>
                <CardTitle>Do this (7 days)</CardTitle>
                <CardDescription>Tiny habits to strengthen your connection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getHabits().map((habit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-sm">{habit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Type Details */}
            <Card>
              <CardHeader>
                <CardTitle>Type Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-1">{T[typeA].title} ({typeA})</h4>
                    <p className="text-xs text-muted-foreground mb-2">{T[typeA].functions}</p>
                    <p className="text-sm">{T[typeA].one}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{T[typeB].title} ({typeB})</h4>
                    <p className="text-xs text-muted-foreground mb-2">{T[typeB].functions}</p>
                    <p className="text-sm">{T[typeB].one}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-12 text-center">
          <Button asChild variant="outline">
            <Link to="/relational-fit/heatmap">
              Compare Another Pair
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RelationalFitPair;