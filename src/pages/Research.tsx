import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Shield, Users, CheckCircle, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";

const Research = () => {
  const methods = [
    "Multi-method items (Likert + forced-choice + scenarios)",
    "Attention and consistency checks",
    "Social-desirability monitoring", 
    "State adjustments for stress/time pressure"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="prism-container pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="prism-heading-lg text-primary mb-6">
              How we build confidence in your results
            </h1>
            <p className="prism-body-lg text-muted-foreground max-w-3xl mx-auto">
              PRISM is designed to be rigorous and transparent. We show our confidence, not just a label.
            </p>
          </div>

          {/* Methods we use */}
          <section className="mb-16">
            <h2 className="prism-heading-md text-primary mb-12 text-center">Methods we use</h2>
            <Card className="prism-shadow-card">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <BarChart3 className="h-6 w-6 text-secondary mr-3" />
                  <h3 className="text-xl font-semibold text-primary">Assessment Design</h3>
                </div>
                <ul className="space-y-4">
                  {methods.map((method, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-secondary mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-muted-foreground">{method}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Scoring & confidence */}
          <section className="mb-16">
            <h2 className="prism-heading-md text-primary mb-12 text-center">Scoring & confidence</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="prism-shadow-card">
                <CardContent className="p-8">
                  <Shield className="h-8 w-8 text-accent mb-4" />
                  <h3 className="text-xl font-semibold text-primary mb-4">Probabilistic Matching</h3>
                  <p className="text-muted-foreground">
                    We compare your pattern to type prototypes and compute probabilities rather than forcing a single classification.
                  </p>
                </CardContent>
              </Card>

              <Card className="prism-shadow-card">
                <CardContent className="p-8">
                  <Users className="h-8 w-8 text-warm mb-4" />
                  <h3 className="text-xl font-semibold text-primary mb-4">Confidence Levels</h3>
                  <p className="text-muted-foreground">
                    High confidence → firm type call; Medium/Low → likely types + next steps for clarification.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Published Research */}
          <section className="mb-16">
            <h2 className="prism-heading-md text-primary mb-12 text-center">Published Research</h2>
            <Card className="prism-shadow-card">
              <CardContent className="p-8">
                <div className="flex items-start">
                  <FileText className="h-8 w-8 text-secondary mr-4 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-primary mb-2">
                      First 100 Assessments: PRISM v1.0 and v1.1 Analysis
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      A detailed analysis of cognitive-function coherence, typology distributions, and state vs. trait effects in early PRISM data. This study examines the first ~100 completed sessions to evaluate assessment reliability and theoretical alignment.
                    </p>
                    <Link 
                      to="/research/first-hundred-study"
                      className="inline-flex items-center text-secondary hover:text-secondary/80 font-medium"
                    >
                      Read Full Study →
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Invitation to participate */}
          <section className="mb-16">
            <Card className="prism-gradient-hero text-white prism-shadow-card">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Invitation to participate</h2>
                <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                  Contribute anonymized data to help improve norms and thresholds. Your participation helps make PRISM more accurate for everyone.
                </p>
                <Button 
                  variant="assessment" 
                  className="bg-white text-primary hover:bg-white/90"
                  onClick={() => window.location.href = 'mailto:team@prismpersonality.com?subject=PRISM Research Participation'}
                >
                  Join the Research List
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Research;