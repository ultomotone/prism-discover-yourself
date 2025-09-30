import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, BarChart3, Zap, Shield, ArrowRight, CheckCircle, HelpCircle, ThumbsUp, Users, Heart } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTypingLabLikes } from "@/features/typing-lab/hooks/useTypingLabLikes";
import WhyPrismDynamics from "@/components/home/WhyPrismDynamics";
import HowItWorksStrip from "@/components/home/HowItWorksStrip";
import TypingLabTeaser from "@/components/home/TypingLabTeaser";
import SocialProofStrip from "@/components/home/SocialProofStrip";
import FoundingMemberCTA from "@/components/home/FoundingMemberCTA";
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
            <h1 className="prism-heading-xl text-primary mb-6">
              Predict your type on the first pass.
            </h1>
            <p className="prism-body-lg text-muted-foreground max-w-4xl mx-auto mb-8">
              PRISM Dynamics™ maps how you process information—in flow and under pressure—to predict your best-fit type before any 1:1 typing.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                variant="assessment" 
                size="lg"
                onClick={() => navigate('/assessment')}
              >
                Start the Test
              </Button>
              <Button variant="outline-primary" size="lg" onClick={() => navigate('/how-it-works')}>
                How It Works
              </Button>
            </div>

            {/* Proof chips */}
            <div className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground mb-4">
              <span className="inline-flex items-center px-4 py-2 rounded-full border border-border/60 bg-muted/20">
                Information Elements
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full border border-border/60 bg-muted/20">
                Dimensionality (1D–4D)
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full border border-border/60 bg-muted/20">
                Block Dynamics (Flow vs Pressure)
              </span>
            </div>
          </div>
      </div>
      
      {/* Why PRISM Dynamics - 4 differentiator cards */}
      <WhyPrismDynamics />
      
      {/* How It Works Strip - 3 steps */}
      <HowItWorksStrip />

      <div className="max-w-6xl mx-auto">
          {/* What PRISM Dynamics Maps */}
          <Card className="mb-16 prism-shadow-card">
            <CardContent className="p-8">
              <h2 className="prism-heading-md text-primary mb-6 text-center">What PRISM Dynamics™ Maps</h2>
              <p className="prism-body text-muted-foreground text-center max-w-3xl mx-auto mb-8">
                PRISM Dynamics™ maps how you process information—through Information Elements, Core Alignments, 
                Dimensionality, Block Dynamics, State Overlay, and Relational Fit—to predict your best-fit type.
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="prism-hover-lift border-2 border-secondary/20">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 prism-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-primary mb-2">Information Elements</h3>
                    <p className="text-sm text-muted-foreground">The 8 mental "languages" your brain uses to process the world</p>
                    <Button variant="ghost" size="sm" asChild className="mt-2">
                      <a href="/signals" className="flex items-center gap-1">
                        Explore <ArrowRight className="h-3 w-3" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="prism-hover-lift border-2 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 prism-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-primary mb-2">Core Alignments</h3>
                    <p className="text-sm text-muted-foreground">How your cognitive functions naturally combine to form your type</p>
                    <Button variant="ghost" size="sm" asChild className="mt-2">
                      <a href="/disambiguation" className="flex items-center gap-1">
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
                    <h3 className="font-semibold text-primary mb-2">State Overlay</h3>
                    <p className="text-sm text-muted-foreground">A reactivity lens that explains day-to-day variations</p>
                    <Button variant="ghost" size="sm" asChild className="mt-2">
                      <a href="/state-overlay" className="flex items-center gap-1">
                        Explore <ArrowRight className="h-3 w-3" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="prism-hover-lift border-2 border-secondary/20">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 prism-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-primary mb-2">Relational Fit</h3>
                    <p className="text-sm text-muted-foreground">Understand compatibility dynamics and relational exchange patterns</p>
                    <Button variant="ghost" size="sm" asChild className="mt-2">
                      <a href="/prism-relational-fit" className="flex items-center gap-1">
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

      </div>

      {/* Typing Lab Teaser */}
      <TypingLabTeaser />
      
      {/* Social Proof Strip */}
      <SocialProofStrip />
      
      {/* Founding Member CTA */}
      <FoundingMemberCTA />
    </div>
  );
};

export default About;
