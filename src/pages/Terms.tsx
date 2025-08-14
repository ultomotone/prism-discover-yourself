import { Card, CardContent } from "@/components/ui/card";
import { Scale, BookOpen, Shield, AlertTriangle } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="prism-container pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="prism-heading-lg text-primary mb-6">
              Terms of Service
            </h1>
            <p className="prism-body-lg text-muted-foreground max-w-2xl mx-auto">
              These terms govern your use of the PRISM assessment and related services.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              <em>Note: This is starter copy—have counsel review for legal compliance.</em>
            </p>
          </div>

          <div className="space-y-8">
            {/* Purpose & Scope */}
            <Card className="prism-shadow-card">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <BookOpen className="h-6 w-6 text-secondary mr-3" />
                  <h2 className="text-2xl font-semibold text-primary">Purpose & Scope</h2>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    PRISM is for personal development and education; it is not a clinical tool.
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Results should be used as guidance, not definitive diagnoses or predictions.
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    By using PRISM, you acknowledge it's for developmental purposes only.
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Limitations */}
            <Card className="prism-shadow-card">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <AlertTriangle className="h-6 w-6 text-warm mr-3" />
                  <h2 className="text-2xl font-semibold text-primary">Limitations & Disclaimers</h2>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-warm rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    No guarantee of outcomes; use judgment in applying recommendations.
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-warm rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Results may vary based on context, mood, and life circumstances.
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-warm rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    PRISM should not be used for hiring, firing, or legal decisions without proper validation.
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Intellectual Property */}
            <Card className="prism-shadow-card">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Shield className="h-6 w-6 text-accent mr-3" />
                  <h2 className="text-2xl font-semibold text-primary">Intellectual Property</h2>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    PRISM content, methods, and graphics are owned by PRISM Personality System.
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    You may not reproduce, distribute, or create derivative works without permission.
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Your personal results are yours to use; the underlying system remains proprietary.
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* User Responsibilities */}
            <Card className="prism-shadow-card">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Scale className="h-6 w-6 text-primary mr-3" />
                  <h2 className="text-2xl font-semibold text-primary">User Responsibilities</h2>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Provide accurate information during assessment for valid results.
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Use results responsibly and in appropriate contexts.
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Respect the confidentiality of others' PRISM results.
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Updates & Contact */}
            <Card className="prism-shadow-card">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-semibold text-primary mb-4">Terms Updates</h3>
                <p className="text-muted-foreground mb-4">
                  We may update these terms periodically. Continued use constitutes acceptance of any changes.
                </p>
                <p className="text-muted-foreground mb-4">
                  For questions about these terms, contact us at legal@prismassessment.com
                </p>
                <p className="text-sm text-muted-foreground">
                  Last updated: December 2024
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;