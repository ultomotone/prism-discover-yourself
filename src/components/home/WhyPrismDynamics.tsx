import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Layers, Activity, MessageSquare, ArrowRight } from "lucide-react";

const WhyPrismDynamics = () => {
  const differentiators = [
    {
      icon: Target,
      title: "Predict-first engine",
      description: "We predict type before interviews or coaching.",
      link: "/how-it-works",
      linkText: "How It Works"
    },
    {
      icon: Layers,
      title: "Breadth, not boxes",
      description: "See your Dimensionality (1D–4D)—how far you can flex across contexts.",
      link: "/dimensionality",
      linkText: "Dimensionality"
    },
    {
      icon: Activity,
      title: "Stress/flow realism",
      description: "Understand how your pattern shifts under pressure vs flow.",
      link: "/blocks",
      linkText: "Block Dynamics"
    },
    {
      icon: MessageSquare,
      title: "Signals you can hear",
      description: "Linguistic markers that reveal your elements in real conversations.",
      link: "/signals",
      linkText: "Signals"
    }
  ];

  return (
    <section className="prism-section bg-muted/30">
      <div className="prism-container">
        <div className="text-center mb-12">
          <h2 className="prism-heading-lg text-primary mb-4">
            Why PRISM Dynamics™
          </h2>
          <p className="prism-body-lg text-muted-foreground max-w-3xl mx-auto">
            Most tests put you in a box. PRISM maps your information processing—and how it shifts under stress—so you can see what to do next.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {differentiators.map((item, index) => (
            <Card key={index} className="prism-hover-lift border-2 border-primary/10">
              <CardContent className="p-6">
                <div className="w-12 h-12 prism-gradient-primary rounded-full flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-primary mb-2 text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                <Button variant="ghost" size="sm" asChild className="p-0 h-auto">
                  <a href={item.link} className="flex items-center gap-1 text-primary hover:gap-2 transition-all">
                    Learn more → {item.linkText}
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyPrismDynamics;
