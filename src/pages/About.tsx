import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Target, Users, Shield } from "lucide-react";

const About = () => {
  const elements = [
    { name: "Ti (internal logic)", desc: "Logical analysis and systematic thinking" },
    { name: "Te (effective results)", desc: "Organizing resources for efficient outcomes" },
    { name: "Fi (personal values)", desc: "Authentic self-expression and core principles" },
    { name: "Fe (shared vibe)", desc: "Social harmony and emotional atmosphere" },
    { name: "Ni (patterns over time)", desc: "Long-term vision and strategic insights" },
    { name: "Ne (possibilities)", desc: "Exploring connections and potential" },
    { name: "Si (steadiness/comfort)", desc: "Maintaining stability and proven methods" },
    { name: "Se (decisive action)", desc: "Responding to immediate opportunities" }
  ];

  const methods = [
    "Likert ratings (stable preferences)",
    "Forced-choice pairs (trade-offs)", 
    "Situational toggles (behavior under pressure)",
    "Validity checks (attention, inconsistency, social desirability)"
  ];

  const notItems = [
    "Not a clinical diagnosis.",
    "Not a fixed box—development and context matter."
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="prism-container pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="prism-heading-lg text-primary mb-6">
              The PRISM Model & Methods
            </h1>
            <p className="prism-body-lg text-muted-foreground max-w-3xl mx-auto">
              PRISM is a practical map of how you process information and make decisions, and how that expression shifts with context.
            </p>
          </div>

          {/* What PRISM measures */}
          <section className="mb-16">
            <h2 className="prism-heading-md text-primary mb-8 text-center">What PRISM measures</h2>
            
            <div className="grid gap-8 mb-12">
              {/* Information Elements */}
              <Card className="prism-shadow-card">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <Brain className="h-6 w-6 text-secondary mr-3" />
                    <h3 className="text-2xl font-semibold text-primary">Information Elements (8)</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {elements.map((element, index) => (
                      <div key={index} className="flex items-start">
                        <div className="w-2 h-2 prism-gradient-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div>
                          <span className="font-semibold text-primary">{element.name}</span>
                          <span className="text-muted-foreground ml-2">— {element.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Other Measures */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="prism-shadow-card">
                  <CardContent className="p-6">
                    <Target className="h-8 w-8 text-accent mb-4" />
                    <h3 className="text-xl font-semibold text-primary mb-3">Dimensionality (1D–4D)</h3>
                    <p className="text-muted-foreground">Capability from narrow/rule-bound → adaptive/contextual → time-savvy/portable.</p>
                  </CardContent>
                </Card>

                <Card className="prism-shadow-card">
                  <CardContent className="p-6">
                    <Users className="h-8 w-8 text-warm mb-4" />
                    <h3 className="text-xl font-semibold text-primary mb-3">Block Dynamics</h3>
                    <p className="text-muted-foreground">Core / Critic / Hidden / Instinct patterns in real situations.</p>
                  </CardContent>
                </Card>

                <Card className="prism-shadow-card">
                  <CardContent className="p-6">
                    <Shield className="h-8 w-8 text-primary mb-4" />
                    <h3 className="text-xl font-semibold text-primary mb-3">± Overlay</h3>
                    <p className="text-muted-foreground">A calm/reactive modifier (neuroticism) that affects expression, not cognition.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* How the assessment works */}
          <section className="mb-16">
            <h2 className="prism-heading-md text-primary mb-8 text-center">How the assessment works</h2>
            
            <Card className="prism-shadow-card mb-8">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-primary mb-6">Multi-method items reduce bias:</h3>
                <ul className="space-y-3">
                  {methods.map((method, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 prism-gradient-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-muted-foreground">{method}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="prism-shadow-card">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-primary mb-4">Confidence scoring</h3>
                <p className="text-muted-foreground">
                  We avoid over-promising: we calculate a best-fit type and show confidence instead of forcing a label when the signal is unclear.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* What PRISM is not */}
          <section className="mb-16">
            <h2 className="prism-heading-md text-primary mb-8 text-center">What PRISM is not</h2>
            <Card className="prism-shadow-card">
              <CardContent className="p-8">
                <ul className="space-y-4">
                  {notItems.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 prism-gradient-warm rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-muted-foreground text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* CTA */}
          <div className="text-center">
            <Button variant="hero" size="lg" asChild>
              <a href="/profiles">View the Profiles</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
