import { Button } from "@/components/ui/button";
import { Clock, Shield, Brain, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";

const Assessment = () => {
  const assessmentLink = "https://docs.google.com/forms/d/e/1FAIpQLScVFSAWRNUZT10hEoziD1oMXeS_FyCVP9NFTWD61eR8xDQaDA/viewform";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="prism-container pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="prism-heading-lg text-primary mb-6">
              Before You Start the PRISM Assessment
            </h1>
          </div>

          {/* What this is */}
          <Card className="mb-8 prism-shadow-card">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <Brain className="h-6 w-6 text-accent mr-3" />
                <h2 className="text-2xl font-semibold text-primary">What this is</h2>
              </div>
              <p className="text-muted-foreground">
                PRISM (Personality Regulation & Information System Mapping) shows how your mind actually runs in real life—which cognitive elements you rely on, how capable they are across contexts, which "blocks" lead under calm vs. stress, and how current state (our ± overlay) tilts expression.
              </p>
            </CardContent>
          </Card>

          {/* What you'll get */}
          <Card className="mb-8 prism-shadow-card">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <Clock className="h-6 w-6 text-secondary mr-3" />
                <h2 className="text-2xl font-semibold text-primary">What you'll get</h2>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="w-2 h-2 prism-gradient-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Your PRISM Profile: type + confidence + ± overlay</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 prism-gradient-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-muted-foreground">A Function Matrix: Strength × Dimensionality (1D–4D) for Ti/Te/Fi/Fe/Ni/Ne/Si/Se</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 prism-gradient-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Block Map: Core, Critic, Hidden, Instinct (calm vs. stress)</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 prism-gradient-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Notes on state effects and next-step tips</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* How it works */}
          <Card className="mb-8 prism-shadow-card">
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">How it works</h2>
              <p className="text-muted-foreground mb-6">
                A mix of Likert items, forced-choice trade-offs, and short scenarios. Plan for 25–40 minutes in one sitting.
              </p>
              
              <h3 className="text-xl font-semibold text-primary mb-4">Best results: quick prep</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="w-2 h-2 prism-gradient-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Take it when you're rested and calm (not rushed, sick, or highly stressed).</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 prism-gradient-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Use a quiet space and a laptop if possible.</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 prism-gradient-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Answer for your typical, everyday behavior—not an ideal or rare version of you.</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 prism-gradient-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-muted-foreground">If a question doesn't fit perfectly, pick the option that's closest in practice.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Retesting */}
          <Card className="mb-8 prism-shadow-card">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <RotateCcw className="h-6 w-6 text-warm mr-3" />
                <h2 className="text-2xl font-semibold text-primary">Retesting (important for accuracy)</h2>
              </div>
              <p className="text-muted-foreground mb-6">
                PRISM is state-aware, so we recommend a planned retest to separate stable patterns from temporary states.
              </p>
              
              <h3 className="text-xl font-semibold text-primary mb-4">Retest windows</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="w-2 h-2 prism-gradient-warm rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-muted-foreground">2–4 weeks later if your report flags high ± overlay (strong stress/reactivity today) or if you felt off while testing.</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 prism-gradient-warm rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-muted-foreground">3–6 months later for a normal follow-up to confirm stability and track growth.</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 prism-gradient-warm rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-muted-foreground">After major shifts (new job, big life event, sustained burnout/recovery) to update your profile.</span>
                </li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Your second pass boosts confidence in your top type vs. close neighbor, and refines Dimensionality bands as the model sees you in a different state.
              </p>
            </CardContent>
          </Card>

          {/* Privacy & use */}
          <Card className="mb-12 prism-shadow-card">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <Shield className="h-6 w-6 text-primary mr-3" />
                <h2 className="text-2xl font-semibold text-primary">Privacy & use</h2>
              </div>
              <p className="text-muted-foreground">
                Responses are used to generate your report and improve scoring quality. We don't sell personal data. If you want your data removed, just ask.
              </p>
            </CardContent>
          </Card>

          {/* Ready section */}
          <Card className="mb-8 prism-shadow-card">
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">Ready?</h2>
              <p className="text-muted-foreground mb-6">
                When you're set, click Start Assessment. If life is chaotic today, schedule it for a more typical day—then bookmark this page and come back.
              </p>
              
              <div className="text-center">
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="text-xl px-12 py-4"
                  onClick={() => window.open(assessmentLink, '_blank')}
                >
                  Start Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Assessment;