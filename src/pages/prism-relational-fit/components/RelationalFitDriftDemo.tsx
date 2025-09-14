import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const contexts = ["Flow", "Performative", "Stress"] as const;

type Context = (typeof contexts)[number];

const mock = {
  Flow: { 
    bars: { supply: 85, core: 75, drift: 65 }, 
    band: "Supportive",
    regulation: { calm: 65, neutral: 25, stress: 10 },
    drift: [
      { resembles: "ILI", angle: 320, weight: 45 },
      { resembles: "LSI", angle: 40, weight: 25 }
    ],
    lanes: [
      { name: "Structure", status: "green" },
      { name: "Care", status: "yellow" }, 
      { name: "Energy", status: "green" },
      { name: "Timing", status: "yellow" },
      { name: "Meaning", status: "green" }
    ]
  },
  Performative: { 
    bars: { supply: 60, core: 55, drift: 40 }, 
    band: "Stretch",
    regulation: { calm: 35, neutral: 40, stress: 25 },
    drift: [
      { resembles: "LSI", angle: 60, weight: 40 },
      { resembles: "ILE", angle: 0, weight: 20 }
    ],
    lanes: [
      { name: "Structure", status: "yellow" },
      { name: "Care", status: "yellow" },
      { name: "Energy", status: "green" },
      { name: "Timing", status: "red" },
      { name: "Meaning", status: "yellow" }
    ]
  },
  Stress: { 
    bars: { supply: 35, core: 40, drift: 25 }, 
    band: "Friction",
    regulation: { calm: 15, neutral: 30, stress: 55 },
    drift: [
      { resembles: "ESI", angle: 180, weight: 35 },
      { resembles: "ILI", angle: 280, weight: 30 }
    ],
    lanes: [
      { name: "Structure", status: "red" },
      { name: "Care", status: "red" },
      { name: "Energy", status: "yellow" },
      { name: "Timing", status: "red" },
      { name: "Meaning", status: "yellow" }
    ]
  }
};

export default function RelationalFitDriftDemo() {
  const [context, setContext] = useState<Context>("Flow");
  const data = mock[context];

  const regData = [
    { name: "Calm", value: data.regulation.calm, fill: "#4ade80" },
    { name: "Neutral", value: data.regulation.neutral, fill: "#facc15" }, 
    { name: "Stress", value: data.regulation.stress, fill: "#ef4444" }
  ];

  const getBandColor = (band: string) => {
    switch (band) {
      case "Supportive": return "bg-green-500";
      case "Stretch": return "bg-yellow-500";
      case "Friction": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getLaneColor = (status: string) => {
    switch (status) {
      case "green": return "bg-green-500 text-white";
      case "yellow": return "bg-yellow-500 text-white";
      case "red": return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  return (
    <Card aria-label="Drift and state demo">
      <CardHeader>
        <CardTitle className="text-lg">Context States & Drift Patterns</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={context} onValueChange={(v) => setContext(v as Context)} className="space-y-6">
          <TabsList className="grid grid-cols-3 mb-6">
            {contexts.map((c) => (
              <TabsTrigger key={c} value={c} className="text-sm relative">
                {c}
                <motion.div
                  className={`absolute -bottom-1 left-0 right-0 h-1 rounded-full ${getBandColor(mock[c].band)}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: context === c ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                />
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={context}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Band Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Fit Band:</span>
                <Badge className={`${getBandColor(data.band)} text-white px-3 py-1`}>
                  {data.band}
                </Badge>
              </div>

              {/* Drift Visualization */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Type Drift Orientations</h4>
                <div className="relative mx-auto h-40 w-40 rounded-full border-2 border-dashed border-muted-foreground/30">
                  {/* Core type at center */}
                  <motion.div
                    className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  />
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-6 text-xs font-semibold">
                    LIE
                  </div>
                  
                  {/* Drift states */}
                  {data.drift.map((drift, i) => (
                    <motion.div
                      key={drift.resembles}
                      className="absolute"
                      style={{
                        left: "50%",
                        top: "50%",
                        transform: `rotate(${drift.angle}deg) translateX(60px) rotate(-${drift.angle}deg)`,
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: drift.weight / 50 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                    >
                      <div 
                        className="h-3 w-3 rounded-full bg-secondary"
                        style={{ opacity: drift.weight / 50 }}
                      />
                      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs">
                        {drift.resembles}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Regulation Mix */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Regulation Mix</h4>
                <ResponsiveContainer width="100%" height={80}>
                  <BarChart data={regData} layout="horizontal" margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis type="category" dataKey="name" width={50} fontSize={12} />
                    <Tooltip formatter={(value) => [`${value}%`, ""]} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Lane Coverage */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Supply Lane Coverage</h4>
                <div className="flex flex-wrap gap-2">
                  {data.lanes.map((lane) => (
                    <motion.div
                      key={lane.name}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Badge className={`${getLaneColor(lane.status)} px-2 py-1 text-xs`}>
                        {lane.name}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Supply↔Demand Coverage</span>
                    <span>{data.bars.supply}%</span>
                  </div>
                  <Progress value={data.bars.supply} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Core×Regulation</span>
                    <span>{data.bars.core}%</span>
                  </div>
                  <Progress value={data.bars.core} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Drift Overlap</span>
                    <span>{data.bars.drift}%</span>
                  </div>
                  <Progress value={data.bars.drift} className="h-2" />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </CardContent>
    </Card>
  );
}