import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Cell, Tooltip as RechartsTooltip } from "recharts";

const types = Array.from({ length: 16 }, (_, i) => `T${i + 1}`);

const data = types.flatMap((_, x) =>
  types.map((_, y) => ({ x, y, z: Math.floor(Math.random() * 3) }))
);

const colors = ["#ef4444", "#facc15", "#4ade80"]; // red, yellow, green

const bands = ["Friction", "Stretch", "Supportive"];

function HeatmapTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { x, y, z } = payload[0].payload;
  return (
    <div className="rounded-lg border bg-white p-2 text-xs shadow">
      <div className="font-semibold">
        {types[x]} × {types[y]}
      </div>
      <div>{bands[z]} band — Core, State, Supply↔Demand</div>
    </div>
  );
}

export default function RelationalFitHeatmap() {
  return (
    <Card aria-label="16 by 16 compatibility heatmap" role="img">
      <CardHeader>
        <CardTitle className="text-lg">16×16 Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
            <XAxis type="number" dataKey="x" domain={[0, 15]} tickFormatter={(v) => types[v]} tickLine={false} axisLine={false} />
            <YAxis type="number" dataKey="y" domain={[0, 15]} tickFormatter={(v) => types[v]} tickLine={false} axisLine={false} />
            <ZAxis type="number" dataKey="z" range={[0, 100]} />
            <RechartsTooltip content={<HeatmapTooltip />} />
            <Scatter data={data}>
              {data.map((d, i) => (
                <Cell key={i} fill={colors[d.z]} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <div className="mt-4 flex justify-center gap-4 text-sm">
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm" style={{ background: colors[2] }}></span>Supportive</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm" style={{ background: colors[1] }}></span>Stretch</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm" style={{ background: colors[0] }}></span>Friction</span>
        </div>
      </CardContent>
    </Card>
  );
}

