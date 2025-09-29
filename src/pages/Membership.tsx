import { useState } from "react";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Membership = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  
  // Founding Member pricing deadline (example: 3 months from now)
  const foundingDeadline = new Date();
  foundingDeadline.setMonth(foundingDeadline.getMonth() + 3);
  const deadlineStr = foundingDeadline.toLocaleDateString("en-US", { 
    month: "long", 
    day: "numeric", 
    year: "numeric" 
  });

  return (
    <div className="min-h-screen bg-background">
      <Helmet
        title="Membership | PRISM Dynamics™"
        meta={[
          { 
            name: "description", 
            content: "Unlock the full PRISM Dynamics library, quarterly profile refresh, member Q&A, and early access to new features."
          }
        ]}
      />
      
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="prism-container max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-accent text-accent-foreground">Membership Plans</Badge>
            <h1 className="prism-heading-xl mb-6">
              Go deeper with PRISM Dynamics
            </h1>
            <p className="prism-body-lg text-muted-foreground max-w-3xl mx-auto">
              Unlock the full library of deep dives, Signals Packs, Typing Lab member feed, 
              quarterly profile refresh, and member Q&A sessions.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center items-center gap-4 mb-12">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                billingCycle === "monthly" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                billingCycle === "annual" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Annual <span className="ml-2 text-xs">(Save 20%)</span>
            </button>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Free Plan */}
            <Card className="relative">
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>Test + save your profile</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/forever</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Take the full PRISM assessment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Save and view your profile</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Basic type overview</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full mt-6">
                  Start Free
                </Button>
              </CardContent>
            </Card>

            {/* Member Plan (Highlighted) */}
            <Card className="relative border-primary shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-4 py-1">
                  Most Popular
                </Badge>
              </div>
              {billingCycle === "annual" && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="secondary" className="bg-accent text-accent-foreground">
                    <Zap className="w-3 h-3 mr-1" />
                    Founding Member through {deadlineStr.split(',')[0]}
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle>Member (Individual)</CardTitle>
                <CardDescription>Full library + quarterly refresh</CardDescription>
                <div className="mt-4">
                  {billingCycle === "annual" ? (
                    <>
                      <span className="text-4xl font-bold">$79</span>
                      <span className="text-muted-foreground">/year</span>
                      <div className="text-sm text-muted-foreground mt-1">
                        <span className="line-through">$99/year</span> • Founding Member pricing
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">$9</span>
                      <span className="text-muted-foreground">/month</span>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Everything in Free</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Access deep dives on Information Elements, Dimensionality, and Block Dynamics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>"Signals Pack" PDFs to spot patterns in real conversations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Typing Lab member feed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Quarterly profile refresh</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Member Q&A sessions</span>
                  </li>
                </ul>
                <Button className="w-full mt-6">
                  Become a Member {billingCycle === "annual" && "(Annual)"}
                </Button>
                {billingCycle === "monthly" && (
                  <Button variant="outline" className="w-full">
                    Try Monthly
                  </Button>
                )}
                <p className="text-xs text-center text-muted-foreground">
                  30-day money-back guarantee
                </p>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative">
              <CardHeader>
                <CardTitle>Pro (Teams/Creators)</CardTitle>
                <CardDescription>Team workspaces + API access</CardDescription>
                <div className="mt-4">
                  {billingCycle === "annual" ? (
                    <>
                      <span className="text-4xl font-bold">$249</span>
                      <span className="text-muted-foreground">/year</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">$29</span>
                      <span className="text-muted-foreground">/month</span>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Everything in Member</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Team workspaces (up to 10 profiles)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Comparative views & team dynamics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Export profiles as PDF/JSON</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Early access to API/webhooks (waitlist)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full mt-6">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Guarantee Section */}
          <Card className="bg-muted/50 border-none">
            <CardContent className="pt-6 text-center">
              <h3 className="text-xl font-semibold mb-2">30-Day Money-Back Guarantee</h3>
              <p className="text-muted-foreground">
                Not satisfied? Cancel anytime within 30 days for a full refund, no questions asked.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Membership;
