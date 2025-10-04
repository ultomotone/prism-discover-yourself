import { Badge } from '@/components/ui/badge';
import { useEntitlementsContext } from '@/contexts/EntitlementsContext';
import { Clock } from 'lucide-react';

type CreditCounterProps = {
  variant?: 'compact' | 'detailed';
};

export function CreditCounter({ variant = 'compact' }: CreditCounterProps) {
  const { advancedCreditsRemaining, advancedCreditsTotal, advancedExpiresAt, loading } = useEntitlementsContext();

  if (loading) return <span className="text-muted-foreground">—</span>;

  const expiryText = advancedExpiresAt 
    ? (() => {
        const now = new Date();
        const expiry = new Date(advancedExpiresAt);
        const monthsLeft = Math.round((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30));
        return monthsLeft > 0 ? `${monthsLeft}mo` : 'Expired';
      })()
    : null;

  if (variant === 'compact') {
    return (
      <span className="text-sm font-medium">
        {advancedCreditsRemaining} / {advancedCreditsTotal}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">
        Advanced Credits: {advancedCreditsRemaining} / {advancedCreditsTotal}
      </span>
      {expiryText && advancedCreditsRemaining > 0 && (
        <Badge variant="outline" className="text-xs">
          <Clock className="h-3 w-3 mr-1" />
          {expiryText}
        </Badge>
      )}
    </div>
  );
}
