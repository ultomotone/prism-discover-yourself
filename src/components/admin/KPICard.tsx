import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  tooltip?: string;
  status?: 'good' | 'warning' | 'danger';
  onExport?: () => void;
  exportLabel?: string;
}

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'good': return 'bg-green-100 text-green-800 border-green-200';
    case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'danger': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status?: string) => {
  switch (status) {
    case 'good': return '✅';
    case 'warning': return '⚠️';
    case 'danger': return '❌';
    default: return '';
  }
};

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  tooltip,
  status,
  onExport,
  exportLabel
}) => {
  return (
    <Card className="relative">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {title}
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardTitle>
        {onExport && (
          <Button
            onClick={onExport}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
          >
            <Download className="h-3 w-3" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{value}</div>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {status && (
            <Badge className={getStatusColor(status)}>
              {getStatusIcon(status)}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};