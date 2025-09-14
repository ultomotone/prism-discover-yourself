import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

const contexts = ["Flow", "Performative", "Stress"] as const;

type Context = (typeof contexts)[number];

const mock = {
  Flow: { bars: { supply: 80, core: 70, drift: 60 }, band: "Supportive" },
  Performative: { bars: { supply: 60, core: 50, drift: 40 }, band: "Stretch" },
  Stress: { bars: { supply: 30, core: 40, drift: 20 }, band: "Friction" }
};

export default function RelationalFitDriftDemo() {
  const [context, setContext] = useState<Context>("Flow");
  const data = mock[context];

  return (
    <Card aria-label="Drift and state demo" role="img">
      <CardHeader>
        <CardTitle className="text-lg">Drift &amp; State Demo</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={context} onValueChange={(v) => setContext(v as Context)}>
          <TabsList className="grid grid-cols-3 mb-6">
            {contexts.map((c) => (
              <TabsTrigger key={c} value={c} className="text-sm">
                {c}
              </TabsTrigger>
            ))}
          </TabsList>
          {contexts.map((c) => (
            <TabsContent key={c} value={c} className="space-y-4">
              <div className="relative mx-auto h-32 w-32">
                <motion.div
                  className="absolute left-1/2 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-rf-gold"
                />
                <motion.div
                  className="absolute left-1/2 top-1/2"
                  style={{ originX: "0%", originY: "50%" }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                >
                  <div className="h-3 w-3 rounded-full bg-rf-teal translate-x-16" />
                </motion.div>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="text-sm">Supply↔Demand Coverage</div>
                  <Progress value={data.bars.supply} className="h-2" />
                </div>
                <div>
                  <div className="text-sm">Core×Regulation</div>
                  <Progress value={data.bars.core} className="h-2" />
                </div>
                <div>
                  <div className="text-sm">Drift Overlap</div>
                  <Progress value={data.bars.drift} className="h-2" />
                </div>
              </div>
              <div className="text-sm font-semibold">Band: {data.band}</div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

