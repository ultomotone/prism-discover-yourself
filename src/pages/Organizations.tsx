import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Users, MessageSquare, TrendingUp, Target } from "lucide-react";
import { Link } from "react-router-dom";
import CalInline from "@/components/CalInline";
import { getCalApi } from "@calcom/embed-react";

interface Service {
  title: string;
  slug: string;
  description: string;
  duration: string;
  price?: string;
}

const Organizations = () => {
  const services: Service[] = [
    {
      title: "Owner/Leader Discovery",
      slug: "owner-leader-discovery-20m-49-credit",
      description: "Snapshot of leadership signals and growth areas.",
      duration: "20m",
      price: "49 credits",
    },
    {
      title: "Team Compass Workshop",
      slug: "team-compass-workshop-group-up-to-8",
      description: "Interactive session for teams up to eight people.",
      duration: "90m",
    },
    {
      title: "Leadership Debrief",
      slug: "leadership-debrief",
      description: "Deep dive on leadership style and blind spots.",
      duration: "60m",
    },
    {
      title: "Sales Persona Play",
      slug: "sales-persona-play",
      description: "Align sales tactics to customer cognition.",
      duration: "45m",
    },
    {
      title: "Manager: Coaching by Persona",
      slug: "manager-coaching-by-persona",
      description: "Coaching framework tailored to manager profiles.",
      duration: "60m",
    },
    {
      title: "Hiring Fit Screen",
      slug: "hiring-fit-screen",
      description: "Evaluate candidate fit before hiring decisions.",
      duration: "30m",
    },
    {
      title: "Team Performance Sprint",
      slug: "team-performance-sprint-4-950-mo-8-12-people-2-months",
      description: "Two-month sprint to raise team effectiveness.",
      duration: "2 months",
    },
  ];

  const handleBook = async (slug: string) => {
    const cal = await getCalApi({ namespace: "prism" });
    cal("open", { calLink: `daniel-speiss/${slug}` });
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

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
    <div className="prism-container pt-24 pb-16">
      <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="prism-heading-lg text-primary mb-6">
              PRISM for Organizations
            </h1>
            <p className="prism-body-lg text-muted-foreground max-w-3xl mx-auto">
              Build understanding, reduce friction, and unlock collective potential. Teams thrive when they understand how each member processes information, makes decisions, and adapts under pressure.
            </p>
          </div>

          {/* Services */}
          <section className="mb-16" aria-labelledby="org-services">
            <h2 id="org-services" className="prism-heading-md text-primary mb-4 text-center">
              Services
            </h2>
            <p className="prism-body text-muted-foreground text-center mb-8">
              Solutions tailored for teams and leaders.
            </p>
            <div
              className="grid gap-6 sm:grid-cols-2 md:grid-cols-3"
              data-testid="organizations-services"
            >
              {services.map((service) => (
                <Card
                  key={service.slug}
                  className="prism-card-hover"
                  data-testid="organization-service"
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                    <p className="text-sm text-muted-foreground">
                      {service.duration}
                      {service.price && ` · ${service.price}`}
                    </p>
                  </CardHeader>
                  <CardContent className="flex gap-2">
                    <Button asChild variant="outline">
                      <Link to={`/solutions/organizations/${service.slug}`}>
                        Learn more
                      </Link>
                    </Button>
                    <Button onClick={() => handleBook(service.slug)}>
                      Book now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Booking Embed */}
          <section id="booking" className="mb-16" aria-labelledby="book-org">
            <h2 id="book-org" className="prism-heading-md text-primary mb-4 text-center">
              Book a Session
            </h2>
            <p className="prism-body text-muted-foreground text-center mb-8">
              Pick a time directly below.
            </p>
            <div data-testid="organizations-cal">
              <CalInline calLink="daniel-speiss" selector="#cal-booking" />
            </div>
          </section>

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
            <Button variant="hero" size="lg" onClick={() => window.location.href = 'mailto:daniel.joseph.speiss@gmail.com?subject=Organization Inquiry'}>
              Talk to Us
            </Button>
            <p className="text-muted-foreground mt-4">Contact form available for organization inquiries</p>
          </div>
        </div>
      </div>
  );
};

export default Organizations;