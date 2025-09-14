import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import PairSummaryCard from "./PairSummaryCard";
import PersonProfileCard from "./PersonProfileCard";

const contexts = ["Flow", "Performative", "Stress"] as const;
type Context = (typeof contexts)[number];

export default function ComprehensiveDriftDemo() {
  const [activeContext, setActiveContext] = useState<Context>("Flow");

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="text-2xl">PRISM Relational Fit — Drift & State Visuals</CardTitle>
          <p className="text-muted-foreground">
            Core type is your anchor. Context shifts (Flow, Performative, Stress) create temporary orientations that resemble 
            other types—and change lane coverage.
          </p>
        </CardHeader>
      </Card>

      {/* Context Tabs */}
      <Tabs value={activeContext} onValueChange={(v) => setActiveContext(v as Context)}>
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
          {contexts.map((context) => (
            <TabsTrigger 
              key={context} 
              value={context}
              className="relative data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {context}
            </TabsTrigger>
          ))}
        </TabsList>

        {contexts.map((context) => (
          <TabsContent key={context} value={context} className="space-y-6 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Pair Summary */}
              <PairSummaryCard context={context} />

              {/* Individual Profiles */}
              <div className="grid gap-6 md:grid-cols-2">
                <PersonProfileCard person="A" context={context} />
                <PersonProfileCard person="B" context={context} />
              </div>
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Legend */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-semibold">Legend</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Flow</strong> — you as you (Calm/Neutral dominant)</div>
                <div><strong>Performative</strong> — context-shaped, social/role performance</div>
                <div><strong>Stress</strong> — reactive; capacity shrinks, demand rises</div>
                <div><strong>Drift</strong> — temporary orientation that <em>resembles</em> another type</div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Lane colors</h4>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  <span>covered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded" />
                  <span>partial</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded" />
                  <span>unmet</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-background rounded-lg border-l-4 border-l-primary">
            <h5 className="font-semibold mb-2">Why duals can still clash:</h5>
            <p className="text-sm text-muted-foreground">
              If both partners habitually drift into <em>non-overlapping</em> orientations (or meet mostly in Stress), 
              the Supply↔Demand lanes don't get covered at the same time, so the trade balance goes negative.
            </p>
            <div className="mt-3">
              <h6 className="font-medium text-sm">What to watch:</h6>
              <p className="text-sm text-muted-foreground">
                Your strongest overlap often happens in specific contexts (e.g., Flow at home, Performative at work). 
                Lean into those; add rituals to protect lanes in the others.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}