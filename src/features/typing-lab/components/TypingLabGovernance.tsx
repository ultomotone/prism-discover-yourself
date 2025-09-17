import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const points = [
  {
    title: "Signals we track",
    body: "Time-horizon language (Ni/Ne), outcome vs. values framing (Te/Fi), emotional broadcast vs. reserve (Fe/Ti), sensory/action cues (Se/Si).",
  },
  {
    title: "Revisions & submissions",
    body: "See something new? Send a public source or correction request. We re-run scoring and log every change.",
  },
  {
    title: "Ethics",
    body: "Educational use only. No clinical language, no private data, no labels without evidence you can audit yourself.",
  },
];

const faqs = [
  {
    q: "Is this MBTI?",
    a: "No. We use Socionics/PRISM language—information elements, dimensionality, overlays. No four-letter equivalence tables.",
  },
  {
    q: "Do you analyze private data?",
    a: "Never. Every source is public and linked. We remove items if a source is corrected or pulled.",
  },
  {
    q: "Can typings change?",
    a: "Yes. New evidence updates the likelihood model. Version logs show what changed and when.",
  },
];

export const TypingLabGovernance = () => {
  return (
    <section className="prism-container py-16">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Badge variant="outline" className="bg-primary/10 text-primary">
            Method & ethics
          </Badge>
          <h2 className="text-3xl font-semibold text-foreground">
            How we keep the Typing Lab credible
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {points.map((item) => (
              <Card key={item.title} className="h-full border-border/60 bg-background/80">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-foreground">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-6 text-sm text-muted-foreground">
            Want to contribute evidence? Email <a className="text-primary" href="mailto:typinglab@prism.gg">typinglab@prism.gg</a> or
            submit a pull request with a timestamped source. Every update triggers a re-run of the scoring engine.
          </div>
        </div>
        <div className="space-y-4 rounded-3xl border border-border/60 bg-background/80 p-6">
          <h3 className="text-lg font-semibold text-foreground">FAQ</h3>
          <div className="space-y-4">
            {faqs.map((item) => (
              <div key={item.q}>
                <p className="text-sm font-semibold text-foreground">{item.q}</p>
                <p className="text-sm text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
          <div className="pt-4 text-sm text-muted-foreground">
            Curious about deeper definitions? Explore the <Link to="/signals" className="text-primary">information elements overview</Link>
            or review the <Link to="/how-it-works" className="ml-1 text-primary">assessment methodology</Link>.
          </div>
        </div>
      </div>
    </section>
  );
};
