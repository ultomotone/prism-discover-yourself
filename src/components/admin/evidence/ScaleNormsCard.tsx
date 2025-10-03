import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface ScaleNorm {
  scale_tag: string;
  p05: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  p95: number;
}

interface ScaleNormsCardProps {
  data: ScaleNorm[] | null;
  loading?: boolean;
}

export const ScaleNormsCard: React.FC<ScaleNormsCardProps> = ({
  data,
  loading = false
}) => {
  const [selectedScale, setSelectedScale] = useState<string>('');

  const selectedNorm = selectedScale && data 
    ? data.find(n => n.scale_tag === selectedScale) 
    : null;

  React.useEffect(() => {
    if (data && data.length > 0 && !selectedScale) {
      setSelectedScale(data[0].scale_tag);
    }
  }, [data, selectedScale]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">📊 Scale Norms (Percentiles)</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-md">
                <p className="text-sm">
                  Percentile norms for 0-100 index scores. Shows the distribution of scores 
                  for each scale across all completed assessments (≥70% items answered).
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : !data || data.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No norms available. Run refresh_psych_kpis() to compute.
          </div>
        ) : (
          <div className="space-y-4">
            <Select value={selectedScale} onValueChange={setSelectedScale}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a scale" />
              </SelectTrigger>
              <SelectContent>
                {data.map((norm) => (
                  <SelectItem key={norm.scale_tag} value={norm.scale_tag}>
                    {norm.scale_tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedNorm && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between p-2 rounded bg-muted/30">
                    <span className="text-muted-foreground">5th %ile</span>
                    <span className="font-mono">{selectedNorm.p05.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-muted/30">
                    <span className="text-muted-foreground">10th %ile</span>
                    <span className="font-mono">{selectedNorm.p10.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-muted/30">
                    <span className="text-muted-foreground">25th %ile</span>
                    <span className="font-mono">{selectedNorm.p25.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-primary/10">
                    <span className="font-medium">Median</span>
                    <span className="font-mono font-medium">{selectedNorm.p50.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-muted/30">
                    <span className="text-muted-foreground">75th %ile</span>
                    <span className="font-mono">{selectedNorm.p75.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-muted/30">
                    <span className="text-muted-foreground">90th %ile</span>
                    <span className="font-mono">{selectedNorm.p90.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-muted/30 col-span-2">
                    <span className="text-muted-foreground">95th %ile</span>
                    <span className="font-mono">{selectedNorm.p95.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
