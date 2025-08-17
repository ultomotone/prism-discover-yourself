import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Brain, Shield, CheckCircle, Users, AlertTriangle } from "lucide-react";

interface AssessmentIntroProps {
  onStart: () => void;
}

export function AssessmentIntro({ onStart }: AssessmentIntroProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="prism-container pt-8 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="prism-heading-lg text-primary mb-6">
              Welcome to the PRISM Assessment
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Personality, Regulation, Information, System, Mapping
            </p>
          </div>

          {/* Introduction */}
          <Card className="mb-8 prism-shadow-card">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <Brain className="h-6 w-6 text-accent mr-3" />
                <h2 className="text-2xl font-semibold text-primary">About This Assessment</h2>
              </div>
              <p className="text-muted-foreground mb-6">
                This questionnaire is designed to create a detailed PRISM profile based on your responses, including dimensionality scores, information element strengths, and personality state/context indicators.
              </p>
              
              <h3 className="text-xl font-semibold text-primary mb-4">The assessment is structured in several parts:</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="w-2 h-2 prism-gradient-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-muted-foreground"><strong>Core PRISM Personality Assessment</strong> – Questions based on Socionics Model A and the PRISM mechanics to measure your cognitive preferences and behavioral tendencies.</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 prism-gradient-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-muted-foreground"><strong>Dimensionality & Expression</strong> – Measures the strength, flexibility, and situational expression of each information element.</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 prism-gradient-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-muted-foreground"><strong>State & Context Checks</strong> – Captures your current stress, mood, and focus to refine accuracy.</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 prism-gradient-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-muted-foreground"><strong>Optional Research Questions</strong> – Demographics, life context, and self-perception questions to support model improvement and academic study.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Time & Format */}
          <Card className="mb-8 prism-shadow-card">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <Clock className="h-6 w-6 text-secondary mr-3" />
                <h2 className="text-2xl font-semibold text-primary">Time Required</h2>
              </div>
              <p className="text-muted-foreground text-lg">
                Approximately <strong>25–35 minutes</strong>
              </p>
            </CardContent>
          </Card>

          {/* Confidentiality */}
          <Card className="mb-8 prism-shadow-card">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <Shield className="h-6 w-6 text-primary mr-3" />
                <h2 className="text-2xl font-semibold text-primary">Confidentiality</h2>
              </div>
              <p className="text-muted-foreground">
                Your responses will be kept confidential and used only for generating your profile and, if you choose, for aggregated research purposes. No personally identifying information will be shared without your explicit consent.
              </p>
            </CardContent>
          </Card>

          {/* Voluntary Participation */}
          <Card className="mb-8 prism-shadow-card">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <CheckCircle className="h-6 w-6 text-accent mr-3" />
                <h2 className="text-2xl font-semibold text-primary">Voluntary Participation</h2>
              </div>
              <p className="text-muted-foreground">
                You may skip any optional research questions. Skipping will not affect your profile results.
              </p>
            </CardContent>
          </Card>

          {/* Ready section */}
          <Card className="mb-8 prism-shadow-card">
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">Ready to Begin?</h2>
              <p className="text-muted-foreground mb-6">
                When you're ready to start your PRISM assessment, click the button below. The assessment will take you through multiple sections with a progress indicator.
              </p>
              
              <div className="text-center">
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="text-xl px-12 py-4"
                  onClick={onStart}
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
}