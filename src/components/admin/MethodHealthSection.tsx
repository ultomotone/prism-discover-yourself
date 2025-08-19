import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MethodHealthData {
  fcCoverage: Array<{ fc_count: number; sessions: number }>;
  shareEntropy: Array<{ entropy_range: string; sessions: number }>;
  dimensionalCoverage: Array<{ func: string; min_d_items: number; median_d_items: number; low_coverage_sessions: number }>;
  sectionTimes: Array<{ section: string; median_sec: number; drop_rate: number }>;
}

interface MethodHealthSectionProps {
  data: MethodHealthData;
  onExport: (viewName: string) => void;
}

export const MethodHealthSection: React.FC<MethodHealthSectionProps> = ({ data, onExport }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FC Coverage Histogram */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Forced-Choice Coverage</CardTitle>
            <Button
              onClick={() => onExport('v_fc_coverage')}
              variant="ghost"
              size="sm"
            >
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.fcCoverage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fc_count" label={{ value: 'FC Questions Answered', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Sessions', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="sessions" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Share Entropy Histogram */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Share Entropy Distribution</CardTitle>
            <Button
              onClick={() => onExport('v_share_entropy')}
              variant="ghost"
              size="sm"
            >
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.shareEntropy}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="entropy_range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sessions" fill="hsl(var(--secondary))" />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">
              Higher entropy = more diffuse type shares (harder type calls)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dimensional Coverage Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Dimensional Coverage by Function</CardTitle>
            <Button
              onClick={() => onExport('v_dim_coverage')}
              variant="ghost"
              size="sm"
            >
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Function</TableHead>
                  <TableHead className="text-right">Min D Items</TableHead>
                  <TableHead className="text-right">Median D Items</TableHead>
                  <TableHead className="text-right">Sessions &lt;4</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.dimensionalCoverage.map((row) => (
                  <TableRow key={row.func}>
                    <TableCell className="font-medium">{row.func}</TableCell>
                    <TableCell className="text-right">{row.min_d_items}</TableCell>
                    <TableCell className="text-right">{row.median_d_items}</TableCell>
                    <TableCell className="text-right">
                      <span className={row.low_coverage_sessions > 5 ? 'text-red-600' : ''}>
                        {row.low_coverage_sessions}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Section Times Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Section Performance</CardTitle>
            <Button
              onClick={() => onExport('v_section_times')}
              variant="ghost"
              size="sm"
            >
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Section</TableHead>
                  <TableHead className="text-right">Median Time (ms)</TableHead>
                  <TableHead className="text-right">Drop Rate %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.sectionTimes.slice(0, 10).map((row) => (
                  <TableRow key={row.section}>
                    <TableCell className="font-medium">{row.section}</TableCell>
                    <TableCell className="text-right">
                      {Math.round(row.median_sec || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={(row.drop_rate || 0) > 0.1 ? 'text-red-600' : ''}>
                        {((row.drop_rate || 0) * 100).toFixed(1)}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};