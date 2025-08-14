import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Brain, Target, TrendingUp } from "lucide-react";

const IndividualsSection = () => {
  const benefits = [
    {
      icon: Brain,
      title: "Self-Discovery",
      description: "Gain deep insights into your natural strengths, preferences, and behavioral patterns.",
    },
    {
      icon: Target,
      title: "Career Alignment",
      description: "Find roles and environments where you naturally thrive and achieve peak performance.",
    },
    {
      icon: TrendingUp,
      title: "Personal Growth",
      description: "Develop strategies for growth while honoring your authentic personality style.",
    },
    {
      icon: User,
      title: "Better Relationships",
      description: "Understand how to communicate and connect more effectively with others.",
    },
  ];

  return (
    <section id="individuals" className="prism-section bg-muted/30">
      <div className="prism-container">
        <div className="text-center mb-16">
          <h2 className="prism-heading-lg text-primary mb-6">
            For Individuals: Unlock Your Authentic Self
          </h2>
          <p className="prism-body-lg text-muted-foreground max-w-3xl mx-auto">
            Whether you're exploring career options, seeking personal growth, or improving relationships, 
            PRISM provides the scientific foundation for authentic self-discovery.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {benefits.map((benefit, index) => (
            <Card key={index} className="prism-hover-lift border-0 prism-shadow-card">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 prism-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-3">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl lg:text-3xl font-bold text-primary mb-4">
                Your PRISM Profile Reveals:
              </h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <div className="w-2 h-2 prism-gradient-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Your natural communication style and preferences
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 prism-gradient-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  How you process information and make decisions
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 prism-gradient-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Your stress triggers and optimal working conditions
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 prism-gradient-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Strategies for personal and professional development
                </li>
              </ul>
            </div>
            <div className="text-center lg:text-right">
              <div className="mb-6">
                <div className="text-4xl font-bold text-secondary mb-2">15 minutes</div>
                <div className="text-muted-foreground">to life-changing insights</div>
              </div>
              <Button 
                variant="assessment" 
                size="lg"
                onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLScVFSAWRNUZT10hEoziD1oMXeS_FyCVP9NFTWD61eR8xDQaDA/viewform', '_blank')}
              >
                Start Your Journey
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IndividualsSection;