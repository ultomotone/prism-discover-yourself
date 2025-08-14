import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, MessageSquare, BarChart3, Lightbulb } from "lucide-react";

const TeamsSection = () => {
  const outcomes = [
    {
      icon: MessageSquare,
      title: "Enhanced Communication",
      description: "Teams learn to adapt their communication styles for maximum impact and understanding.",
    },
    {
      icon: Users,
      title: "Stronger Collaboration", 
      description: "Understanding personality differences transforms conflict into productive collaboration.",
    },
    {
      icon: BarChart3,
      title: "Increased Productivity",
      description: "When people work in their natural strengths, performance and engagement soar.",
    },
    {
      icon: Lightbulb,
      title: "Innovation Boost",
      description: "Diverse thinking styles create breakthrough solutions and creative problem-solving.",
    },
  ];

  return (
    <section id="teams" className="prism-section">
      <div className="prism-container">
        <div className="text-center mb-16">
          <h2 className="prism-heading-lg text-primary mb-6">
            For Teams: Transform Your Workplace Culture
          </h2>
          <p className="prism-body-lg text-muted-foreground max-w-3xl mx-auto">
            From startups to Fortune 500 companies, PRISM helps teams communicate better, 
            collaborate more effectively, and achieve breakthrough results together.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {outcomes.map((outcome, index) => (
            <Card key={index} className="prism-hover-lift border-0 prism-shadow-card">
              <CardContent className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 prism-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <outcome.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-3">
                      <h3 className="text-xl font-semibold text-primary">
                        {outcome.title}
                      </h3>
                    </div>
                    <p className="text-muted-foreground">
                      {outcome.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Team Solutions Showcase */}
        <div className="prism-gradient-hero rounded-2xl p-8 lg:p-12 text-white">
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                Comprehensive Team Solutions
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Team Workshops</h4>
                  <p className="text-white/90 text-sm">
                    Interactive sessions that build understanding and practical skills
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Leadership Development</h4>
                  <p className="text-white/90 text-sm">
                    Equip managers with tools to lead diverse personality types
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Conflict Resolution</h4>
                  <p className="text-white/90 text-sm">
                    Transform workplace friction into productive collaboration
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Ongoing Support</h4>
                  <p className="text-white/90 text-sm">
                    Continuous coaching and resources for sustained success
                  </p>
                </div>
              </div>
            </div>
            <div className="text-center lg:text-right">
              <div className="space-y-4">
                <Button 
                  variant="assessment" 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90"
                  onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLScVFSAWRNUZT10hEoziD1oMXeS_FyCVP9NFTWD61eR8xDQaDA/viewform', '_blank')}
                >
                  Get Team Assessment
                </Button>
                <div className="text-white/80 text-sm">
                  Free consultation included
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamsSection;