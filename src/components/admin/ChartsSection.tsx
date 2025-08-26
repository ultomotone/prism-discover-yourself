import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

interface ChartData {
  confidenceDistribution: Array<{ confidence: string; count: number }>;
  overlayDistribution: Array<{ overlay: string; count: number }>;
  typeDistribution: Array<{ type: string; count: number }>;
  throughputTrend: Array<{ date: string; sessions: number }>;
}

interface ChartsSectionProps {
  data: ChartData;
  onExport: (viewName: string) => void;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d', '#ffc658'];

export const ChartsSection: React.FC<ChartsSectionProps> = ({ data, onExport }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Confidence Distribution */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Confidence Distribution</CardTitle>
          <Button
            onClick={() => onExport('v_conf_dist')}
            variant="ghost"
            size="sm"
          >
            <Download className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            {data.confidenceDistribution.length > 0 ? (
              <BarChart data={data.confidenceDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="confidence" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No confidence data available
              </div>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Overlay Distribution */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Overlay Distribution</CardTitle>
          <Button
            onClick={() => onExport('v_overlay_conf')}
            variant="ghost"
            size="sm"
          >
            <Download className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            {data.overlayDistribution.length > 0 ? (
              <PieChart>
                  <Pie
                    data={data.overlayDistribution.map(item => ({
                      ...item,
                      displayOverlay: item.overlay === '+' ? 'Reg− (N+) - Stressed' : 
                                      item.overlay === '0' ? 'Reg0 (N0) - Neutral' :
                                      item.overlay === '-' ? 'Reg+ (N−) - Calm' : 
                                      item.overlay
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ displayOverlay, count }) => `${displayOverlay}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                  {data.overlayDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No overlay data available
              </div>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Type Distribution Heatmap */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Type Distribution</CardTitle>
          <Button
            onClick={() => onExport('v_sessions')}
            variant="ghost"
            size="sm"
          >
            <Download className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            {data.typeDistribution.length > 0 ? (
              <BarChart data={data.typeDistribution.slice(0, 10)} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="type" type="category" width={60} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--accent))" />
              </BarChart>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No type distribution data available
              </div>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Throughput Trend */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Throughput Trend (14 days)</CardTitle>
          <Button
            onClick={() => onExport('v_throughput')}
            variant="ghost"
            size="sm"
          >
            <Download className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            {data.throughputTrend.length > 0 ? (
              <LineChart data={data.throughputTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="sessions" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No throughput data available
              </div>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};