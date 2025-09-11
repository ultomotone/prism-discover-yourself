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
  Target,
  TrendingUp,
  MessageSquare,
  CheckCircle,
  Compass,
  Map,
  Users,
  Briefcase,
  RefreshCw,
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

export const individualServices: Service[] = [
  {
    key: "personal-discovery",
    title: "Personal Discovery",
    description: "Quick scan of your cognitive signals and next steps.",
    routePath:
      "/solutions/individuals/personal-discovery-20m-29-credit",
    duration: "20m",
    price: "29 credits",
    icon: Compass,
  },
  {
    key: "personality-mapping",
    title: "Personality Mapping",
    description: "Map your PRISM profile with a specialist.",
    routePath:
      "/solutions/individuals/personality-mapping-call",
    duration: "45m",
    icon: Map,
  },
  {
    key: "compatibility-debrief",
    title: "Compatibility Debrief",
    description: "Understand relational dynamics with a partner.",
    routePath:
      "/solutions/individuals/compatibility-debrief-couples",
    duration: "45m",
    icon: Users,
  },
  {
    key: "career-clarity",
    title: "Career Clarity Mapping",
    description: "Align your strengths to your career path.",
    routePath:
      "/solutions/individuals/career-clarity-mapping",
    duration: "60m",
    icon: Briefcase,
  },
  {
    key: "progress-retake",
    title: "Progress Retake & Tune-Up",
    description: "Reassess and calibrate your development.",
    routePath:
      "/solutions/individuals/progress-retake-tune-up",
    duration: "30m",
    icon: RefreshCw,
  },
];

