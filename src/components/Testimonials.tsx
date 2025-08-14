import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Dr. Sarah Chen",
      role: "Chief People Officer, TechCorp",
      content: "PRISM transformed how our teams collaborate. The scientific rigor combined with practical insights helped us build a truly inclusive culture where everyone thrives.",
      rating: 5,
      company: "Fortune 500 Technology Company"
    },
    {
      name: "Marcus Rodriguez",
      role: "Team Lead, Innovation Lab",
      content: "Understanding my PRISM profile was a game-changer. I finally understood why certain work environments energized me while others drained me. Career-defining insights.",
      rating: 5,
      company: "Startup Accelerator"
    },
    {
      name: "Emma Thompson",
      role: "HR Director, Global Consulting",
      content: "We've used several personality assessments, but PRISM stands out for its research foundation and practical applications. Our employee engagement scores increased 40%.",
      rating: 5,
      company: "International Consulting Firm"
    }
  ];

  return (
    <section className="prism-section bg-muted/30">
      <div className="prism-container">
        <div className="text-center mb-16">
          <h2 className="prism-heading-lg text-primary mb-6">
            Trusted by Leaders Worldwide
          </h2>
          <p className="prism-body-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of individuals and organizations who've discovered 
            the transformative power of evidence-based personality insights.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="prism-hover-lift border-0 prism-shadow-card">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-warm fill-current" />
                  ))}
                </div>
                <blockquote className="text-muted-foreground mb-6 italic">
                  "{testimonial.content}"
                </blockquote>
                <div className="border-t pt-4">
                  <div className="font-semibold text-primary">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </div>
                  <div className="text-xs text-accent font-medium mt-1">
                    {testimonial.company}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Research Credibility */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-primary mb-8">
            Built on Scientific Research
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-2">15+</div>
              <div className="text-muted-foreground">Years of Research</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">50,000+</div>
              <div className="text-muted-foreground">Data Points Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-warm mb-2">99.2%</div>
              <div className="text-muted-foreground">Reliability Score</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;