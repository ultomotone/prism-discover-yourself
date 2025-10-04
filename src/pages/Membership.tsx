import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";

const Membership = () => {
  const handleJoinBeta = async (plan: 'monthly' | 'annual' | 'lifetime') => {
    try {
      const { data, error } = await supabase.functions.invoke('checkout-membership', {
        body: { plan }
      });

      if (error) throw error;
      if (data?.url) window.location.href = data.url;
      else toast({ title: "Error", description: "Couldn't create checkout session", variant: "destructive" });
    } catch (err) {
      console.error('Membership checkout error:', err);
      toast({ title: "Error", description: "Failed to initiate checkout", variant: "destructive" });
    }
  };

  const benefits = [
    "Trend syncing across retakes",
    "Invite-only cohorts & relational fit",
    "Early features & scoring engine trials",
    "Founder price lock",
    "AI Coach launch discount"
  ];

  return (
    <>
      <Helmet
        title="Founding Beta Membership | PRISM Dynamics™"
        meta={[
          { 
            name: "description", 
            content: "Lock in founder pricing. Shape what ships. Trend syncing, cohorts, early features, and AI Coach discount."
          }
        ]}
      />
      <main className="pt-24 pb-16 bg-background">
        <div className="prism-container max-w-6xl px-6">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary text-primary-foreground">Founding Beta</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Founding Beta Membership — lock pricing, shape what ships.
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Trend syncing across retakes, invite-only cohorts, early features, AI Coach discount.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Monthly */}
            <Card className="relative">
              <CardHeader>
                <CardTitle>Monthly</CardTitle>
                <CardDescription>Flexible billing</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$9.97</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => handleJoinBeta('monthly')} 
                  className="w-full"
                >
                  Join Beta — Monthly
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Cancel anytime
                </p>
              </CardContent>
            </Card>

            {/* Annual (Most Popular) */}
            <Card className="relative border-primary border-2 shadow-lg scale-105">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-4 py-1 text-sm">
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="pt-8">
                <CardTitle>Annual</CardTitle>
                <CardDescription>Best value</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$79</span>
                  <span className="text-muted-foreground">/year</span>
                  <div className="text-sm text-muted-foreground mt-1">
                    ~$6.58/month
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => handleJoinBeta('annual')} 
                  className="w-full"
                >
                  Join Beta — Annual
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Save 34% vs monthly
                </p>
              </CardContent>
            </Card>

            {/* Lifetime */}
            <Card className="relative">
              <div className="absolute -top-3 right-4">
                <Badge variant="secondary" className="bg-yellow-500 text-yellow-900 px-3 py-1 text-xs">
                  Limit 200
                </Badge>
              </div>
              <CardHeader>
                <CardTitle>Lifetime</CardTitle>
                <CardDescription>One-time payment</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$199</span>
                  <span className="text-muted-foreground">/forever</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => handleJoinBeta('lifetime')} 
                  variant="outline"
                  className="w-full"
                >
                  Join Beta — Lifetime
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Never pay again
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Benefits Section */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-center">What You Get</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Guarantee Bar */}
          <Card className="bg-muted/50 border-primary/20">
            <CardContent className="py-6 text-center">
              <h3 className="text-lg font-semibold mb-2">30-day activation guarantee</h3>
              <p className="text-sm text-muted-foreground">
                Activate at least one benefit or request a credit/refund.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Prices exclude tax; added at checkout.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
};

export default Membership;
