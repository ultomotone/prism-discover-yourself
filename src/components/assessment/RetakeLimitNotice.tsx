import type { ReactNode } from 'react';
import { AlertTriangle, CalendarClock } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { RetakeBlock } from '@/hooks/useEmailSessionManager';

interface RetakeLimitNoticeProps {
  block: RetakeBlock;
  footer?: ReactNode;
}

function formatEligibility(date: string | null): string | null {
  if (!date) return null;
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(value);
}

export function RetakeLimitNotice({ block, footer }: RetakeLimitNoticeProps) {
  const formattedDate = formatEligibility(block.nextEligibleDate);

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-destructive/10 p-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <CardTitle className="text-xl">Retake limit reached</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          You can take the PRISM assessment up to {block.maxPerWindow} time
          {block.maxPerWindow === 1 ? '' : 's'} every {block.windowDays} days to
          preserve scoring accuracy.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {typeof block.attemptNo === 'number' && block.attemptNo > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">Attempt #{block.attemptNo}</Badge>
            <span>was recorded most recently.</span>
          </div>
        )}
        {formattedDate ? (
          <div className="flex items-start gap-3 rounded-lg border border-dashed border-muted-foreground/40 p-4">
            <CalendarClock className="mt-1 h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Next eligible date</p>
              <p className="text-sm text-muted-foreground">{formattedDate}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-muted-foreground/40 p-4 text-sm text-muted-foreground">
            We&apos;ll email you once you&apos;re eligible for another attempt.
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          Need to retake sooner for a verified change? Reach out to our team and
          share the context so we can review manually.
        </p>
      </CardContent>
      {footer ? <CardFooter className="flex flex-col gap-2">{footer}</CardFooter> : null}
    </Card>
  );
}
