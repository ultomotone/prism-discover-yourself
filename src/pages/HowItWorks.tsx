import { ArrowLeft, ArrowRight, CheckCircle, Target, BarChart3, Users, Brain, Settings, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/assessment-methods">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Assessment Methods
            </Button>
          </Link>
          <Link to="/profiles">
            <Button variant="outline" size="sm">
              PRISM Profiles
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            The PRISM Dynamics™ Assessment – How It Works
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Multi-method design. State-aware scoring. Confidence-based reporting.
          </p>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            The PRISM Dynamics assessment was built to be more than a personality quiz. It's a measurement instrument—designed to be reliable, bias-resistant, and transparent about its certainty.
          </p>
        </div>

        {/* Why PRISM is Different */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-6 h-6" />
              Why PRISM is Different
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Most personality assessments rely on a single method—usually a self-rating questionnaire. That makes them easier to "game" (consciously or unconsciously), and vulnerable to mood, context, and social desirability effects.
            </p>
            <p>
              PRISM Dynamics uses multi-method measurement and state calibration to capture a truer, more stable picture of your personality—without ignoring the fact that humans change from moment to moment.
            </p>
          </CardContent>
        </Card>

        {/* The PRISM Method */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6">The PRISM Dynamics Method</h2>
          
          <div className="grid gap-6">
            {/* Multi-Method Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  1. Multi-Method Items
                </CardTitle>
                <CardDescription>To reduce bias and capture multiple layers of behavior:</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Likert Items</h4>
                  <p className="text-muted-foreground">Rate agreement with statements to measure stable preferences.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Forced-Choice Pairs</h4>
                  <p className="text-muted-foreground">Pick between two equally appealing options to reveal trade-offs between cognitive signals.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Scenario Toggles</h4>
                  <p className="text-muted-foreground">Choose your likely response in realistic situations, showing how you shift under pressure or in flow.</p>
                </div>
              </CardContent>
            </Card>

            {/* Validity & State Checks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  2. Validity & State Checks
                </CardTitle>
                <CardDescription>We test more than your traits:</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <span className="font-medium">Attention</span> – Ensuring you're engaged with the questions.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <span className="font-medium">Inconsistency Pairs</span> – Catching contradictory answers.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <span className="font-medium">Social Desirability Index</span> – Detecting "faking good."
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <span className="font-medium">State Indicators</span> – Stress, mood, sleep quality, time pressure, focus.
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trait vs. State Separation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  3. Trait vs. State Separation
                </CardTitle>
                <CardDescription>We adjust for momentary conditions so your profile reflects you, not just your today.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    Likert data is down-weighted when stress/time pressure is high.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    Forced-choice and scenario data are emphasized for stability.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    A ± overlay score captures your current reactivity without changing your core type.
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Type Prototyping & Confidence */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  4. Type Prototyping & Confidence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    Your pattern across Strength × Dimensionality for all eight signals is compared to prototype maps of the 16 PRISM types.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    We calculate probability for all types—never forcing a single label.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    Your result includes a confidence level so you know how firm the match is.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    Low/medium confidence? We tell you which other types are close and recommend next steps.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* What You Get */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-6 h-6" />
              What You Get
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <span className="font-medium">Profile Snapshot</span> – Your type, confidence level, and state overlay.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <span className="font-medium">Function Matrix</span> – Strength × Dimensionality for each signal.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <span className="font-medium">Block Map</span> – Calm vs. stress mode comparison.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <span className="font-medium">Communication & Decision Tips</span> – How to use your strengths.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <span className="font-medium">7-Day Micro-Practice</span> – Targeted actions to grow adaptability.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* For Researchers and Professionals */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6" />
              For Researchers and Professionals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">The assessment's data structure allows:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Factor and reliability analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Cohort norming</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Longitudinal tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Integration with team maps and development programs</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6 text-center">
            <h3 className="text-2xl font-bold mb-4">Next step:</h3>
            <p className="text-lg mb-6">
              Start the PRISM Dynamics assessment now and see the difference a state-aware, confidence-based approach makes.
            </p>
            <Button 
              size="lg"
              onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSe7qs7WjiFb5sUOxw6rJKGJtyMGhBxY9iKDW7HPOH6Fy3e1Bg/viewform', '_blank')}
            >
              Take the Assessment
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default HowItWorks;