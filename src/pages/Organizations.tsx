import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, MessageSquare, TrendingUp, Target } from "lucide-react";
import CalInline from "@/components/CalInline";

const Organizations = () => {
  const sessions = [
    { title: "Owner/Leader Discovery (20m)", slug: "owner-leader-discovery-20m-49-credit" },
    { title: "Team Compass Workshop (90m)", slug: "team-compass-workshop-group-up-to-8" },
    { title: "Leadership Debrief (60m)", slug: "leadership-debrief" },
    { title: "Sales Persona Play (45m)", slug: "sales-persona-play" },
    { title: "Manager: Coaching by Persona (60m)", slug: "manager-coaching-by-persona" },
    { title: "Hiring Fit Screen (30m)", slug: "hiring-fit-screen" },
    { title: "Team Performance Sprint (2 Months)", slug: "team-performance-sprint-4-950-mo-8-12-people-2-months" },
  ];

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

          {/* Book a Session */}
          <section className="mb-16" aria-labelledby="book-org">
            <h2 id="book-org" className="prism-heading-md text-primary mb-4 text-center">Book a Session</h2>
            <p className="prism-body text-muted-foreground text-center mb-8">Choose any session below—booking happens right on this page.</p>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {sessions.map((e) => (
                <article key={e.slug} className="rounded-2xl border p-4 shadow-sm">
                  <h3 className="font-medium text-primary">{e.title}</h3>
                  <div className="mt-4">
                    <CalInline calLink={`daniel-speiss/${e.slug}`} selector={`#cal-${e.slug}`} />
                  </div>
                </article>
              ))}
            </div>
            <p className="text-center mt-8">
              <a className="underline" href="/book">See all sessions →</a>
            </p>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Bookings are processed securely via Cal.com; availability updates live.
            </p>
          </section>

          {/* Service Details Links */}
          <section className="mb-16" aria-labelledby="org-services">
            <h2 id="org-services" className="prism-heading-md text-primary mb-4 text-center">
              Service Details
            </h2>
            <p className="prism-body text-muted-foreground text-center mb-8">
              Learn more about what each session includes.
            </p>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {sessions.map((e) => (
                <a
                  key={e.slug}
                  href={`/solutions/organizations/${e.slug}`}
                  className="rounded-2xl border p-4 text-center hover:bg-accent/50 prism-transition"
                >
                  {e.title}
                </a>
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