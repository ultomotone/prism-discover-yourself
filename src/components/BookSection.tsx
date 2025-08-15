import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Target, Compass, Zap } from "lucide-react";

const BookSection = () => {
  const features = [
    {
      icon: <Target className="h-5 w-5" />,
      text: "Personality profiling beyond surface traits"
    },
    {
      icon: <Zap className="h-5 w-5" />,
      text: "Regulation strategies for optimal performance"
    },
    {
      icon: <Compass className="h-5 w-5" />,
      text: "Information processing mastery"
    },
    {
      icon: <Users className="h-5 w-5" />,
      text: "System mapping for team dynamics"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="prism-container">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 prism-gradient-hero rounded-full mb-6">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Coming Soon
            </h2>
            <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              PRISM
            </div>
            <div className="text-lg text-muted-foreground mb-6 space-y-1">
              <div><strong>P</strong>ersonality • <strong>R</strong>egulation • <strong>I</strong>nformation • <strong>S</strong>ystem • <strong>M</strong>apping</div>
              <div className="text-xl font-semibold text-primary">Self-Author Your Development</div>
            </div>
          </div>

          <Card className="prism-card-glow">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    The Complete Guide to Understanding Your Cognitive Architecture
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Discover how to decode your unique information processing patterns and 
                    create a personalized development roadmap. This comprehensive guide will 
                    transform how you understand yourself and optimize your potential.
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center text-foreground">
                        <div className="text-primary mr-3">
                          {feature.icon}
                        </div>
                        <span>{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <div className="prism-gradient-subtle rounded-2xl p-8 mb-6">
                    <div className="text-6xl font-bold text-primary mb-2">📚</div>
                    <div className="text-lg font-semibold text-foreground mb-2">
                      Be the First to Know
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Join our exclusive list for early access, special pricing, and bonus content.
                    </p>
                  </div>
                  
                  <Button 
                    variant="hero" 
                    size="lg" 
                    className="w-full"
                    onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLScVFSAWRNUZT10hEoziD1oMXeS_FyCVP9NFTWD61eR8xDQaDA/viewform', '_blank')}
                  >
                    Get Notified When Available
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default BookSection;