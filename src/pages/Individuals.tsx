import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Target, TrendingUp, MessageSquare, ArrowRight } from "lucide-react";

const Individuals = () => {
  const learningPoints = [
    {
      icon: Target,
      title: "Your top information elements and where they shine",
      description: "Understand your natural strengths and how to leverage them effectively."
    },
    {
      icon: TrendingUp,
      title: "Your dimensionality map (what's flexible vs. narrow right now)",
      description: "See where you can adapt easily and where you might need more structure."
    },
    {
      icon: MessageSquare,
      title: "Your stress/flow toggles and how to reset",
      description: "Recognize when you're off track and learn practical ways to get back to your best."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="prism-container pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="prism-heading-lg text-primary mb-6">
              Clear insight you can act on
            </h1>
            <p className="prism-body-lg text-muted-foreground max-w-3xl mx-auto">
              Your PRISM profile turns self-knowledge into everyday moves—how to decide, communicate, and grow.
            </p>
          </div>

          {/* What you'll learn */}
          <section className="mb-16">
            <h2 className="prism-heading-md text-primary mb-12 text-center">What you'll learn</h2>
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              {learningPoints.map((point, index) => (
                <Card key={index} className="prism-hover-lift prism-shadow-card">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 prism-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                      <point.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-primary mb-4">
                      {point.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {point.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="prism-shadow-card">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-primary mb-4">A 7-day micro-practice to build one growth edge</h3>
                <p className="text-muted-foreground">
                  Get a personalized, bite-sized practice designed specifically for your profile to help you develop in areas that matter most.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* How it works */}
          <section className="mb-16">
            <h2 className="prism-heading-md text-primary mb-12 text-center">How it works</h2>
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="text-center">
                <div className="w-12 h-12 prism-gradient-primary rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">1</span>
                </div>
                <p className="font-semibold text-primary">Take the assessment</p>
              </div>
              <ArrowRight className="h-6 w-6 text-muted-foreground transform md:rotate-0 rotate-90" />
              <div className="text-center">
                <div className="w-12 h-12 prism-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">2</span>
                </div>
                <p className="font-semibold text-primary">Get your profile</p>
              </div>
              <ArrowRight className="h-6 w-6 text-muted-foreground transform md:rotate-0 rotate-90" />
              <div className="text-center">
                <div className="w-12 h-12 prism-gradient-accent rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">3</span>
                </div>
                <p className="font-semibold text-primary">Apply a simple plan</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="text-center mb-16">
            <Button 
              variant="assessment" 
              size="lg"
              onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLScVFSAWRNUZT10hEoziD1oMXeS_FyCVP9NFTWD61eR8xDQaDA/viewform', '_blank')}
            >
              Start Your Assessment
            </Button>
          </div>

          {/* Testimonial */}
          <Card className="prism-shadow-card max-w-3xl mx-auto">
            <CardContent className="p-8">
              <blockquote className="text-xl text-center text-muted-foreground italic mb-4">
                "PRISM explained why my 'bad days' look so different—and how to get back to my best."
              </blockquote>
              <div className="text-center text-sm text-accent font-medium">
                — Testimonial placeholder
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Individuals;