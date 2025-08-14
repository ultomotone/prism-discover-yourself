import { Button } from "@/components/ui/button";
import { Clock, Shield, Brain, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";

const Assessment = () => {
  const assessmentLink = "https://docs.google.com/forms/d/e/1FAIpQLScVFSAWRNUZT10hEoziD1oMXeS_FyCVP9NFTWD61eR8xDQaDA/viewform";

  const beforeYouStart = [
    "Set aside ~25–35 minutes without interruptions.",
    "Go with your first honest answer.",
    "If something feels 'sometimes,' choose what fits most of the time."
  ];

  const whatsInside = [
    "Function Strength & Dimensionality (8 elements)",
    "Stress/Flow Scenarios & Block Dynamics", 
    "Validity & Quality checks (to protect accuracy)",
    "Optional research questions (demographics, context)"
  ];

  const faqItems = [
    {
      q: "How long is it?",
      a: "~25–35 minutes."
    },
    {
      q: "Do I need to study?", 
      a: "No—be yourself."
    },
    {
      q: "Can I retake it?",
      a: "Yes—especially after major life changes or development work."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="prism-container pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="prism-heading-lg text-primary mb-6">
              Take the PRISM Assessment
            </h1>
            <p className="prism-body-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              This is a deep-dive self-assessment that powers your PRISM profile. Answer honestly—there are no right or wrong answers.
            </p>
            <Button 
              variant="assessment" 
              size="lg" 
              className="text-xl px-12 py-4"
              onClick={() => window.open(assessmentLink, '_blank')}
            >
              Start Assessment
            </Button>
          </div>

          {/* Before You Start */}
          <Card className="mb-8 prism-shadow-card">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <CheckCircle className="h-6 w-6 text-secondary mr-3" />
                <h2 className="text-2xl font-semibold text-primary">Before you start</h2>
              </div>
              <ul className="space-y-3">
                {beforeYouStart.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* What's Inside */}
          <Card className="mb-8 prism-shadow-card">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <Brain className="h-6 w-6 text-accent mr-3" />
                <h2 className="text-2xl font-semibold text-primary">What's inside</h2>
              </div>
              <ul className="space-y-3">
                {whatsInside.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* After You Submit */}
          <Card className="mb-8 prism-shadow-card">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <Clock className="h-6 w-6 text-warm mr-3" />
                <h2 className="text-2xl font-semibold text-primary">After you submit (current state)</h2>
              </div>
              <p className="text-muted-foreground">
                Results are processed manually right now; automated dashboards are coming. You'll receive a profile summary with type, function matrix, block balance, stress/flow map, and guidance.
              </p>
            </CardContent>
          </Card>

          {/* Privacy & Consent */}
          <Card className="mb-8 prism-shadow-card">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <Shield className="h-6 w-6 text-primary mr-3" />
                <h2 className="text-2xl font-semibold text-primary">Privacy & consent</h2>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <div className="w-2 h-2 prism-gradient-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Your responses are confidential and used to generate your profile.
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 prism-gradient-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Optional research items are aggregated and anonymized.
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 prism-gradient-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  This is a personal development tool, not a clinical instrument.
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* FAQ Mini */}
          <Card className="mb-12 prism-shadow-card">
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-primary mb-6">FAQ mini</h2>
              <div className="space-y-4">
                {faqItems.map((item, index) => (
                  <div key={index}>
                    <h3 className="font-semibold text-primary mb-2">{item.q}</h3>
                    <p className="text-muted-foreground">{item.a}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Final CTA */}
          <div className="text-center">
            <Button 
              variant="hero" 
              size="lg" 
              className="text-xl px-12 py-4"
              onClick={() => window.open(assessmentLink, '_blank')}
            >
              Start Your PRISM Assessment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assessment;