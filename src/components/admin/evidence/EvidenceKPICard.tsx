import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Download, Info } from 'lucide-react';

interface EvidenceKPICardProps {
  title: string;
  definition: string;
  value: string | number;
  subtitle?: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  children?: React.ReactNode;
  onExportCSV: () => void;
  loading?: boolean;
}

export const EvidenceKPICard: React.FC<EvidenceKPICardProps> = ({
  title,
  definition,
  value,
  subtitle,
  badge,
  badgeVariant = 'secondary',
  children,
  onExportCSV,
  loading = false
}) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{title}</CardTitle>
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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onExportCSV}
            disabled={loading}
          >
            <Download className="h-4 w-4 mr-1" />
            CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {loading ? '...' : value}
              </div>
              {subtitle && (
                <div className="text-sm text-muted-foreground">{subtitle}</div>
              )}
            </div>
            {badge && (
              <Badge variant={badgeVariant}>{badge}</Badge>
            )}
          </div>
          {children && (
            <div className="mt-4">
              {children}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};