import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FoundingMemberCTA = () => {
  const navigate = useNavigate();

  const benefits = [
    "Deep-dive library",
    "Signals Packs",
    "Typing Lab member feed",
    "Quarterly refresh",
    "30-day guarantee"
  ];

  return (
    <section className="prism-section bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="prism-container max-w-5xl">
        <Card className="border-2 border-primary/30 prism-shadow-card overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-secondary p-1">
            <div className="bg-background p-8 md:p-12">
              <CardContent className="p-0">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Crown className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="prism-heading-lg text-primary mb-4">
                    Become a Founding Member
                  </h2>
                  <p className="prism-body-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                    Get exclusive access to advanced tools, deeper insights, and the full PRISM Dynamics™ experience.
                  </p>
                </div>

                <div className="grid md:grid-cols-5 gap-4 mb-8">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-2 bg-muted/50 p-4 rounded-lg">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    variant="assessment" 
                    size="lg"
                    onClick={() => navigate('/membership')}
                  >
                    Become a Member (Annual)
                  </Button>
                  <Button 
                    variant="outline-primary" 
                    size="lg"
                    onClick={() => navigate('/membership')}
                  >
                    Try Monthly
                  </Button>
                </div>
              </CardContent>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default FoundingMemberCTA;
