import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Microscope, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TypingLabTeaser = () => {
  const navigate = useNavigate();

  return (
    <section className="prism-section bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="prism-container max-w-4xl">
        <Card className="border-2 border-primary/20 prism-shadow-card">
          <CardContent className="p-8 md:p-12 text-center">
            <div className="w-16 h-16 prism-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <Microscope className="h-8 w-8 text-white" />
            </div>
            
            <h2 className="prism-heading-md text-primary mb-4">
              Evidence in the wild.
            </h2>
            
            <p className="prism-body-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              See PRISM Dynamics™ applied to public figures—what signals we look for, and why.
            </p>
            
            <Button 
              variant="assessment" 
              size="lg"
              onClick={() => navigate('/typing-lab')}
              className="group"
            >
              View Typing Lab
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default TypingLabTeaser;
