import { Helmet } from "react-helmet";
import { ArrowRight, Layers, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const DimensionalityRange = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      <Helmet
        title="Dimensionality (1D–4D): Range is a Skill | PRISM Dynamics™"
        meta={[
          { 
            name: "description", 
            content: "Your cognitive breadth across contexts. PRISM Dynamics measures Dimensionality (1D–4D) to show your operating range."
          }
        ]}
      />
      
      <Header />
      
      <main className="pt-24 pb-16">
        <article className="prism-container max-w-4xl">
          <div className="mb-8">
            <Badge className="mb-4">Library Article</Badge>
            <h1 className="prism-heading-xl mb-4">
              Dimensionality (1D–4D): Range is a Skill
            </h1>
            <p className="prism-body-lg text-muted-foreground">
              Your cognitive breadth across contexts. PRISM Dynamics™ measures Dimensionality (1D–4D) 
              to show your operating range.
            </p>
          </div>

          <div className="prose prose-lg max-w-none space-y-8">
            {/* Introduction */}
            <Card>
              <CardContent className="pt-6">
                <p className="prism-body">
                  Most personality tests give you a type and stop there. PRISM Dynamics goes further: 
                  we measure <strong>Dimensionality</strong>—how broad or narrow your operating range is 
                  for each Information Element.
                </p>
              </CardContent>
            </Card>

            {/* What is Dimensionality */}
            <section>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Layers className="w-8 h-8 text-primary" />
                What is Dimensionality?
              </h2>
              
              <div className="space-y-4">
                <p className="prism-body">
                  Think of Dimensionality as your cognitive "bandwidth" for an Information Element:
                </p>

                <div className="space-y-4">
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-8 h-1 bg-primary rounded"></div>
                        1D (Narrow)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        You use this element in a <strong>single, specialized way</strong>. 
                        Reliable in that one context, but inflexible outside it.
                      </p>
                      <p className="text-sm mt-2 italic text-muted-foreground">
                        Example: "I use Ti (logical frameworks) only for technical debugging, not for life decisions."
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-16 h-1 bg-primary rounded"></div>
                        2D (Moderate)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        You apply this element across <strong>a few related contexts</strong>. 
                        More versatile, but still bounded.
                      </p>
                      <p className="text-sm mt-2 italic text-muted-foreground">
                        Example: "I use Fe (group harmony) at work and with friends, but not in online debates."
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-24 h-1 bg-primary rounded"></div>
                        3D (Broad)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        You use this element <strong>across many contexts</strong>. 
                        Highly adaptable and consistent.
                      </p>
                      <p className="text-sm mt-2 italic text-muted-foreground">
                        Example: "I use Ni (long-term vision) in my career, relationships, creative projects, and financial planning."
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-32 h-1 bg-primary rounded"></div>
                        4D (Full-Spectrum)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        You integrate this element <strong>across all domains of life</strong>, 
                        including meta-awareness (using it to improve how you use it).
                      </p>
                      <p className="text-sm mt-2 italic text-muted-foreground">
                        Example: "I use Te (efficiency) everywhere, and I actively refine my systems based on feedback."
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            {/* CTA mid-article */}
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="pt-6 text-center">
                <h3 className="text-xl font-semibold mb-3">
                  Discover your Dimensionality profile
                </h3>
                <Button onClick={() => navigate("/assessment")}>
                  Start the Test
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Why It Matters */}
            <section>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-primary" />
                Why Dimensionality Matters
              </h2>
              
              <div className="space-y-4">
                <p className="prism-body">
                  Two people can have the same "dominant function" but use it completely differently:
                </p>

                <Card className="bg-accent/5 border-accent/20">
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <p className="font-semibold">Person A: High Ti strength, 1D Dimensionality</p>
                      <p className="text-sm text-muted-foreground">
                        Brilliant at coding logic, but doesn't apply those frameworks to relationships or personal growth. 
                        Narrow expertise.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">Person B: High Ti strength, 3D Dimensionality</p>
                      <p className="text-sm text-muted-foreground">
                        Uses logical frameworks in work, relationships, life planning, and self-reflection. 
                        Broad integration.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <p className="prism-body">
                  <strong>Same function. Different bandwidth.</strong> That's what Dimensionality reveals.
                </p>
              </div>
            </section>

            {/* How to Grow */}
            <section>
              <h2 className="text-3xl font-bold mb-6">
                How to Grow Your Dimensionality
              </h2>
              
              <div className="space-y-4">
                <p className="prism-body">
                  Dimensionality isn't fixed. You can expand your range by:
                </p>

                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                    <span className="prism-body">
                      <strong>Practicing in new contexts</strong> — If your Ne (brainstorming) is 1D (work only), 
                      try applying it to hobbies, relationships, or personal projects
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                    <span className="prism-body">
                      <strong>Meta-awareness practice</strong> — Notice when you use an element and ask, 
                      "Where else could this help?"
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                    <span className="prism-body">
                      <strong>Coaching or deliberate development</strong> — Structured feedback loops accelerate growth
                    </span>
                  </li>
                </ul>

                <Card className="bg-muted/50 border-none">
                  <CardContent className="pt-6">
                    <p className="prism-body italic">
                      Your Dimensionality score isn't a ceiling—it's a starting point.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Visual Example */}
            <Card className="bg-accent/5 border-accent/20">
              <CardHeader>
                <CardTitle>Real-World Example</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="prism-body">
                  <strong>Sarah's Profile:</strong>
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                    <span>Ti (logical frameworks): <strong>High strength, 1D</strong> — only uses it for data analysis at work</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                    <span>Fe (group harmony): <strong>Moderate strength, 3D</strong> — applies it everywhere (work, family, friendships)</span>
                  </li>
                </ul>
                <p className="prism-body">
                  <strong>Insight:</strong> Sarah is a specialist with her Ti (narrow but deep), and a generalist 
                  with her Fe (broad and flexible). She might benefit from applying her logical thinking to 
                  personal decisions, not just spreadsheets.
                </p>
              </CardContent>
            </Card>

            {/* Final CTA */}
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="pt-6 text-center space-y-4">
                <h3 className="text-2xl font-bold">
                  Ready to see your Dimensionality profile?
                </h3>
                <p className="prism-body text-muted-foreground">
                  Take the PRISM assessment and discover your cognitive bandwidth across all eight Information Elements.
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

export default DimensionalityRange;
