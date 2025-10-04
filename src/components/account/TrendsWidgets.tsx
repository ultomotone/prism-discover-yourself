import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, Activity, Gauge, Waves, Lock, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoreAnchorData {
  typeCode: string;
  lastConfirmed: string;
  reliability: string;
}

interface StabilityMeterData {
  top2Gap: number[];
  trend: 'improving' | 'stable' | 'declining';
  median: number;
}

interface ConfidenceDialData {
  medianConfidence: number;
  changePercent: string;
  sinceLast: string;
}

interface StateBadgesData {
  flow: number;
  neutral: number;
  stress: number;
  period: string;
}

export const CoreAnchorWidget = ({ 
  data, 
  isMember 
}: { 
  data: CoreAnchorData; 
  isMember: boolean;
}) => {
  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Core Anchor
          </CardTitle>
          {!isMember && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Lock className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Drift Map unlocked in Beta</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className={cn("text-3xl font-bold", !isMember && "blur-[2px]")}>
            {data.typeCode}
          </div>
          <div className="text-xs text-muted-foreground">
            Anchor set from most reliable retest
          </div>
          <div className="flex gap-2 items-center">
            <Badge variant={data.reliability === 'High' ? 'default' : 'secondary'} className="text-xs">
              {data.reliability}
            </Badge>
            <span className={cn("text-xs text-muted-foreground", !isMember && "blur-sm")}>
              {data.lastConfirmed}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const StabilityMeterWidget = ({ 
  data, 
  isMember 
}: { 
  data: StabilityMeterData; 
  isMember: boolean;
}) => {
  // Simple sparkline generator
  const max = Math.max(...data.top2Gap);
  const min = Math.min(...data.top2Gap);
  const range = max - min || 1;
  
  const points = data.top2Gap.map((val, i) => {
    const x = (i / (data.top2Gap.length - 1)) * 100;
    const y = 100 - ((val - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  const trendIcon = {
    improving: '↗',
    stable: '→',
    declining: '↘'
  }[data.trend];

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Stability Meter
          </CardTitle>
          {!isMember && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Wider gap → clearer core</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Mini sparkline */}
          <svg viewBox="0 0 100 30" className="w-full h-12" preserveAspectRatio="none">
            <polyline
              points={points}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              className={cn(!isMember && "blur-[2px]")}
            />
          </svg>
          
          <div className="flex items-center justify-between">
            <div>
              <div className={cn("text-2xl font-bold", !isMember && "blur-[2px]")}>
                {data.median.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">Median Top-2 Gap</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-primary">
                {trendIcon}
              </div>
              <div className="text-xs text-muted-foreground capitalize">
                {data.trend}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ConfidenceDialWidget = ({ 
  data, 
  isMember 
}: { 
  data: ConfidenceDialData; 
  isMember: boolean;
}) => {
  const percentage = Math.round(data.medianConfidence * 100);
  
  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Gauge className="h-4 w-4 text-primary" />
            Confidence Dial
          </CardTitle>
          {!isMember && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Lock className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Exact numbers in Beta</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Circular progress visualization */}
          <div className="flex items-center justify-center">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="hsl(var(--muted))"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="hsl(var(--primary))"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - data.medianConfidence)}`}
                  className={cn(!isMember && "blur-[2px]")}
                />
              </svg>
              <div className={cn(
                "absolute inset-0 flex items-center justify-center text-xl font-bold",
                !isMember && "blur-[2px]"
              )}>
                {percentage}%
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className={cn("text-sm font-medium", !isMember && "blur-sm")}>
              {data.changePercent} since {data.sinceLast}
            </div>
            <div className="text-xs text-muted-foreground">
              Median confidence
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const StateBadgesWidget = ({ 
  data, 
  isMember 
}: { 
  data: StateBadgesData; 
  isMember: boolean;
}) => {
  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Waves className="h-4 w-4 text-primary" />
            State Distribution
          </CardTitle>
          {!isMember && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Lock className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Precise distributions in Beta</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            <Badge 
              variant="outline" 
              className={cn(
                "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800",
                !isMember && "blur-sm"
              )}
            >
              Flow {data.flow}%
            </Badge>
            <Badge 
              variant="outline" 
              className={cn(
                "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800",
                !isMember && "blur-sm"
              )}
            >
              Neutral {data.neutral}%
            </Badge>
            <Badge 
              variant="outline" 
              className={cn(
                "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",
                !isMember && "blur-sm"
              )}
            >
              Stress {data.stress}%
            </Badge>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Distribution for {data.period}
          </div>
          
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Beta unlocks: daily state tracking with contextual notes
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
