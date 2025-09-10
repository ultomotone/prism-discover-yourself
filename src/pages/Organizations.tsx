import React, { type ComponentType } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Users,
  MessageSquare,
  TrendingUp,
  Target,
  User,
  Compass,
  Lightbulb,
  DollarSign,
  UserCog,
  Search,
  BookOpen,
  Rocket,
} from "lucide-react";
import { Link } from "react-router-dom";

export interface Service {
  key: string;
  title: string;
  description: string;
  routePath: string;
  duration: string;
  price?: string;
  icon: ComponentType<{ className?: string }>;
}

export const organizationServices: Service[] = [
  {
    key: "owner-leader-discovery",
    title: "Owner/Leader Discovery",
    description: "Snapshot of leadership signals and growth areas.",
    routePath:
      "/solutions/organizations/owner-leader-discovery-20m-49-credit",
    duration: "20m",
    price: "49 credits",
    icon: User,
  },
  {
    key: "team-compass-workshop",
    title: "Team Compass Workshop",
    description: "Interactive session for teams up to eight people.",
    routePath:
      "/solutions/organizations/team-compass-workshop-group-up-to-8",
    duration: "90m",
    icon: Compass,
  },
  {
    key: "leadership-debrief",
    title: "Leadership Debrief",
    description: "Deep dive on leadership style and blind spots.",
    routePath: "/solutions/organizations/leadership-debrief",
    duration: "60m",
    icon: Lightbulb,
  },
  {
    key: "sales-persona-play",
    title: "Sales Persona Play",
    description: "Align sales tactics to customer cognition.",
    routePath: "/solutions/organizations/sales-persona-play",
    duration: "45m",
    icon: DollarSign,
  },
  {
    key: "manager-coaching",
    title: "Manager: Coaching by Persona",
    description: "Coaching framework tailored to manager profiles.",
    routePath: "/solutions/organizations/manager-coaching-by-persona",
    duration: "60m",
    icon: UserCog,
  },
  {
    key: "hiring-fit-screen",
    title: "Hiring Fit Screen",
    description: "Evaluate candidate fit before hiring decisions.",
    routePath: "/solutions/organizations/hiring-fit-screen",
    duration: "30m",
    icon: Search,
  },
  {
    key: "leader-coaching-training",
    title: "Leader Coaching & Training",
    description: "Ongoing coaching and training for leaders.",
    routePath: "/solutions/organizations/leader-coaching-training",
    duration: "Varies",
    icon: BookOpen,
  },
  {
    key: "team-performance-sprint",
    title: "Team Performance Sprint",
    description: "Two-month sprint to raise team effectiveness.",
    routePath:
      "/solutions/organizations/team-performance-sprint-4-950-mo-8-12-people-2-months",
    duration: "2 months",
    icon: Rocket,
  },
];

const Organizations = () => {

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
              {organizationServices.map((service) => (
                <Card
                  key={service.key}
                  className="prism-card-hover"
                  data-testid="organization-service"
                >
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <service.icon className="h-6 w-6 text-primary" />
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                    </div>
                    <CardDescription>{service.description}</CardDescription>
                    <p className="text-sm text-muted-foreground">
                      {service.duration}
                      {service.price && ` · ${service.price}`}
                    </p>
                  </CardHeader>
                  <CardContent className="flex gap-2">
                    <Button asChild variant="outline">
                      <Link to={service.routePath}>Learn more</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
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
            <Button variant="hero" size="lg" onClick={() => window.location.href = 'mailto:team@prismpersonality.com?subject=Organization Inquiry'}>
              Talk to Us
            </Button>
            <p className="text-muted-foreground mt-4">Contact form available for organization inquiries</p>
          </div>
        </div>
      </div>
  );
};

export default Organizations;