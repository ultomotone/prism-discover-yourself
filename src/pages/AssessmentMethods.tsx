import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, ArrowLeft, ArrowRight, CheckCircle, Target, BarChart3, Zap } from "lucide-react";
import Header from "@/components/Header";

const AssessmentMethods = () => {
  const assessmentLink = "https://docs.google.com/forms/d/e/1FAIpQLScVFSAWRNUZT10hEoziD1oMXeS_FyCVP9NFTWD61eR8xDQaDA/viewform";

  const methods = [
    {
      icon: Target,
      name: "Likert Scale Items",
      description: "Stable preferences and self-ratings",
      details: "Traditional agree/disagree questions that measure your typical preferences and behaviors. These help establish your baseline patterns.",
      examples: [
        '"I prefer to have clear guidelines before starting a project"',
        '"I often see patterns others miss"',
        '"I\'m comfortable making decisions under pressure"'
      ]
    },
    {
      icon: BarChart3,
      name: "Forced-Choice Pairs",
      description: "Trade-offs between signals (ipsative)",
      details: "You choose between two options that represent different information elements. This reduces response bias and reveals your true priorities.",
      examples: [
        'Choose: "Optimize the process" OR "Consider team feelings"',
        'Choose: "Explore possibilities" OR "Maintain stability"',
        'Choose: "Trust your gut" OR "Analyze thoroughly"'
      ]
    },
    {
      icon: Zap,
      name: "Scenario Toggles",
      description: "What you do under pressure or in flow",
      details: "Situational questions that reveal how you shift between calm and stress states, showing your block dynamics in action.",
      examples: [
        "When facing a tight deadline with incomplete information...",
        "In a conflict situation with a colleague...",
        "When everything is going smoothly on a project..."
      ]
    },
    {
      icon: CheckCircle,
      name: "Validity & State Checks",
      description: "Attention, consistency, mood, and context",
      details: "Quality control measures that detect when results might be skewed by temporary factors like stress, fatigue, or inattention.",
      examples: [
        "Attention checks: Detecting if you're reading carefully",
        "Consistency pairs: Flagging contradictory responses",
        "State measures: How stressed, tired, or distracted you feel"
      ]
    }
  ];

  const scoringSteps = [
    {
      step: "1",
      title: "Compute Element Scales",
      description: "Calculate your strength and dimensionality for each of the eight information elements",
      details: [
        "Strength per element (Ti, Te, Fi, Fe, Ni, Ne, Si, Se)",
        "Dimensionality mapping (1D-4D) for each element",
        "Block assignments (Core, Creative, Role, Aspirational)",
        "Toggle patterns (which blocks activate under different conditions)"
      ]
    },
    {
      step: "2",
      title: "Adjust for State",
      description: "Account for temporary factors that might skew your responses",
      details: [
        "Down-weight Likert items when stress/time pressure is high",
        "Emphasize forced-choice and scenario data for consistency",
        "Apply corrections for high reactivity (± overlay)",
        "Filter out responses affected by fatigue or distraction"
      ]
    },
    {
      step: "3",
      title: "Compare to Prototypes",
      description: "Match your pattern against the 16 PRISM type profiles",
      details: [
        "Compare 8-element pattern to prototype expectations",
        "Use Model A structure and PRISM mechanics",
        "Calculate probabilities for all 16 types",
        "Avoid hard cutoffs—embrace uncertainty when appropriate"
      ]
    },
    {
      step: "4",
      title: "Set Confidence Level",
      description: "Determine how certain we are about your type assignment",
      details: [
        "High confidence: Clear, consistent pattern match",
        "Medium confidence: Good match with some uncertainty",
        "Low confidence: Multiple possible types, recommend retest",
        "Transparent reporting: You know exactly how sure we are"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="prism-container pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          
          {/* Navigation */}
          <div className="flex justify-between items-center mb-8">
            <Button variant="outline" asChild>
              <a href="/state-overlay" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to State Overlay
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/accuracy-privacy" className="flex items-center gap-2">
                Next: Accuracy & Privacy
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>

          {/* Header */}
          <div className="text-center mb-16">
            <div className="w-20 h-20 prism-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <Settings className="h-10 w-10 text-white" />
            </div>
            <h1 className="prism-heading-lg text-primary mb-6">
              The PRISM Assessment: How It Works
            </h1>
            <p className="prism-body-lg text-muted-foreground max-w-4xl mx-auto mb-8">
              Building trust through transparency. Our multi-method approach reduces bias, increases accuracy, and gives you confidence in your results.
            </p>
          </div>

          {/* Why Multi-Method Matters */}
          <Card className="mb-16 prism-shadow-card">
            <CardContent className="p-8">
              <h2 className="prism-heading-md text-primary mb-6 text-center">Why Multi-Method Assessment?</h2>
              <div className="grid md:grid-cols-3 gap-8 mb-6">
                <div className="text-center">
                  <div className="w-16 h-16 prism-gradient-warm rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-primary mb-2">Reduces Bias</h3>
                  <p className="text-sm text-muted-foreground">
                    Single-method tests are vulnerable to response styles, social desirability, and "test-taking strategies"
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 prism-gradient-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-primary mb-2">Increases Reliability</h3>
                  <p className="text-sm text-muted-foreground">
                    Multiple measurement approaches create a more robust and consistent picture of your patterns
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 prism-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-primary mb-2">Captures Nuance</h3>
                  <p className="text-sm text-muted-foreground">
                    State-aware measurement shows both your stable patterns and situational variations
                  </p>
                </div>
              </div>
              <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-6">
                <p className="text-secondary font-semibold text-center">
                  The result: A more accurate, trustworthy profile that accounts for the complexity of human personality.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* The Four Methods */}
          <section className="mb-16">
            <h2 className="prism-heading-md text-primary mb-12 text-center">Four Assessment Methods</h2>
            <div className="grid lg:grid-cols-2 gap-8">
              {methods.map((method, index) => (
                <Card key={index} className="prism-hover-lift prism-shadow-card">
                  <CardContent className="p-8">
                    <div className="flex items-start mb-4">
                      <div className="w-12 h-12 prism-gradient-secondary rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                        <method.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-primary mb-1">
                          {method.name}
                        </h3>
                        <p className="text-accent font-medium italic">
                          {method.description}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-4">
                      {method.details}
                    </p>
                    
                    <div className="bg-muted/30 rounded-lg p-4">
                      <h4 className="font-semibold text-primary text-sm mb-2">Example Questions:</h4>
                      <ul className="space-y-1">
                        {method.examples.map((example, exIndex) => (
                          <li key={exIndex} className="text-sm text-muted-foreground">
                            • {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Scoring Process */}
          <Card className="mb-16 prism-shadow-card">
            <CardContent className="p-8">
              <h2 className="prism-heading-md text-primary mb-12 text-center">From Responses to Profile: Our Scoring Process</h2>
              <div className="space-y-8">
                {scoringSteps.map((step, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-12 h-12 prism-gradient-warm rounded-full flex items-center justify-center mr-6 flex-shrink-0">
                      <span className="text-white font-bold">{step.step}</span>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-xl font-semibold text-primary mb-2">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {step.description}
                      </p>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <ul className="space-y-1">
                          {step.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-start">
                              <div className="w-2 h-2 prism-gradient-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                              <span className="text-sm text-muted-foreground">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* What You Get */}
          <Card className="mb-16 prism-shadow-card">
            <CardContent className="p-8">
              <h2 className="prism-heading-md text-primary mb-6 text-center">What You'll Receive</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-4">Your Profile Includes</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-secondary mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-muted-foreground">8-element strength and dimensionality matrix</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-secondary mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-muted-foreground">Block dynamics map (Core, Creative, Role, Aspirational)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-secondary mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-muted-foreground">Stress/flow toggle patterns</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-secondary mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-muted-foreground">Current state overlay (± reactivity)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-secondary mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-muted-foreground">Confidence level with your type assignment</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-secondary mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-muted-foreground">Personalized development recommendations</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-4">Quality Assurance</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-accent mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-muted-foreground">Validity checks flagged if responses are inconsistent</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-accent mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-muted-foreground">State adjustments when stress/fatigue detected</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-accent mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-muted-foreground">No forced certainty—honest uncertainty when appropriate</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-accent mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-muted-foreground">Retest recommendations if confidence is low</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center mb-16">
            <Card className="prism-gradient-hero text-white prism-shadow-card">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold mb-4">Experience the PRISM Assessment</h2>
                <p className="text-white/90 mb-8 max-w-2xl mx-auto">
                  See how our multi-method approach creates a more accurate and trustworthy picture of your personality patterns.
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
          </div>

          {/* Navigation Footer */}
          <div className="flex justify-between items-center">
            <Button variant="outline" asChild>
              <a href="/state-overlay" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to State Overlay
              </a>
            </Button>
            <Button variant="assessment" asChild>
              <a href="/accuracy-privacy" className="flex items-center gap-2">
                Next: Accuracy & Privacy
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentMethods;