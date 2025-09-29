import { Helmet } from "react-helmet";
import { ArrowRight, Layers, Box } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const InformationElementsVsTraits = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      <Helmet
        title="Information Elements vs Traits: Why Boxes Miss Real Life | PRISM Dynamics™"
        meta={[
          { 
            name: "description", 
            content: "Traditional trait models put you in boxes. PRISM Dynamics maps how you actually process information across contexts."
          }
        ]}
      />
      
      <Header />
      
      <main className="pt-24 pb-16">
        <article className="prism-container max-w-4xl">
          <div className="mb-8">
            <Badge className="mb-4">Library Article</Badge>
            <h1 className="prism-heading-xl mb-4">
              Information Elements vs Traits: Why Boxes Miss Real Life
            </h1>
            <p className="prism-body-lg text-muted-foreground">
              Traditional trait models put you in boxes. PRISM Dynamics™ maps how you actually 
              process information across contexts.
            </p>
          </div>

          <div className="prose prose-lg max-w-none space-y-8">
            {/* Introduction */}
            <Card>
              <CardContent className="pt-6">
                <p className="prism-body">
                  Most personality models measure <strong>traits</strong>—stable dispositions like 
                  "extraversion" or "openness." They're useful, but they miss something critical: 
                  <strong> how you process information in real time</strong>.
                </p>
              </CardContent>
            </Card>

            {/* The Problem with Trait Boxes */}
            <section>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Box className="w-8 h-8 text-primary" />
                The Problem with Trait Boxes
              </h2>
              
              <div className="space-y-4">
                <p className="prism-body">
                  Traits tell you what you tend to do on average. But real life isn't average:
                </p>
                
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                    <span className="prism-body">
                      You're more "extraverted" at a party than in a one-on-one conversation
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                    <span className="prism-body">
                      You're "open" to new ideas when calm, but rigid under pressure
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                    <span className="prism-body">
                      You're "conscientious" about work deadlines but disorganized at home
                    </span>
                  </li>
                </ul>

                <Card className="bg-muted/50 border-none">
                  <CardContent className="pt-6">
                    <p className="prism-body italic">
                      Trait models average these variations out. PRISM Dynamics keeps them in.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* CTA mid-article */}
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="pt-6 text-center">
                <h3 className="text-xl font-semibold mb-3">
                  See your Information Element pattern
                </h3>
                <Button onClick={() => navigate("/assessment")}>
                  Start the Test
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Information Elements */}
            <section>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Layers className="w-8 h-8 text-primary" />
                Information Elements: A Different Lens
              </h2>
              
              <div className="space-y-4">
                <p className="prism-body">
                  PRISM Dynamics measures <strong>Information Elements</strong>—the building blocks 
                  of how you take in and act on information:
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Ti (Introverted Thinking)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Logical frameworks, precision, internal consistency
                      </p>
                      <p className="text-sm mt-2 italic">
                        Example: "Let me map out the structure before we start."
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Te (Extraverted Thinking)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Efficiency, results, organizing resources
                      </p>
                      <p className="text-sm mt-2 italic">
                        Example: "What's the fastest way to get this done?"
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Fi (Introverted Feeling)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Values alignment, authenticity, personal meaning
                      </p>
                      <p className="text-sm mt-2 italic">
                        Example: "Does this feel right to me?"
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Fe (Extraverted Feeling)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Group harmony, emotional atmosphere, connection
                      </p>
                      <p className="text-sm mt-2 italic">
                        Example: "How is everyone feeling about this?"
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Ni (Introverted Intuition)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Long-term vision, underlying patterns, synthesis
                      </p>
                      <p className="text-sm mt-2 italic">
                        Example: "I see where this is heading."
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Ne (Extraverted Intuition)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Possibilities, brainstorming, lateral connections
                      </p>
                      <p className="text-sm mt-2 italic">
                        Example: "What if we tried this instead?"
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Si (Introverted Sensing)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Detail memory, comparison to past, reliability
                      </p>
                      <p className="text-sm mt-2 italic">
                        Example: "Last time we did this, here's what happened."
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Se (Extraverted Sensing)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Present moment, physical engagement, adaptability
                      </p>
                      <p className="text-sm mt-2 italic">
                        Example: "Let's handle what's in front of us right now."
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            {/* Why Elements Matter */}
            <section>
              <h2 className="text-3xl font-bold mb-6">
                Why Elements Matter More Than Boxes
              </h2>
              
              <div className="space-y-4">
                <p className="prism-body">
                  Unlike static trait scores, Information Elements show:
                </p>

                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                    <span className="prism-body">
                      <strong>What you're actually doing</strong> when you solve problems, make decisions, 
                      or communicate
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                    <span className="prism-body">
                      <strong>How you shift</strong> between flow states and pressure
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                    <span className="prism-body">
                      <strong>Where you're strong and flexible</strong> (not just "high" or "low" on a scale)
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Real-World Application */}
            <Card className="bg-accent/5 border-accent/20">
              <CardHeader>
                <CardTitle>Real-World Example</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="prism-body">
                  <strong>Trait view:</strong> "You score high on Conscientiousness."
                </p>
                <p className="prism-body">
                  <strong>Element view:</strong> "Your Si is strong (detail memory, comparison to precedent), 
                  but your Te is moderate (efficiency under time pressure). In flow, you're meticulous. 
                  Under stress, you may over-reference the past rather than adapting quickly."
                </p>
                <p className="prism-body text-muted-foreground italic">
                  Which one helps you understand yourself better?
                </p>
              </CardContent>
            </Card>

            {/* Final CTA */}
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="pt-6 text-center space-y-4">
                <h3 className="text-2xl font-bold">
                  Ready to see your Information Element pattern?
                </h3>
                <p className="prism-body text-muted-foreground">
                  Take the PRISM assessment and discover how you process information—not just what 
                  box you fit in.
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

export default InformationElementsVsTraits;
