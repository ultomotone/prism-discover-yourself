import { Helmet } from "react-helmet";
import { ArrowRight, Wind, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const BlockDynamics = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      <Helmet
        title="Block Dynamics: Your 'Under-Pressure' Pattern | PRISM Dynamics™"
        meta={[
          { 
            name: "description", 
            content: "How your cognitive pattern shifts between flow and pressure. PRISM Dynamics reveals your Block Dynamics."
          }
        ]}
      />
      
      <Header />
      
      <main className="pt-24 pb-16">
        <article className="prism-container max-w-4xl">
          <div className="mb-8">
            <Badge className="mb-4">Library Article</Badge>
            <h1 className="prism-heading-xl mb-4">
              Block Dynamics: Your "Under-Pressure" Pattern
            </h1>
            <p className="prism-body-lg text-muted-foreground">
              How your cognitive pattern shifts between flow and pressure. PRISM Dynamics™ reveals your 
              Block Dynamics.
            </p>
          </div>

          <div className="prose prose-lg max-w-none space-y-8">
            {/* Introduction */}
            <Card>
              <CardContent className="pt-6">
                <p className="prism-body">
                  You're not the same person when you're calm and when you're stressed. PRISM Dynamics 
                  measures <strong>Block Dynamics</strong>—the pattern of Information Elements you lean 
                  on in flow vs. the ones that emerge (or disappear) under pressure.
                </p>
              </CardContent>
            </Card>

            {/* The Two States */}
            <section>
              <h2 className="text-3xl font-bold mb-6">
                The Two States: Flow and Pressure
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wind className="w-6 h-6 text-primary" />
                      Flow State
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm font-semibold">When you're calm, resourced, and engaged:</p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0"></div>
                        <span>You access your full cognitive stack</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0"></div>
                        <span>You're flexible and adaptive</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0"></div>
                        <span>You integrate multiple perspectives</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0"></div>
                        <span>You operate from your strengths</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-6 h-6 text-destructive" />
                      Pressure State
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm font-semibold">When you're stressed, rushed, or threatened:</p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-destructive rounded-full mt-1.5 shrink-0"></div>
                        <span>You narrow to a few "survival" functions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-destructive rounded-full mt-1.5 shrink-0"></div>
                        <span>You become rigid or reactive</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-destructive rounded-full mt-1.5 shrink-0"></div>
                        <span>You may over-rely on familiar patterns</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-destructive rounded-full mt-1.5 shrink-0"></div>
                        <span>Certain elements "go offline"</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* CTA mid-article */}
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="pt-6 text-center">
                <h3 className="text-xl font-semibold mb-3">
                  See your Block Dynamics profile
                </h3>
                <Button onClick={() => navigate("/assessment")}>
                  Start the Test
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>

            {/* What PRISM Measures */}
            <section>
              <h2 className="text-3xl font-bold mb-6">
                What PRISM Measures
              </h2>
              
              <div className="space-y-4">
                <p className="prism-body">
                  PRISM Dynamics tracks which Information Elements you use in each state:
                </p>

                <Card className="bg-muted/50 border-none">
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <p className="font-semibold mb-2">Core Block (Flow)</p>
                      <p className="text-sm text-muted-foreground">
                        The 4 elements you naturally lean on when calm and resourced. Your "default mode."
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold mb-2">Critic Block (Pressure)</p>
                      <p className="text-sm text-muted-foreground">
                        The elements that become hyperactive or rigid under stress. Often judgmental or reactive.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold mb-2">Hidden Block</p>
                      <p className="text-sm text-muted-foreground">
                        The elements that "go offline" under pressure—they're available in flow, but disappear when you're stressed.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold mb-2">Instinct Block</p>
                      <p className="text-sm text-muted-foreground">
                        The elements that emerge reflexively under threat—often outside conscious control.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Real-World Example */}
            <section>
              <h2 className="text-3xl font-bold mb-6">
                Real-World Example
              </h2>
              
              <Card className="bg-accent/5 border-accent/20">
                <CardHeader>
                  <CardTitle>Marcus's Block Dynamics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold text-primary mb-2">Flow State (Core Block):</p>
                    <p className="text-sm">
                      Marcus uses <strong>Ni (long-term vision)</strong> and <strong>Te (efficiency)</strong> 
                      to plan projects. He's strategic, organized, and considers multiple angles.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-destructive mb-2">Pressure State (Critic Block):</p>
                    <p className="text-sm">
                      Under deadline pressure, his <strong>Te</strong> becomes hyperactive—he starts micromanaging 
                      details and snapping at teammates for "inefficiency." His <strong>Ni</strong> goes offline; 
                      he loses sight of the big picture and fixates on immediate tasks.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">What This Tells Us:</p>
                    <p className="text-sm text-muted-foreground">
                      Marcus's stress pattern is <strong>narrowing</strong>—he drops his strategic thinking 
                      (Ni) and over-relies on execution mode (Te). To recover, he needs to pause, reconnect 
                      with his vision, and delegate tasks instead of controlling them.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Why Block Dynamics Matter */}
            <section>
              <h2 className="text-3xl font-bold mb-6">
                Why Block Dynamics Matter
              </h2>
              
              <div className="space-y-4">
                <p className="prism-body">
                  Understanding your Block Dynamics helps you:
                </p>

                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                    <span className="prism-body">
                      <strong>Recognize your stress signals</strong> — When you notice certain patterns 
                      (e.g., micromanaging, rigidity), you know you're in Critic mode
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                    <span className="prism-body">
                      <strong>Build recovery strategies</strong> — Know which elements to reactivate 
                      (e.g., "I need to zoom out and reconnect with my Ni vision")
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                    <span className="prism-body">
                      <strong>Improve team dynamics</strong> — Understand how your colleagues shift under 
                      pressure and adjust communication accordingly
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                    <span className="prism-body">
                      <strong>Prevent burnout</strong> — Chronic Critic mode is exhausting; knowing your 
                      pattern helps you catch it early
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            {/* How to Work With Your Blocks */}
            <Card className="bg-muted/50 border-none">
              <CardHeader>
                <CardTitle>How to Work With Your Blocks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="space-y-3 list-decimal list-inside">
                  <li className="prism-body">
                    <strong>Notice the shift</strong> — When you catch yourself in Critic mode, name it: 
                    "I'm in pressure mode right now."
                  </li>
                  <li className="prism-body">
                    <strong>Pause and breathe</strong> — Create space before reacting. Even 30 seconds helps.
                  </li>
                  <li className="prism-body">
                    <strong>Reactivate your Hidden elements</strong> — Ask yourself: "What perspective am I missing?" 
                    (often your Hidden Block)
                  </li>
                  <li className="prism-body">
                    <strong>Return to Core</strong> — Reconnect with the elements that work best for you in flow. 
                    Your Core Block is your home base.
                  </li>
                </ol>
              </CardContent>
            </Card>

            {/* Final CTA */}
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="pt-6 text-center space-y-4">
                <h3 className="text-2xl font-bold">
                  Ready to see your Block Dynamics?
                </h3>
                <p className="prism-body text-muted-foreground">
                  Take the PRISM assessment and discover how your pattern shifts between flow and pressure.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" onClick={() => navigate("/assessment")}>
                    Start the Test
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate("/membership")}>
                    Explore Membership
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </article>
      </main>
      
      <Footer />
    </div>
  );
};

export default BlockDynamics;
