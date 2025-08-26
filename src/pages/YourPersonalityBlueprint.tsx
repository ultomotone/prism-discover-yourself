import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Users, 
  Calendar, 
  TrendingUp, 
  MessageSquare, 
  Target,
  ArrowRight,
  Star,
  Clock,
  Shield
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const YourPersonalityBlueprint = () => {
  const navigate = useNavigate();

  const learningItems = [
    "Identify your core type & strengths (MBTI/Enneagram/Socionics)",
    "Use PRISM stress/flow mapping to pick the right action fast", 
    "Scripts for hard conversations & conflict repair",
    "Influence skills: earn buy-in, build trust, lead meetings",
    "Applied habits: weekly micro-challenges + accountability"
  ];

  const membershipFeatures = [
    "Weekly live coaching: Q&A, role-plays, hot seats",
    "Typing Lab: bring a real scenario; leave with a script", 
    "7-Day Sprints: ship a measurable win each week",
    "Templates & tools: prompts, checklists, playbooks",
    "Replays + notes for busy weeks"
  ];

  const howItWorksSteps = [
    "Join (7-day free trial)",
    "Take PRISM Starter (15–20 min) → get provisional type + stress/flow read",
    "Post #FirstGoal (one sentence) so we can coach you",
    "Attend Typing Lab/Q&A, apply the script, ask for feedback",
    "Ship a win in 7 days; share it on the Win Wall"
  ];

  const faqs = [
    {
      question: "Who is this for?",
      answer: "Professionals, creators, and partners who want better communication, conflict repair, and focus—fast."
    },
    {
      question: "How is PRISM different?", 
      answer: "We measure core type and state drift (stress/flow) and coach weekly behavior."
    },
    {
      question: "Time commitment?",
      answer: "~60–90 min/week (Starter + one live session + action)."
    },
    {
      question: "I'm new to typology—OK?",
      answer: "Yes. Start with the Starter and the 7-Day Sprint."
    },
    {
      question: "Where are sessions?",
      answer: "Inside our Skool community (calendar + replays)."
    },
    {
      question: "Can I upgrade to annual?",
      answer: "Yes—unlocks bonus courses instantly."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet 
        title="Your Personality Blueprint — Practical Personality Science (PRISM)"
        meta={[
          {
            name: "description",
            content: "Learn your type, map stress vs flow with PRISM, and ship one measurable win in 7 days. Weekly labs, scripts, and tools. 7-day free trial."
          }
        ]}
      />

      <main className="prism-section">
        <div className="prism-container">
          {/* Hero Section */}
          <div className="text-center space-y-8 mb-16">
            <h1 className="prism-heading-xl text-primary">
              Your Personality Blueprint
            </h1>
            
            <p className="prism-body-lg text-muted-foreground max-w-4xl mx-auto">
              Unlock personal growth with practical personality science. Learn your type (MBTI/Enneagram/Socionics), 
              map stress vs. flow with PRISM, and turn self-awareness into better communication, leadership, 
              and relationships—at work and at home.
            </p>

            {/* Social Proof Bar */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span>129 assessments</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>25 members</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>New wins posted weekly</span>
              </div>
            </div>

            {/* Primary CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="assessment" 
                size="lg" 
                className="group"
                asChild
              >
                <a href="https://www.skool.com/your-personality-blueprint/about?ref=931e57f033d34f3eb64db45f22b1389e" target="_blank" rel="noopener noreferrer">
                  Start your 7-day free trial
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <Button 
                variant="outline-primary" 
                size="lg" 
                onClick={() => navigate('/assessment')}
                className="group"
              >
                Take the PRISM Starter (15–20 min)
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {/* What You'll Learn */}
          <section className="mb-16">
            <Card>
              <CardContent className="p-8">
                <h2 className="prism-heading-lg text-primary mb-6">What you'll learn</h2>
                <div className="grid gap-4">
                  {learningItems.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="prism-body-md">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* What's Inside */}
          <section className="mb-16">
            <Card>
              <CardContent className="p-8">
                <h2 className="prism-heading-lg text-primary mb-6">What's inside (membership)</h2>
                <div className="grid gap-4">
                  {membershipFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Star className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="prism-body-md">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* How It Works */}
          <section className="mb-16">
            <Card>
              <CardContent className="p-8">
                <h2 className="prism-heading-lg text-primary mb-6">How it works</h2>
                <div className="space-y-6">
                  {howItWorksSteps.map((step, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <Badge variant="outline" className="text-sm font-medium min-w-[2rem] h-8 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <span className="prism-body-md flex-1">{step}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-800 dark:text-green-200">Guarantee</p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Ship one measurable win in 7 days or your first month is free.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Pricing */}
          <section className="mb-16">
            <Card>
              <CardContent className="p-8 text-center">
                <h2 className="prism-heading-lg text-primary mb-6">Pricing</h2>
                <div className="space-y-4">
                  <div className="text-4xl font-bold text-primary">
                    $19<span className="text-lg text-muted-foreground">/mo</span> or $180<span className="text-lg text-muted-foreground">/yr</span>
                  </div>
                  <p className="text-sm text-muted-foreground">(cancel anytime)</p>
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <p className="font-medium">Annual bonus</p>
                    <p className="text-sm text-muted-foreground">
                      includes PRISM Fundamentals ($147) + AI Foundations (member bonus)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Why Section */}
          <section className="mb-16">
            <Card>
              <CardContent className="p-8">
                <h2 className="prism-heading-lg text-primary mb-6">Why Your Personality Blueprint</h2>
                <p className="prism-body-md text-muted-foreground">
                  Over a decade applying MBTI, Socionics, Enneagram, and Attachment in sales and coaching. 
                  PRISM adds state dynamics (stress/flow) so results match real life—not just theory.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* FAQ */}
          <section className="mb-16">
            <h2 className="prism-heading-lg text-primary mb-8 text-center">FAQ</h2>
            <div className="grid gap-6">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-primary mb-3">{faq.question}</h3>
                    <p className="prism-body-md text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Final CTA */}
          <section className="text-center space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="assessment" 
                size="lg" 
                className="group"
                asChild
              >
                <a href="https://www.skool.com/your-personality-blueprint/about?ref=931e57f033d34f3eb64db45f22b1389e" target="_blank" rel="noopener noreferrer">
                  Start your 7-day free trial
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <Button 
                variant="outline-primary" 
                size="lg" 
                onClick={() => navigate('/assessment')}
                className="group"
              >
                Take PRISM Starter
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default YourPersonalityBlueprint;