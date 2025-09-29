import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, BarChart3, Zap, Shield, ArrowRight, CheckCircle, HelpCircle, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTypingLabLikes } from "@/features/typing-lab/hooks/useTypingLabLikes";
const About = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const navigate = useNavigate();
  const { totalLikes } = useTypingLabLikes();

  const elements = [
    { code: "Ti", name: "Internal logic", desc: "make it make sense" },
    { code: "Te", name: "Effectiveness", desc: "what works in the real world" },
    { code: "Fi", name: "Personal values", desc: "does this fit who I am" },
    { code: "Fe", name: "Shared emotion", desc: "what's happening between us" },
    { code: "Ni", name: "Pattern over time", desc: "where this is heading" },
    { code: "Ne", name: "Possibilities", desc: "what else this could be" },
    { code: "Si", name: "Steadiness/comfort", desc: "is this sustainable" },
    { code: "Se", name: "Decisive action", desc: "what I can move now" }
  ];

  const dimensionality = [
    { level: "1D", desc: "narrow/rule-bound; works with explicit guidance" },
    { level: "2D", desc: "reliable in familiar contexts" },
    { level: "3D", desc: "adapts to audience and situation" },
    { level: "4D", desc: "time-savvy, domain-portable, self-correcting" }
  ];

  const blocks = [
    { name: "Core", desc: "your signature strengths in motion" },
    { name: "Critic", desc: "'shoulds' and self-pressure; image management" },
    { name: "Hidden", desc: "talents emerging with support/learning" },
    { name: "Instinct", desc: "gut moves that come online under heat" }
  ];

  const methods = [
    "Likert items: stable preferences and self-ratings",
    "Forced-choice pairs: trade-offs between signals (ipsative)",
    "Scenarios/toggles: what you do under pressure or in flow",
    "Validity & state checks: attention, inconsistency pairs, social desirability, stress/mood/sleep/time pressure/focus"
  ];

  const faqItems = [
    {
      q: "Is PRISM accurate?",
      a: "We report a confidence level with every result and use multi-method items plus validity checks. When data are noisy, we avoid firm calls."
    },
    {
      q: "Will my mood change the result?",
      a: "Your core pattern is stable, but expression can shift with stress or low sleep. We capture state and adjust interpretation."
    },
    {
      q: "Can I improve my dimensionality?",
      a: "Yes. Dimensionality can grow with practice and context—your report includes a focused micro-plan."
    },
    {
      q: "Is this just a new MBTI?",
      a: "No. PRISM uses the eight information elements from Socionics and adds state-aware measurement, dimensionality labeling, and probability-based scoring."
    },
    {
      q: "Should teams use PRISM for hiring?",
      a: "Use PRISM to communicate and collaborate, not to gatekeep talent. It's best for development, not screening."
    }
  ];

  return (
    <div className="prism-container pt-24 pb-16">
      <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="prism-heading-lg text-primary mb-6">
              The PRISM Dynamics™ Model & Methods
            </h1>
            <p className="prism-body-lg text-muted-foreground max-w-4xl mx-auto mb-8">
              A modern, evidence-minded framework that maps how you think and decide—plus how your expression shifts under stress and in flow.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                variant="assessment" 
                size="lg"
                onClick={() => navigate('/assessment')}
              >
                Take the Assessment
              </Button>
              <Button variant="outline-primary" size="lg" asChild>
                <a href="/profiles">View the Profiles</a>
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              Multi-method measurement • Confidence-based type calls • Trait vs. state separation
            </div>
            <div className="mt-4 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/20 px-4 py-2 text-sm text-muted-foreground">
                <ThumbsUp className="h-4 w-4 text-primary" />
                {totalLikes} Typing Lab likes logged locally
              </span>
            </div>
          </div>

          {/* What is PRISM? */}
          <section className="mb-16">
            <Card className="prism-shadow-card">
              <CardContent className="p-8">
                <h2 className="prism-heading-md text-primary mb-6">What is PRISM Dynamics?</h2>
                <p className="prism-body text-muted-foreground mb-4">
                  <strong className="text-primary">PRISM Dynamics™ stands for Personality • Regulation • Information System Mapping.</strong>
                </p>
                <p className="prism-body text-muted-foreground mb-4">
                  It's a practical map of your mind's preferred information signals (from Socionics Model A), how capable and flexible those signals are (dimensionality), how they reconfigure in real situations (block dynamics), and how a state overlay (±) can shift your expression on any given day.
                </p>
                <p className="prism-body text-primary font-medium">
                  In plain English: PRISM Dynamics shows what drives your decisions, what changes when you're stressed or in flow, and how to use that knowledge to communicate better, choose wisely, and grow intentionally.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* PRISM Overview - Modern Visual */}
          <Card className="mb-16 prism-shadow-card">
            <CardContent className="p-8">
              <h2 className="prism-heading-md text-primary mb-6 text-center">What PRISM Dynamics Maps</h2>
              <p className="prism-body text-muted-foreground text-center max-w-3xl mx-auto mb-8">
                PRISM Dynamics shows what drives your choices, what changes when life turns up the pressure, and how to use that knowledge to communicate better, decide more wisely, and grow with intention.
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="prism-hover-lift border-2 border-secondary/20">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 prism-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-primary mb-2">Information Signals</h3>
                    <p className="text-sm text-muted-foreground">The 8 mental "languages" your brain uses to process the world</p>
                    <Button variant="ghost" size="sm" asChild className="mt-2">
                      <a href="/signals" className="flex items-center gap-1">
                        Explore <ArrowRight className="h-3 w-3" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="prism-hover-lift border-2 border-accent/20">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 prism-gradient-accent rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-primary mb-2">Dimensionality</h3>
                    <p className="text-sm text-muted-foreground">How broad, adaptable, and portable each signal is (1D–4D)</p>
                    <Button variant="ghost" size="sm" asChild className="mt-2">
                      <a href="/dimensionality" className="flex items-center gap-1">
                        Explore <ArrowRight className="h-3 w-3" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="prism-hover-lift border-2 border-warm/20">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 prism-gradient-warm rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-primary mb-2">Block Dynamics</h3>
                    <p className="text-sm text-muted-foreground">How your mental system reorganizes in calm, stress, or flow</p>
                    <Button variant="ghost" size="sm" asChild className="mt-2">
                      <a href="/blocks" className="flex items-center gap-1">
                        Explore <ArrowRight className="h-3 w-3" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="prism-hover-lift border-2 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 prism-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-primary mb-2">State Overlay (±)</h3>
                    <p className="text-sm text-muted-foreground">A reactivity lens that explains day-to-day variations</p>
                    <Button variant="ghost" size="sm" asChild className="mt-2">
                      <a href="/state-overlay" className="flex items-center gap-1">
                        Explore <ArrowRight className="h-3 w-3" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Why This Matters */}
          <Card className="mb-16 prism-shadow-card">
            <CardContent className="p-8">
              <h2 className="prism-heading-md text-primary mb-6 text-center">Why This Matters</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-4">For Individuals</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="w-2 h-2 prism-gradient-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-muted-foreground">See yourself clearly—beyond labels to living patterns</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 prism-gradient-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-muted-foreground">Make better decisions by understanding what drives your choices</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 prism-gradient-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-muted-foreground">Grow with intention using targeted development practices</span>
                    </li>
                  </ul>
                  <Button variant="outline" asChild className="mt-4">
                    <a href="/individuals">Learn More</a>
                  </Button>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-4">For Teams</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="w-2 h-2 prism-gradient-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-muted-foreground">Build understanding and reduce friction between members</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 prism-gradient-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-muted-foreground">Map cognitive diversity and identify capability gaps</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 prism-gradient-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-muted-foreground">Navigate stress and conflict with shared understanding</span>
                    </li>
                  </ul>
                  <Button variant="outline" asChild className="mt-4">
                    <a href="/organizations">Learn More</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deep Dive Navigation */}
          <Card className="mb-16 prism-shadow-card">
            <CardContent className="p-8">
              <h2 className="prism-heading-md text-primary mb-6 text-center">Dive Deeper</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">The Model</h3>
                  <div className="space-y-2">
                    <Button variant="ghost" asChild className="w-full justify-start">
                      <a href="/signals" className="flex items-center justify-between">
                        <span>Information Elements (8 Signals)</span>
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" asChild className="w-full justify-start">
                      <a href="/dimensionality" className="flex items-center justify-between">
                        <span>Dimensionality (1D-4D)</span>
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" asChild className="w-full justify-start">
                      <a href="/blocks" className="flex items-center justify-between">
                        <span>Block Dynamics</span>
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" asChild className="w-full justify-start">
                      <a href="/state-overlay" className="flex items-center justify-between">
                        <span>State Overlay (±)</span>
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" asChild className="w-full justify-start">
                      <a href="/relational-fit" className="flex items-center justify-between">
                        <span>Relationship Fit</span>
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">The Methods</h3>
                  <div className="space-y-2">
                    <Button variant="ghost" asChild className="w-full justify-start">
                      <a href="/assessment-methods" className="flex items-center justify-between">
                        <span>How the Assessment Works</span>
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" asChild className="w-full justify-start">
                      <a href="/accuracy-privacy" className="flex items-center justify-between">
                        <span>Accuracy & Privacy</span>
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" asChild className="w-full justify-start">
                      <a href="/faq" className="flex items-center justify-between">
                        <span>Frequently Asked Questions</span>
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Note */}
          <Card className="mb-16 bg-muted/30">
            <CardContent className="p-6">
              <h3 className="font-semibold text-primary mb-2 text-center">A Note on Privacy & Data Handling</h3>
              <p className="text-sm text-muted-foreground text-center">
                Your assessment responses are used only for generating your profile. We never sell or share your data with third parties. 
                All data is encrypted and stored securely with industry-standard protections.
              </p>
              <div className="text-center mt-4">
                <Button variant="ghost" size="sm" asChild>
                  <a href="/accuracy-privacy">Learn more about our privacy practices</a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* How the Assessment Works */}
          <section className="mb-16">
            <h2 className="prism-heading-md text-primary mb-12 text-center">How the Assessment Works</h2>
            
            <Card className="mb-8 prism-shadow-card">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-primary mb-6">Multi-method items (to cut bias and raise reliability)</h3>
                <ul className="space-y-3">
                  {methods.map((method, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-secondary mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-muted-foreground">{method}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-muted-foreground mt-6 text-sm">
                  This blend reduces acquiescence ("I agree with everything"), faking-good, and "test-taking styles" that can skew single-method questionnaires.
                </p>
              </CardContent>
            </Card>

            <Card className="prism-shadow-card">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-primary mb-6">Scoring & Confidence (how we call type)</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-primary mb-2">Compute scales</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Strength per element (Ti…Se)</li>
                      <li>• Dimensionality per element → map to 1D–4D</li>
                      <li>• Blocks (Core, Critic, Hidden, Instinct)</li>
                      <li>• Toggles (A/B/C/D → which block activates)</li>
                      <li>• ± overlay (z-scored when cohort data is available)</li>
                      <li>• Quality indices (attention, inconsistency, social desirability)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary mb-2">Adjust for state</h4>
                    <p className="text-sm text-muted-foreground">
                      We down-weight Likert when stress/time pressure is high and lean more on forced-choice and scenario data. We also apply a small correction for high reactivity (±) so momentary state doesn't over-shape your trait profile.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary mb-2">Compare to type prototypes</h4>
                    <p className="text-sm text-muted-foreground">
                      We compare your 8-element pattern to prototype patterns (based on Model A expectations and PRISM mechanics). Instead of hard cutoffs, we compute probabilities for all 16 types.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary mb-2">Set confidence</h4>
                    <p className="text-sm text-muted-foreground">
                      We display your top type with a confidence band. If the top two are close, we say so (no forced certainty). High confidence → firm type; Medium/Low → likely types + guidance and next steps (e.g., micro-retest).
                    </p>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <p className="text-accent font-medium">
                    Why this matters: You said accuracy is critical. Confidence-based reporting avoids over-promising and tells you how sure we are.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Quick FAQ */}
          <section className="mb-16">
            <h2 className="prism-heading-md text-primary mb-12 text-center">Quick FAQ (About)</h2>
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <Card key={index} className="prism-shadow-card">
                  <CardContent className="p-0">
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full p-6 text-left hover:bg-muted/30 prism-transition flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <HelpCircle className="h-5 w-5 text-accent mr-3 flex-shrink-0" />
                        <h3 className="font-semibold text-primary">{item.q}</h3>
                      </div>
                      <ArrowRight 
                        className={`h-5 w-5 text-muted-foreground transition-transform ${
                          openFaq === index ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                    {openFaq === index && (
                      <div className="px-6 pb-6">
                        <div className="pl-8 border-l-2 border-accent/20">
                          <p className="text-muted-foreground">{item.a}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button variant="outline-primary" asChild>
                <a href="/faq">View All FAQs</a>
              </Button>
            </div>
          </section>

          {/* Closing CTA */}
          <section className="text-center">
            <Card className="prism-gradient-hero text-white prism-shadow-card">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold mb-4">Ready to see your PRISM?</h2>
                <p className="text-white/90 mb-8 max-w-2xl mx-auto">
                  Take the assessment and get a clear, confidence-rated profile you can apply immediately.
                </p>
                <Button 
                  variant="assessment" 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-3"
                  onClick={() => navigate('/assessment')}
                >
                  Take the Assessment
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
  );
};

export default About;
