import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import DashboardPreview from "@/components/DashboardPreview";

const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="pt-16 prism-section overflow-hidden">
      <div className="prism-container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="prism-heading-xl text-primary">
                Predict your type on the first pass.
              </h1>
              <p className="prism-body-lg text-muted-foreground max-w-2xl">
                PRISM Dynamics™ maps how you process information—in flow and under pressure—to predict your best-fit type before any 1:1 typing.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="assessment" 
                size="lg" 
                className="group"
                onClick={() => navigate('/assessment')}
              >
                Start the Test
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline-primary" 
                size="lg" 
                onClick={() => navigate('/how-it-works')}
                className="group"
              >
                How It Works
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

          </div>

          {/* Right Dashboard Preview */}
          <div className="relative">
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;