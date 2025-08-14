import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, BarChart3, Zap, Shield, CheckCircle, ArrowRight, HelpCircle } from "lucide-react";
import { useState } from "react";
import Header from "@/components/Header";

const About = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const assessmentLink = "https://docs.google.com/forms/d/e/1FAIpQLScVFSAWRNUZT10hEoziD1oMXeS_FyCVP9NFTWD61eR8xDQaDA/viewform";

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
    <div className="min-h-screen bg-background">
      <Header />
      <div className="prism-container pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="prism-heading-lg text-primary mb-6">
              The PRISM Model & Methods
            </h1>
            <p className="prism-body-lg text-muted-foreground max-w-4xl mx-auto mb-8">
              A modern, evidence-minded framework that maps how you think and decide—plus how your expression shifts under stress and in flow.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                variant="assessment" 
                size="lg"
                onClick={() => window.open(assessmentLink, '_blank')}
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
          </div>

          {/* What is PRISM? */}
          <section className="mb-16">
            <Card className="prism-shadow-card">
              <CardContent className="p-8">
                <h2 className="prism-heading-md text-primary mb-6">What is PRISM?</h2>
                <p className="prism-body text-muted-foreground mb-4">
                  <strong className="text-primary">PRISM stands for Personality • Regulation • Information System Mapping.</strong>
                </p>
                <p className="prism-body text-muted-foreground mb-4">
                  It's a practical map of your mind's preferred information signals (from Socionics Model A), how capable and flexible those signals are (dimensionality), how they reconfigure in real situations (block dynamics), and how a state overlay (±) can shift your expression on any given day.
                </p>
                <p className="prism-body text-primary font-medium">
                  In plain English: PRISM shows what drives your decisions, what changes when you're stressed or in flow, and how to use that knowledge to communicate better, choose wisely, and grow intentionally.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* The Model at a Glance */}
          <section className="mb-16">
            <h2 className="prism-heading-md text-primary mb-12 text-center">The Model at a Glance</h2>
            
            {/* 1) Information Elements */}
            <Card className="mb-8 prism-shadow-card">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Brain className="h-6 w-6 text-secondary mr-3" />
                  <h3 className="text-2xl font-semibold text-primary">1) Information Elements (the 8 signals)</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Each "signal" is a distinct way of processing information. You use all eight—just in different amounts.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {elements.map((element, index) => (
                    <div key={index} className="flex items-start p-4 bg-muted/30 rounded-lg">
                      <div className="w-8 h-8 prism-gradient-secondary rounded-md flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-white font-bold text-sm">{element.code}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-primary">{element.name}</span>
                        <span className="text-muted-foreground">: {element.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4 font-medium">
                  Output: A matrix of Strength (how often/intensely you use it) and Dimensionality (how capable and portable it is).
                </p>
              </CardContent>
            </Card>

            {/* 2) Dimensionality */}
            <Card className="mb-8 prism-shadow-card">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <BarChart3 className="h-6 w-6 text-accent mr-3" />
                  <h3 className="text-2xl font-semibold text-primary">2) Dimensionality (1D–4D)</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Not "good vs. bad"—it's about breadth and adaptability.
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {dimensionality.map((dim, index) => (
                    <div key={index} className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="w-12 h-12 prism-gradient-accent rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold">{dim.level}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{dim.desc}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4 font-medium">
                  Output: Each of the eight elements is labeled 1D–4D based on your responses.
                </p>
              </CardContent>
            </Card>

            {/* 3) Block Dynamics */}
            <Card className="mb-8 prism-shadow-card">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Zap className="h-6 w-6 text-warm mr-3" />
                  <h3 className="text-2xl font-semibold text-primary">3) Block Dynamics (how you shift in real life)</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Your system reorganizes under different conditions:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {blocks.map((block, index) => (
                    <div key={index} className="flex items-start p-4 bg-muted/30 rounded-lg">
                      <div className="w-3 h-3 prism-gradient-warm rounded-full mt-1 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-primary">{block.name}</span>
                        <span className="text-muted-foreground"> — {block.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4 font-medium">
                  Output: A block balance and a stress/flow toggle map (what tends to come online when).
                </p>
              </CardContent>
            </Card>

            {/* 4) The ± Overlay */}
            <Card className="mb-8 prism-shadow-card">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Shield className="h-6 w-6 text-primary mr-3" />
                  <h3 className="text-2xl font-semibold text-primary">4) The ± Overlay (state)</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  A calm/reactive state overlay (akin to neuroticism) that explains how the same profile can look different on different days.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <span className="font-semibold text-red-700">+ (higher reactivity):</span>
                    <span className="text-red-600 ml-2">more volatile, hyper-vigilant tone</span>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <span className="font-semibold text-green-700">− (lower reactivity):</span>
                    <span className="text-green-600 ml-2">steadier, easier recovery</span>
                  </div>
                </div>
                <p className="text-sm text-primary font-medium">
                  Important: The overlay changes expression, not your core wiring.
                </p>
              </CardContent>
            </Card>
          </section>

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
                  onClick={() => window.open(assessmentLink, '_blank')}
                >
                  Take the Assessment
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;