import { Card, CardContent } from "@/components/ui/card";
import { ClipboardCheck, Sparkles, Compass } from "lucide-react";

const HowItWorksStrip = () => {
  const steps = [
    {
      icon: ClipboardCheck,
      title: "Take the test",
      description: "Multi-method assessment"
    },
    {
      icon: Sparkles,
      title: "Get a first-pass prediction",
      description: "Confidence-based type call"
    },
    {
      icon: Compass,
      title: "Explore your elements & dynamics",
      description: "Deep-dive into your pattern"
    }
  ];

  return (
    <section className="prism-section">
      <div className="prism-container max-w-5xl">
        <h2 className="prism-heading-md text-primary text-center mb-8">
          How It Works
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="relative">
                <div className="w-16 h-16 prism-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-secondary to-primary/20" />
                )}
              </div>
              <h3 className="font-semibold text-primary mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-muted-foreground">
          Built on eight{" "}
          <a href="/signals" className="text-primary hover:underline font-medium">
            Information Elements
          </a>
          ,{" "}
          <a href="/dimensionality" className="text-primary hover:underline font-medium">
            Dimensionality (1D–4D)
          </a>
          , and{" "}
          <a href="/blocks" className="text-primary hover:underline font-medium">
            Block Dynamics
          </a>
          .
        </p>
      </div>
    </section>
  );
};

export default HowItWorksStrip;