const Individuals = () => {

  const insights = [
    {
      icon: Target,
      title: "See Yourself Clearly",
      description: "Most personality tools stop at telling you what you are. PRISM goes further by showing your cognitive preferences, adaptability, dynamic states, and reactivity levels—giving you a living map of your thinking patterns."
    },
    {
      icon: TrendingUp,
      title: "Make Better Decisions",
      description: "Knowing your PRISM profile helps you recognize what drives your choices, spot when you're operating in stress mode, and choose strategies that let you perform at your best."
    },
    {
      icon: MessageSquare,
      title: "Communicate with Impact",
      description: "By understanding your own information signals and recognizing others', you can adapt your approach for clearer communication, reduce misunderstandings, and build trust faster."
    }
  ];

  const privacyPoints = [
    "Your assessment responses are used only for generating your profile",
    "We never sell or share your data with third parties",
    "You can retake the assessment anytime to see your growth and shifts",
    "All data is encrypted and stored with industry-standard security"
  ];

  return (
    <div className="prism-container pt-24 pb-16">
      <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="prism-heading-lg text-primary mb-6">
              PRISM for Individuals
            </h1>
            <p className="prism-body-lg text-muted-foreground max-w-3xl mx-auto">
              Your personal roadmap for self-awareness, adaptability, and intentional growth. PRISM helps you see the full picture of how your mind works—not just your natural strengths, but how those strengths shift in different states.
            </p>
          </div>

          {/* Recommended Starting Point */}
          <section className="mb-12" aria-label="Recommended starting point">
            <div className="mb-6 text-center">
              <h3 className="text-xl font-semibold text-primary mb-2">🌟 Recommended Starting Point</h3>
              <p className="text-muted-foreground">Not sure which service fits? Start here for personalized guidance.</p>
            </div>
            {(() => {
              const discoveryService = individualServices.find(s => s.key === 'personal-discovery');
              return discoveryService ? (
                <div className="max-w-md mx-auto">
                  <Card className="prism-card-hover ring-2 ring-primary">
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <discoveryService.icon className="h-6 w-6 text-primary" />
                        <CardTitle className="text-lg">{discoveryService.title}</CardTitle>
                      </div>
                      <CardDescription>{discoveryService.description}</CardDescription>
                      <p className="text-sm text-muted-foreground">
                        {discoveryService.duration}
                        {discoveryService.price && ` · ${discoveryService.price}`}
                      </p>
                    </CardHeader>
                    <CardContent className="flex gap-2">
                      <Button asChild variant="outline">
                        <Link to={discoveryService.routePath}>Learn more</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ) : null;
            })()}
          </section>

          {/* All Services */}
          <section className="mb-16" aria-labelledby="services">
            <h2 id="services" className="prism-heading-md text-primary mb-4 text-center">
              All Services
            </h2>
            <p className="prism-body text-muted-foreground text-center mb-8">
              Explore sessions designed for personal clarity.
            </p>
            <div
              className="grid gap-6 sm:grid-cols-2 md:grid-cols-3"
              data-testid="individuals-services"
            >
              {individualServices.map((service) => (
                <Card
                  key={service.key}
                  className="prism-card-hover"
                  data-testid="individual-service"
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

          {/* What PRISM Shows You */}
          <section className="mb-16">
            <h2 className="prism-heading-md text-primary mb-12 text-center">What PRISM Shows You</h2>
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              {insights.map((insight, index) => (
                <Card key={index} className="prism-hover-lift prism-shadow-card">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 prism-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                      <insight.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-primary mb-4">
                      {insight.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {insight.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* What You Get */}
          <Card className="mb-16 prism-shadow-card">
            <CardContent className="p-8">
              <h2 className="prism-heading-md text-primary mb-6 text-center">What You'll Discover</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-4">Your Cognitive Signature</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="w-2 h-2 prism-gradient-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-muted-foreground">The mental signals you rely on most for processing information</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 prism-gradient-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-muted-foreground">How flexible those signals are across different contexts</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 prism-gradient-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-muted-foreground">Your reactivity level and how it colors your expression</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-4">Your Dynamic States</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="w-2 h-2 prism-gradient-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-muted-foreground">How your mental system reorganizes under stress versus flow</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 prism-gradient-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-muted-foreground">Why you may appear "different" on different days</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 prism-gradient-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-muted-foreground">Practical strategies for returning to balance</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grow with Intention */}
          <Card className="mb-16 prism-shadow-card">
            <CardContent className="p-8">
              <h2 className="prism-heading-md text-primary mb-6 text-center">Grow with Intention</h2>
              <p className="prism-body text-muted-foreground text-center max-w-3xl mx-auto mb-8">
                PRISM isn't about putting you in a box—it's about showing you the edges of the box so you can step beyond them.
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 prism-gradient-warm rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-primary mb-2">Development Tips</h3>
                  <p className="text-sm text-muted-foreground">
                    Tailored to your strengths and blind spots
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 prism-gradient-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-primary mb-2">Micro-Practices</h3>
                  <p className="text-sm text-muted-foreground">
                    Small, actionable steps to expand your dimensionality
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 prism-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-primary mb-2">Block Guidance</h3>
                  <p className="text-sm text-muted-foreground">
                    Leverage your Hidden block and manage your Critic block
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Data */}
          <Card className="mb-16 prism-shadow-card">
            <CardContent className="p-8">
              <h2 className="prism-heading-md text-primary mb-6 text-center">Your Privacy, Your Data</h2>
              <p className="prism-body text-muted-foreground text-center max-w-2xl mx-auto mb-6">
                We believe self-knowledge should be safe knowledge:
              </p>
              <div className="max-w-2xl mx-auto">
                {privacyPoints.map((point, index) => (
                  <div key={index} className="flex items-start mb-3">
                    <CheckCircle className="h-5 w-5 text-secondary mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-muted-foreground">{point}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Assessment Expectations */}
          <Card className="mb-16 prism-shadow-card">
            <CardContent className="p-8">
              <h2 className="prism-heading-md text-primary mb-6 text-center">What to Expect from the Assessment</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-600 font-bold">20</span>
                  </div>
                  <h3 className="font-semibold text-primary mb-2">Minutes</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete assessment at your own pace
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-600 font-bold">4</span>
                  </div>
                  <h3 className="font-semibold text-primary mb-2">Methods</h3>
                  <p className="text-sm text-muted-foreground">
                    Multi-method approach for accuracy
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-purple-600 font-bold">✓</span>
                  </div>
                  <h3 className="font-semibold text-primary mb-2">Confidence</h3>
                  <p className="text-sm text-muted-foreground">
                    Honest uncertainty when results are unclear
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center mb-16">
            <Card className="prism-gradient-hero text-white prism-shadow-card">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold mb-4">Ready to Discover Your PRISM?</h2>
                <p className="text-white/90 mb-8 max-w-2xl mx-auto">
                  Get clear insights into your thinking patterns, decision-making style, and growth opportunities.
                </p>
                <Button
                  variant="default"
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-3"
                  asChild
                >
                  <Link to="/assessment">Take the Assessment</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
};

export default Individuals;