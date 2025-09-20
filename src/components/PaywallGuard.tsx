import React, { useMemo, useState } from "react";
import { Sparkles, Lock } from "lucide-react";

import { PAYWALL_ENABLED } from "@/lib/featureFlags";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { markResultsPaid } from "@/services/resultsApi";

type PaywallProfile = {
  paid?: boolean;
  type_code?: string;
  dims_highlights?: {
    coherent?: string[];
    unique?: string[];
  };
  [key: string]: unknown;
};

type PaywallGuardProps = {
  profile: PaywallProfile | null | undefined;
  sessionId: string;
  children: React.ReactNode;
  /**
   * Primarily used in tests to override the global feature flag.
   */
  paywallEnabled?: boolean;
  /**
   * Optional unlock handler – defaults to markResultsPaid stub for future billing wiring.
   */
  onUnlock?: (sessionId: string) => Promise<void> | void;
  /**
   * Optional custom billing hook content rendered beneath the CTA.
   */
  billingHook?: React.ReactNode;
};

const DEFAULT_BILLING_HOOK = (
  <p className="text-sm text-muted-foreground text-center">
    Complete checkout to gain lifetime access to your full PRISM profile.
  </p>
);

export function PaywallGuard({
  profile,
  sessionId,
  children,
  paywallEnabled,
  onUnlock = markResultsPaid,
  billingHook,
}: PaywallGuardProps): React.ReactElement {
  const effectiveFlag = paywallEnabled ?? PAYWALL_ENABLED;
  const isPaid = Boolean(profile?.paid);
  const shouldGate = effectiveFlag && !isPaid;

  const [unlocking, setUnlocking] = useState(false);

  const highlights = useMemo(() => {
    const coherent = Array.isArray(profile?.dims_highlights?.coherent)
      ? profile?.dims_highlights?.coherent ?? []
      : [];
    const unique = Array.isArray(profile?.dims_highlights?.unique)
      ? profile?.dims_highlights?.unique ?? []
      : [];
    const merged = [...coherent, ...unique]
      .map((item) => (typeof item === "string" ? item : String(item)))
      .filter((item) => item.trim().length > 0);

    if (merged.length >= 2) {
      return merged.slice(0, 2);
    }
    if (merged.length === 1) {
      return merged;
    }
    return ["Personalized insights are ready once you unlock your results."];
  }, [profile?.dims_highlights?.coherent, profile?.dims_highlights?.unique]);

  const handleUnlock = async () => {
    if (!sessionId || unlocking) return;
    try {
      setUnlocking(true);
      await onUnlock(sessionId);
    } finally {
      setUnlocking(false);
    }
  };

  if (!shouldGate) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-xl w-full">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Lock className="h-6 w-6" aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl">Unlock your full PRISM results</CardTitle>
          <p className="text-muted-foreground text-sm">
            {profile?.type_code
              ? `Your ${profile.type_code} profile is ready with deeper insights.`
              : "Your personalized profile is ready with deeper insights."}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Preview highlights
            </div>
            <ul className="space-y-2" data-testid="paywall-highlights">
              {highlights.map((highlight, idx) => (
                <li key={`${highlight}-${idx}`} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-primary mt-0.5" aria-hidden="true" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button className="w-full" size="lg" onClick={handleUnlock} disabled={unlocking}>
            {unlocking ? "Processing…" : "Unlock full results"}
          </Button>

          {billingHook ?? DEFAULT_BILLING_HOOK}
        </CardContent>
      </Card>
    </div>
  );
}
