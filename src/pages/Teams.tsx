import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, MessageSquare, TrendingUp, Target } from "lucide-react";

const Teams = () => {
  const outcomes = [
    {
      icon: MessageSquare,
      title: "Fewer crossed wires; better feedback loops",
      description: "Clear communication patterns reduce misunderstandings and improve collaboration."
    },
    {
      icon: Target,
      title: "Clearer roles based on strengths and dimensionality", 
      description: "Assign responsibilities that align with natural abilities and development levels."
    },
    {
      icon: TrendingUp,
      title: "Faster decisions under pressure",
      description: "Teams understand how each member responds to stress and can adapt accordingly."
    }
  ];

  const included = [
    "Team Assessment + Group Report",
    "Workshop: PRISM in practice (communication, conflict, decisions)",
    "Manager toolkit: 1:1 prompts by profile and block dynamics"
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="prism-container pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="prism-heading-lg text-primary mb-6">
              A shared language for better work
            </h1>
            <p className="prism-body-lg text-muted-foreground max-w-3xl mx-auto">
              Reduce friction, make cleaner decisions, and design meetings that fit how your team thinks.
            </p>
          </div>

          {/* Team outcomes */}
          <section className="mb-16">
            <h2 className="prism-heading-md text-primary mb-12 text-center">Team outcomes</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {outcomes.map((outcome, index) => (
                <Card key={index} className="prism-hover-lift prism-shadow-card">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 prism-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                      <outcome.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-primary mb-4">
                      {outcome.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {outcome.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* What's included */}
          <section className="mb-16">
            <h2 className="prism-heading-md text-primary mb-12 text-center">What's included</h2>
            <Card className="prism-shadow-card">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-3 gap-8">
                  {included.map((item, index) => (
                    <div key={index} className="text-center">
                      <div className="w-12 h-12 prism-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-primary mb-2">
                        {item.split(':')[0]}
                      </h3>
                      {item.includes(':') && (
                        <p className="text-sm text-muted-foreground">
                          {item.split(':')[1]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* CTA */}
          <div className="text-center">
            <Button variant="hero" size="lg" asChild>
              <a href="/contact">Talk to Us</a>
            </Button>
            <p className="text-muted-foreground mt-4">Contact form available for team inquiries</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teams;