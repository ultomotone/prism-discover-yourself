import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks, Radio, Sparkles, Workflow, FileSearch } from "lucide-react";

const steps = [
  {
    title: "Collect",
    description:
      "Interviews, long-form podcasts, talks, articles, match footage—transcripts included when available.",
    icon: FileSearch,
  },
  {
    title: "Segment",
    description:
      "Each source is chopped into moments with context tags: Flow, Performative, or Stress.",
    icon: Workflow,
  },
  {
    title: "Signal map",
    description:
      "Behavioral and linguistic tells are mapped to PRISM's eight information elements.",
    icon: Radio,
  },
  {
    title: "Score",
    description:
      "Claims get Light/Moderate/Strong weights. Likelihoods update for all 16 types, producing Proposed Type, Confidence Band, and Top-2 Gap.",
    icon: ListChecks,
  },
  {
    title: "Synthesize",
    description:
      "We publish a dossier—function expression map, evidence ledger, differential diagnosis, and version log.",
    icon: Sparkles,
  },
];

export const TypingLabMethodology = () => {
  return (
    <section id="method" className="prism-container py-16">
      <div className="rounded-3xl border border-primary/20 bg-background/80 p-10 shadow-lg">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="outline" className="mb-4 bg-secondary/10 text-secondary">
            Powered by the PRISM Scoring Engine
          </Badge>
          <h2 className="text-3xl font-semibold text-foreground">
            How typings move from raw footage to a publishable hypothesis
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            We only analyze public material. Every claim ties to a timestamped source. Human review happens on revisions, and all
            dossiers include version history.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-5">
          {steps.map((step) => (
            <Card key={step.title} className="h-full border-border/60 bg-card/70 backdrop-blur">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <step.icon className="h-6 w-6" />
                </div>
                <CardTitle className="mt-4 text-lg font-semibold text-foreground">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 rounded-2xl border border-border/60 bg-muted/20 p-6 text-sm text-muted-foreground">
          We rely on public sources only. No clinical claims. Readers can submit new sources or correction requests, and every
          change is logged.
        </div>
      </div>
    </section>
  );
};
