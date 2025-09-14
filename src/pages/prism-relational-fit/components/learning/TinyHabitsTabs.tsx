import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export default function TinyHabitsTabs() {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Tiny Habits Library</h3>
      <Tabs defaultValue="1min" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="1min">1 min</TabsTrigger>
          <TabsTrigger value="5min">5 min</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
        </TabsList>
        
        <TabsContent value="1min">
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div>
                <strong>"Name the lane"</strong> — Say out loud: <em>Is this Structure, Care, Energy, Timing, or Meaning?</em>
              </div>
              <div>
                <strong>"Pause word"</strong> — Use it, reschedule decisions.
              </div>
              <div>
                <strong>"Two-breath reset"</strong> — Inhale calm, exhale tension.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="5min">
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div>
                <strong>"Pace + Priorities" sync</strong> — Pick one next step together.
              </div>
              <div>
                <strong>"Boundary check"</strong> — How much emotional labor today?
              </div>
              <div>
                <strong>"Timing handoff"</strong> — Who closes the loop?
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="weekly">
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div>
                <strong>15-min pacing sync</strong> — Align on tempo and priorities.
              </div>
              <div>
                <strong>Values review</strong> — Where did we override boundaries?
              </div>
              <div>
                <strong>Lane swap</strong> — Trade one task to rebalance demand.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}