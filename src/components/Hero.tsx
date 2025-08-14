import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import prismHero from "@/assets/prism-hero.jpg";

const Hero = () => {
  return (
    <section className="pt-16 prism-section overflow-hidden">
      <div className="prism-container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="prism-heading-xl text-primary">
                Discover the{" "}
                <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                  Science of You
                </span>{" "}
                with PRISM
              </h1>
              <p className="prism-body-lg text-muted-foreground max-w-2xl">
                Unlock your authentic self through evidence-based personality insights. 
                PRISM combines cutting-edge research with practical applications to help 
                individuals and teams reach their full potential.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="assessment" 
                size="lg" 
                className="group"
                onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLScVFSAWRNUZT10hEoziD1oMXeS_FyCVP9NFTWD61eR8xDQaDA/viewform', '_blank')}
              >
                Take the PRISM Assessment
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline-primary" size="lg" className="group">
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
            </div>

          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative prism-hover-lift">
              <img
                src={prismHero}
                alt="PRISM Personality System - Scientific personality assessment"
                className="w-full h-auto rounded-2xl prism-shadow-card"
              />
              <div className="absolute inset-0 prism-hero-overlay rounded-2xl"></div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 prism-gradient-accent rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 prism-gradient-secondary rounded-full opacity-30 animate-pulse delay-700"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;