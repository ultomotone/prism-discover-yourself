import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface CoverageData {
  scale_id: string;
  scale_code: string;
  scale_name: string;
  keyed_items: number;
  total_items: number;
  coverage_pct: number;
}

interface ConstructCoverageCardProps {
  data: CoverageData[] | null;
  loading?: boolean;
}

export const ConstructCoverageCard: React.FC<ConstructCoverageCardProps> = ({
  data,
  loading = false
}) => {
  const definition = "Construct Coverage measures the percentage of items in the bank that are keyed (assigned weights) for each scale. Target: ≥70% coverage per construct ensures balanced measurement.";
  
  const getBadgeVariant = (coverage: number): 'default' | 'secondary' | 'destructive' => {
    if (coverage >= 70) return 'default';
    if (coverage >= 50) return 'secondary';
    return 'destructive';
  };

  const getStatusLabel = (coverage: number) => {
    if (coverage >= 70) return 'Good';
    if (coverage >= 50) return 'Fair';
    return 'Review';
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">📊 Construct Coverage</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-md">
                <p className="text-sm">{definition}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : !data || data.length === 0 ? (
          <div className="text-sm text-muted-foreground p-4 text-center">
            No construct coverage data available. Ensure item_catalog has keyed items.
          </div>
        ) : (
          <div className="space-y-2">
            {data.slice(0, 5).map((scale) => (
              <div key={scale.scale_id} className="flex items-center justify-between p-2 rounded border">
                <div className="flex-1">
                  <div className="font-medium text-sm">{scale.scale_code || 'Unknown'}</div>
                  <div className="text-xs text-muted-foreground">
                    {scale.keyed_items}/{scale.total_items} items
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{scale.coverage_pct?.toFixed(1) ?? '0.0'}%</span>
                  <Badge variant={getBadgeVariant(scale.coverage_pct || 0)}>
                    {getStatusLabel(scale.coverage_pct || 0)}
                  </Badge>
                </div>
              </div>
            ))}
            {data.length > 5 && (
              <div className="text-xs text-muted-foreground text-center pt-2">
                + {data.length - 5} more scales
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
