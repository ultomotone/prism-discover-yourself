import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';
import { useEntitlementsContext } from '@/contexts/EntitlementsContext';
import { Sparkles, Users } from 'lucide-react';

type UpgradeCardsProps = {
  sessionId: string;
};

export function UpgradeCards({ sessionId }: UpgradeCardsProps) {
  const { isMember, advancedCreditsRemaining } = useEntitlementsContext();

  const handleBuyAdvanced = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('checkout-advanced', {
        body: { resultId: sessionId }
      });

      if (error) throw error;
      if (data?.url) window.location.href = data.url;
      else toast({ title: "Error", description: "Couldn't create checkout session", variant: "destructive" });
    } catch (err) {
      console.error('Advanced checkout error:', err);
      toast({ title: "Error", description: "Failed to initiate checkout", variant: "destructive" });
    }
  };

  const handleJoinBeta = async (plan: 'monthly' | 'annual' | 'lifetime') => {
    try {
      const { data, error } = await supabase.functions.invoke('checkout-membership', {
        body: { plan, resultId: sessionId }
      });

      if (error) throw error;
      if (data?.url) window.location.href = data.url;
      else toast({ title: "Error", description: "Couldn't create checkout session", variant: "destructive" });
    } catch (err) {
      console.error('Membership checkout error:', err);
      toast({ title: "Error", description: "Failed to initiate checkout", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      {/* Advanced Report Pack */}
      {!isMember && advancedCreditsRemaining < 2 && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Advanced Report Pack — 2 Reports
            </CardTitle>
            <CardDescription>
              Deeper analytics now + one additional Advanced report on your next retake (within 12 months). 
              Electronic delivery; no live session.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={handleBuyAdvanced} className="w-full" size="lg">
              Unlock Advanced — $19.97
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Includes <strong>1 retake credit</strong> — your next Advanced report within 12 months.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Founding Beta Membership */}
      {!isMember && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Founding Beta Membership
            </CardTitle>
            <CardDescription className="text-sm">
              Trend Syncing · Cohorts · Early Features · Price Lock · AI Coach Discount
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
              <Button 
                onClick={() => handleJoinBeta('monthly')} 
                variant="outline"
                className="w-full"
              >
                $9.97/mo
              </Button>
              <Button 
                onClick={() => handleJoinBeta('annual')} 
                variant="default"
                className="w-full relative"
              >
                <Badge className="absolute -top-2 -right-2 text-xs">Most Popular</Badge>
                $79/yr
              </Button>
              <Button 
                onClick={() => handleJoinBeta('lifetime')} 
                variant="outline"
                className="w-full relative"
              >
                <Badge className="absolute -top-2 -right-2 text-xs bg-yellow-500">Limit 200</Badge>
                $199 one-time
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Cancel anytime (monthly). Prices exclude tax; added at checkout.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Member benefits preview */}
      {isMember && (
        <Card className="bg-primary/5 border-primary/30">
          <CardHeader>
            <CardTitle className="text-sm">Your Founder Benefits</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p>✓ Trend syncing across retakes</p>
            <p>✓ Invite-only cohorts</p>
            <p>✓ Early features & trials</p>
            <p>✓ Founder price lock</p>
            <p>✓ AI Coach launch discount</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
